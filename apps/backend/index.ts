import { redis } from "@/config/redis";
import { cleanupService } from "@/container";
import { startServer } from "./serve";

export async function pushPendingFilesToQueue() {
    await cleanupService.requeuePendingAndFailedFiles();
}

if (process.env.NODE_ENV === "development") {
    await redis.flushall();
    await redis.flushdb();
}

// 1. Start BullMQ background worker for file deletion jobs
cleanupService.run_delete_file_worker();

// 2. Schedule periodic task intervals (with distributed locking)
cleanupService.runLinkCleanupInterval(process.env.CLEANUP_INTERVAL ?? "10m");
cleanupService.runFileRecoveryInterval(process.env.FILE_RECOVERY_INTERVAL ?? "10m");
cleanupService.runAbandonedUploadCleanupInterval(process.env.ABANDONED_UPLOAD_CLEANUP_INTERVAL ?? "10m");

// 3. Instant recovery check on server boot
cleanupService.requeuePendingAndFailedFiles()
    .catch(err => console.error("[Recovery] Failed initial requeue on startup:", err));

cleanupService.cleanupAbandonedUploads()
    .catch(err => console.error("[Cleanup] Failed initial abandoned upload sweep on startup:", err));

startServer()
    .catch(err => {
        console.error('[Server] Failed to start:', err);
        process.exit(1);
    });
