import { Queue } from "bullmq";
import { redis } from "../../../config/redis";

export const deleteQueue = new Queue("delete-queue", {
    connection: redis,
    // Completed jobs are not needed once the DeletedFile row records the outcome.
    defaultJobOptions: { removeOnComplete: true, removeOnFail: 1000 },
})

/**
 * Queues one job per file, deduplicated on the file id. The recovery sweep requeues
 * every PENDING row, so without this a file already waiting in the queue would get a
 * second job. The dedup id is released once the job finishes, so a FAILED row can
 * still be retried later.
 */
export const enqueueFileDeletes = (linkId: string, files: { id: string; url: string }[]) =>
    deleteQueue.addBulk(files.map(file => ({
        name: 'delete-queue',
        data: { linkId, files: [{ id: file.id, url: file.url }] },
        opts: { deduplication: { id: `delete-file:${file.id}` } },
    })))
