import { Job, Worker } from "bullmq";
import { redis } from "../../../config/redis";
import { storageService } from "@/container";
import { createDBClient } from "../../../config/db";
import { DrizzleClient } from "../../../repository/drizzle-repo/user.drizzle";
import { deletedFiles } from "../../../db";
import { and, eq } from "drizzle-orm";

interface FileItem {
    id: string;
    url: string;
}


// console.log("\nstarting delete file worker\n")
// new Worker("delete-queue", async (job: Job) => {
//     try {
//         const { data } = job
//         const { linkId, files } = data
//         await deleteFiles(files, linkId)
//     } catch (error) {
//         console.log('file deletion failed', error)
//     }
// },
//     {
//         connection: redis,
//         maxStalledCount: 2,
//         limiter: { max: 5, duration: 1000 },
//         concurrency: 3
//     }
// )

export async function deleteFiles(files: FileItem[], linkId: string) {
    const db = createDBClient('drizzle') as DrizzleClient
    const updatePromises = [];

    for (const file of files) {
        try {

            // deleteFiles reports failure by returning false rather than throwing. Throw here
            // so the row is marked FAILED and the recovery sweep retries it.
            const deleted = await storageService.deleteFiles([{ id: file.id, url: file.url }])
            if (deleted === false) {
                throw new Error(`Storage delete failed for ${file.url}`)
            }
            redis.del(`signed-url:${file.id}`).catch((err) => {
                console.error(`Failed to delete redis cache for file ${file.id}:`, err)
            })
            updatePromises.push(
                db
                    .update(deletedFiles)
                    .set({
                        status: 'DELETED',
                        deletedAt: new Date()
                    })
                    .where(
                        eq(deletedFiles.fileId, file.id)
                    )

            );
        } catch (err:any) {
            if (
                err.code === "NoSuchKey" ||
                err.statusCode === 404 ||
                err.statusCode === 204
            ) {
                updatePromises.push(
                    db
                        .update(deletedFiles)
                        .set({
                            status: 'DELETED',
                            deletedAt: new Date()
                        })
                        .where(
                            and(
                                eq(deletedFiles.fileId, file.id),
                                eq(deletedFiles.linkId, linkId)
                            )
                        )
                    // db.deletedFile.updateMany({
                    //     where: {
                    //         fileId: file.id,
                    //         linkId: linkId,
                    //     },
                    //     data: {
                    //         status: "DELETED",
                    //         deletedAt: new Date(),
                    //     },
                    // })
                );
            }
            else {
                updatePromises.push(
                    db
                        .update(deletedFiles)
                        .set({
                            status: 'FAILED',
                            deletedAt: new Date()
                        })
                        .where(
                            and(
                                eq(deletedFiles.fileId, file.id),
                                eq(deletedFiles.linkId, linkId)
                            )
                        )
                    // db.deletedFile.updateMany({
                    //     where: {
                    //         fileId: file.id,
                    //         linkId: linkId,
                    //     },
                    //     data: {
                    //         status: "FAILED",
                    //     },
                    // })
                );
            }
        }
    }

    await Promise.all(updatePromises)
}