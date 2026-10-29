// import { deleteQueue } from "../queue/bullmq/queue/delete-files.queue";
// import { DrizzleClient } from "../repository/user.drizzle";

// export const cleanupExpiredLinks = async (db?: DrizzleClient) => {
//     try {
//         let totalLinks = await db.link.count({
//             where: {
//                 expiresAt: { lt: new Date() },
//             },
//         })

//         let offset = 0;
//         const BATCH_SIZE = 50;

//         while (totalLinks > 0) {
//             const limit = Math.min(BATCH_SIZE, totalLinks)

//             const expiredLinks = await db.link.findMany({
//                 where: {
//                     expiresAt: { lt: new Date() },
//                 },
//                 include: { files: true },
//                 take: limit,
//                 skip: offset
//             })

//             if (expiredLinks.length === 0) {
//                 break;
//             }

//             await Promise.all(expiredLinks.map(async (link) => {
//                 const files = link.files
//                 const fileUrls = files.map(file => file.url)

//                 if (fileUrls.length > 0) {
//                     await db.deletedFile.createMany({
//                         data: files.map((file) => ({
//                             fileId: file.id,
//                             linkId: link.id,
//                             fileUrl: file.url,
//                             status: 'PENDING',
//                         }))
//                     })
//                     await deleteQueue.add('delete-queue', {
//                         linkId: link.id,
//                         files: files.map(file => ({
//                             id: file.id,
//                             url: file.url
//                         }))
//                     });
//                 }

//                 await db.link.delete({ where: { id: link.id } })

//             }))

//             totalLinks = totalLinks - limit
//             offset = offset + limit
//             console.log(`Remaining expired links: ${totalLinks}`);
//         }
//     } catch (error) {
//         console.error('error while cleaning up expired links', error)
//     }
// }

// // cleanupExpiredLinks()
// // console.log('clean up job scheduled')

// // setInterval(cleanupExpiredLinks, 10 * 60 * 1000);

// // let runLoop = true

// // while (runLoop) {
// //     // to break the loop
// //     console.log("\nBEFORE COUNT ", GLOBAL_EXPIRED_LINK_COUNT)
// //     if (GLOBAL_EXPIRED_LINK_COUNT < 0 || GLOBAL_EXPIRED_LINK_COUNT === 0) {
// //         runLoop = false
// //         break;
// //     }

// //     const limit = GLOBAL_EXPIRED_LINK_COUNT < 50 ? GLOBAL_EXPIRED_LINK_COUNT : 50
// //     console.log('LIMIT ', limit)
// //     GLOBAL_EXPIRED_LINK_COUNT = GLOBAL_EXPIRED_LINK_COUNT - limit

// //     console.log("GLOBAL COUNT ", GLOBAL_EXPIRED_LINK_COUNT)
// // }
