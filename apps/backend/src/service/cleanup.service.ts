import { cleanupQueue } from "../queue/bullmq/queue/cleanup-queue";
import { deleteQueue } from "../queue/bullmq/queue/delete-files.queue";
import { Job, Worker } from "bullmq";
import { ILinkRepo } from "../interface/link.interface";
import { IDeleteFileRepo } from "../interface/delete-file.interface";
import { deleteFiles } from "../queue/bullmq/workers/delete-files.worker";
import { ICache } from "../interface/cache.interface";
import { IFileRepo } from "../interface/file.interface";
import { redis } from "../config/redis";
import { PENDING_UPLOAD_BATCH_SIZE } from "../../constant";

export default class CleanupService {
    private static instance: CleanupService;

    constructor(
        private linkRepository: ILinkRepo,
        private deletedFileRepo: IDeleteFileRepo,
        private fileRepository: IFileRepo,
        private cache: ICache
    ) {}

    public static getInstance(
        linkRepository: ILinkRepo,
        deletedFileRepo: IDeleteFileRepo,
        fileRepository: IFileRepo,
        cache: ICache
    ): CleanupService {
        if (!CleanupService.instance) {
            CleanupService.instance = new CleanupService(linkRepository, deletedFileRepo, fileRepository, cache);
        }
        return CleanupService.instance;
    }

    /**
     * Executes a task exclusively across distributed server nodes using a Redis lock.
     */
    private async runExclusive(lockName: string, fn: () => Promise<void>, intervalMs: number = 60_000) {
        const lockKey = `lock:${lockName}`;
        const lockTtlMs = Math.min(Math.floor(intervalMs * 0.9), 10 * 60 * 1000);
        const acquired = await this.cache.setWithOptions(lockKey, "locked", { PX: lockTtlMs, NX: true });
        
        if (!acquired) {
            console.warn(`[Cleanup] Skipped: '${lockName}' is already in progress by another instance.`);
            return;
        }

        try {
            await fn();
        } catch (error) {
            console.error(`[Cleanup] Error in guarded execution for '${lockName}':`, error);
        } finally {
            await this.cache.del(lockKey);
        }
    }

    parseInterval = (value: string): number => {
        const match = value.match(/^(\d+)(s|m|h)$/);
        if (!match) throw new Error("Invalid interval format. Use '10s', '5m', or '1h'.");

        const [, amountStr, unit] = match;
        const amount = parseInt(amountStr, 10);

        switch (unit) {
            case 's': return amount * 1000;
            case 'm': return amount * 60 * 1000;
            case 'h': return amount * 60 * 60 * 1000;
            default: throw new Error("Unsupported time unit.");
        }
    };

    /**
     * Generic runner to schedule any task function on a specified interval with distributed locking.
     */
    public runTaskInterval = (
        taskName: string,
        taskFn: () => Promise<void>,
        interval: string = "10m"
    ): NodeJS.Timeout => {
        const intervalMs = this.parseInterval(interval);
        return setInterval(async () => {
            await this.runExclusive(taskName, taskFn, intervalMs);
        }, intervalMs);
    };

    /**
     * Schedules periodic expired links cleanup.
     */
    public runLinkCleanupInterval = (interval = "10m") => {
        return this.runTaskInterval("cleanup-expired-links", this.cleanupExpiredLinks, interval);
    };

    /**
     * Schedules periodic recovery for pending/failed deleted files.
     */
    public runFileRecoveryInterval = (interval = "10m") => {
        return this.runTaskInterval("requeue-pending-failed-files", this.requeuePendingAndFailedFiles, interval);
    };

    /**
     * Schedules periodic cleanup of uploads that were presigned but never confirmed.
     */
    public runAbandonedUploadCleanupInterval = (interval = "10m") => {
        return this.runTaskInterval("cleanup-abandoned-uploads", this.cleanupAbandonedUploads, interval);
    };

    // Backward compatibility alias for runLinkCleanupInterval
    public runInterval = async (interval = "10m") => {
        this.runLinkCleanupInterval(interval);
    };

    public addQueue = async (minute: number = 10) => {
        await cleanupQueue.add(
            "cleanup-expired-links",
            {},
            {
                repeat: { every: minute * 60 * 1000 },
                removeOnComplete: true,
            }
        );
    };

    public runWorker = async () => {
        new Worker('cleanup', async () => {
            await this.runExclusive("cleanup-expired-links", this.cleanupExpiredLinks);
        }, { connection: redis as any });
    };

    public run_delete_file_worker = () => {
        console.log("\nStarting delete file worker\n");
        new Worker("delete-queue", async (job: Job) => {
            try {
                const { data } = job;
                const { linkId, files } = data;
                await deleteFiles(files, linkId);
            } catch (error) {
                console.log('File deletion failed', error);
            }
        },
            {
                connection: redis as any,
                maxStalledCount: 2,
                limiter: { max: 5, duration: 1000 },
                concurrency: 3
            }
        );
    };

    public LinkCleanup() {
        return {
            runWoker: this.runWorker,
            runInterval: this.runInterval,
            addQueue: this.addQueue
        };
    }

    /**
     * Sweeps deleted_files DB table for PENDING or FAILED records and requeues them to BullMQ.
     */
    public requeuePendingAndFailedFiles = async () => {
        await this.requeueFilesByStatus('PENDING');
        await this.requeueFilesByStatus('FAILED');
    };

    private requeueFilesByStatus = async (status: 'PENDING' | 'FAILED') => {
        try {
            let total = await this.deletedFileRepo.findExpiredLinkCount(status);
            if (total === 0) return;

            console.log(`[Recovery] Found ${total} ${status} deleted files.`);
            let offset = 0;
            const BATCH_SIZE = 100;

            while (total > 0) {
                const limit = Math.min(BATCH_SIZE, total);
                const files = await this.deletedFileRepo.findExpiredFiles(status, limit, offset);

                if (files.length === 0) break;

                const grouped = new Map<string, { id: string; url: string }[]>();
                for (const file of files) {
                    const group = grouped.get(file.linkId) || [];
                    group.push({ id: file.fileId, url: file.fileUrl });
                    grouped.set(file.linkId, group);
                }

                for (const [linkId, groupedFiles] of grouped) {
                    await deleteQueue.add('delete-queue', { linkId, files: groupedFiles });
                }

                total = total - limit;
                offset = offset + limit;
                console.log(`[Recovery] Requeued ${files.length} ${status} deleted files.`);
            }
        } catch (error) {
            console.error(`[Recovery] Error requeuing ${status} files:`, error);
        }
    };

    /**
     * Sweeps File rows that were reserved for a presigned upload and never confirmed.
     *
     * A row goes PENDING when /upload-url hands out a presigned PUT and CONFIRMED when
     * the client calls /notify-upload. If the client uploads the object and then walks
     * away, nothing ever confirms it -- the object sits in the bucket and is billed
     * forever. Once the reservation's expiresAt has passed, the object is presumed
     * orphaned and goes through the same delete pipeline as any other removed file.
     *
     * Reads a batch at a time and always re-reads from the head, because each batch is
     * deleted before the next read.
     */
    public cleanupAbandonedUploads = async () => {
        // Bounds the sweep so one run cannot spin on a backlog (or on rows that keep
        // failing to delete) and hold the distributed lock past its TTL.
        const MAX_BATCHES = 50;

        try {
            let swept = 0;

            for (let batch = 0; batch < MAX_BATCHES; batch++) {
                const expired = await this.fileRepository.find_expired_pending_files(PENDING_UPLOAD_BATCH_SIZE);

                if (expired.length === 0) break;

                // Only sweep rows we actually managed to delete. A row confirmed between
                // the read and the delete stays put, and we must not queue it for S3
                // deletion -- it is a real file now.
                const deletedIds = new Set(
                    await this.fileRepository.delete_pending_files_by_ids(expired.map(file => file.id))
                );
                const reclaimed = expired.filter(file => deletedIds.has(file.id));

                if (reclaimed.length === 0) {
                    // Everything in this batch was confirmed out from under us. Nothing
                    // left to do, and re-reading would return the same rows.
                    break;
                }

                // The delete worker is driven per link, so group before enqueueing.
                const grouped = new Map<string, { id: string; url: string }[]>();
                for (const file of reclaimed) {
                    const group = grouped.get(file.uploadLinkId) || [];
                    group.push({ id: file.id, url: file.url });
                    grouped.set(file.uploadLinkId, group);
                }

                for (const [linkId, groupedFiles] of grouped) {
                    try {
                        // Tracking rows first: if the enqueue below is lost, the recovery
                        // sweep picks these up as PENDING deletions and retries.
                        await this.deletedFileRepo.createMany(groupedFiles, linkId);
                        await deleteQueue.add('delete-queue', { linkId, files: groupedFiles });
                    } catch (error) {
                        // The File rows are already gone, so nothing will reference these
                        // keys again. Log them so they can be reclaimed by hand.
                        console.error(
                            `[Cleanup] Failed to queue abandoned uploads for link ${linkId}. Orphaned objects:`,
                            groupedFiles.map(file => file.url),
                            error
                        );
                    }
                }

                swept += reclaimed.length;
                console.log(`[Cleanup] Reclaimed ${reclaimed.length} abandoned uploads.`);

                // A short batch means we have drained the backlog.
                if (expired.length < PENDING_UPLOAD_BATCH_SIZE) break;
            }

            if (swept > 0) {
                console.log(`[Cleanup] Queued ${swept} abandoned uploads for deletion.`);
            }
        } catch (error) {
            console.error('[Cleanup] Error while cleaning up abandoned uploads:', error);
        }
    };

    /**
     * Sweeps database for expired links, records files into deleted_files, enqueues to deleteQueue, and deletes link.
     */
    public cleanupExpiredLinks = async () => {
        try {
            let totalLinks = await this.linkRepository.expired_link_count();

            let offset = 0;
            const BATCH_SIZE = 50;

            while (totalLinks > 0) {
                const limit = Math.min(BATCH_SIZE, totalLinks);
                const expiredLinks = await this.linkRepository.find_expired_links(limit, offset);

                if (expiredLinks.length === 0) {
                    break;
                }

                await Promise.all(expiredLinks.map(async (link) => {
                    const files = link.files;
                    const fileUrls = files.map(file => file.url);

                    if (fileUrls.length > 0) {
                        await this.deletedFileRepo.createMany(files, link.id);
                        await deleteQueue.add('delete-queue', {
                            linkId: link.id,
                            files: files.map(file => ({
                                id: file.id,
                                url: file.url
                            }))
                        });
                    }

                    await this.linkRepository.delete_link_by_id(link.id);
                }));

                totalLinks = totalLinks - limit;
                offset = offset + limit;
                console.log(`Remaining expired links: ${totalLinks}`);
            }
        } catch (error) {
            console.error('Error while cleaning up expired links:', error);
        }
    };
}