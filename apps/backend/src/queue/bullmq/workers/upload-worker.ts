// import { Worker } from "bullmq";
// import { uploadFileToS3 } from "../utils/s3uploader";
// import { prisma } from "../config/db";
// import { redis } from "../config/redis";

// new Worker(
//     'file-upload',
//     async (job) => {
//         let { file, filename, type, size, userId, linkId } = job.data

//         file = Buffer.from(file.data)
//         file.type = type
//         file.size = size
//         file.name = filename

//         const { url } = await uploadFileToS3(file, userId);

//         await Promise.all([
//             prisma.file.create({
//                 data: {
//                     url,
//                     userId,
//                     uploadLinkId: linkId,
//                     type,
//                     size,
//                 },
//             }),
//             prisma.link.update({
//                 where: { id: linkId },
//                 data: {
//                     uploadCount: { increment: 1 },
//                 },
//             }),
//             redis.incr(`upload:count:${linkId}`),
//         ]);
//     },
//     {
//         connection: redis,
//         concurrency: 3
//     }
// )
