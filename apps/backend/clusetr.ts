// import cluster from 'cluster';
// import * as os from 'os';
// import app from './app';
// import CleanupService from './src/service/cleanup.service';
// import { redis } from './src/config/redis';
// import IpLogger from './src/service/ipLogger';
// import { deleteQueue } from './src/bullmq/queue/delete-files.queue';
// import { prisma } from './src/config/db';
// import { serve } from 'bun';
// import { LinkRepository } from './src/repository/link.repo';
// import { DeletedFileRepository } from './src/repository/deleted.file.repo';

// const port = process.env.PORT || 8000;

// const cpus = os.cpus().length;

// if (cluster.isPrimary) {
//     console.log(`Primary ${process.pid} is running`);

//     for (let i = 0; i < cpus; i++) {
//         cluster.fork();
//     }

//     cluster.on('exit', (worker, code, signal) => {
//         console.log(`Worker ${worker.process.pid} died. Restarting...`);
//         cluster.fork();
//     });
// } else {
//     startServer()
//         .catch(err => {
//             console.error("Failed to start server:", err);
//             process.exit(1);
//         });
// }

// async function startServer() {

//     if (process.env.NODE_ENV === "development") {
//         await redis.flushall();
//         await redis.flushdb();

//         // prisma.ipLog.deleteMany()
//         // prisma.file.deleteMany()
//         // prisma.link.deleteMany()
//         // await prisma.user.deleteMany()
//     }

//     const prismLinkRepo = LinkRepository.getInstance()
//     const prismaDeletedFileRepo = DeletedFileRepository.getInstance()

//     const cleanup = CleanupService
//         .getInstance(prismLinkRepo, prismaDeletedFileRepo)
//         .LinkCleanup();

//     cleanup.addQueue(10);
//     cleanup.runInterval("10m");
//     cleanup.runWoker();

//     IpLogger.getInstance().runWorker()
//     IpLogger.getInstance().runInterval()

//     pushPendingFilesToQueue().catch(err =>
//         console.error("Failed to requeue deleted files:", err)
//     );

//     serve({
//         port,
//         fetch: app.fetch,
//     });

//     console.log(`Listening on http://localhost:${port}`);
// }

// async function pushPendingFilesToQueue() {

//     let totalExpiredFiles = await prisma.deletedFile.count({
//         where: { status: 'PENDING' },
//     })
//     console.log(`[Recovery] Found ${totalExpiredFiles} pending deleted files.`);

//     let offset = 0;
//     const BATCH_SIZE = 50;

//     while (totalExpiredFiles > 0) {
//         const limit = Math.min(BATCH_SIZE, totalExpiredFiles)
//         const files = await prisma.deletedFile.findMany({
//             where: { status: 'PENDING' },
//             take: limit,
//             skip: offset,
//             select: {
//                 linkId: true,
//                 fileUrl: true,
//                 fileId: true,
//             },
//         });

//         const grouped = new Map<number, { id: number, url: string }[]>();
//         for (const file of files) {
//             const group = grouped.get(file.linkId) || [];
//             group.push({ id: file.fileId, url: file.fileUrl });
//             grouped.set(file.linkId, group);
//         }

//         for (const [linkId, files] of grouped) {
//             deleteQueue.add('delete-files', { linkId, files });
//         }

//         totalExpiredFiles = totalExpiredFiles - limit
//         offset = offset + limit
//         console.log(`[Recovery] Requeued ${files.length} pending deleted files.`);
//     }
// }
