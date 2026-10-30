// import { PrismaClient } from "../generated/prisma";
// import { IFileRepo } from "../interface/file.interface";

// export class FileRepository implements IFileRepo {
//     private static instance: FileRepository
//     private client: PrismaClient

//     constructor(client:PrismaClient) {
//         this.client=client
//     }

//     static getInstance(client:PrismaClient) {
//         if (!FileRepository.instance) {
//             FileRepository.instance = new FileRepository(client);
//         }
//         return FileRepository.instance
//     }

//     getUser = async (id: number) => {
//         return await this.client.user.findUnique({
//             where: { id },
//             select: { id: true },
//         });
//     }

//     findLinkByTokenAndUserId = async (token: string, userId: number) => {
//         return this.client.link.findFirst({
//             where: { token, userId },
//         });
//     }

//     findFileByIdUserIdAndLinkId = async (fileId: number, userId: number, linkId: number) => {
//         return this.client.file.findFirst({
//             where: { id: fileId, userId, uploadLinkId: linkId },
//         });
//     }

//     storageUsed = async (userId: number) => {
//         return this.client.file.aggregate({
//             where: {
//                 userId
//             },
//             _sum: {
//                 size: true
//             }
//         })
//     }

//     createFileAndUpdateLink = async ({ url, name, size }: { url: string, name: string, size: number }, linkId: number, userId: number) => {
//         return await this.client.$transaction([
//             this.client.file.create({
//                 data: {
//                     url,
//                     name,
//                     size: BigInt(size),
//                     userId,
//                     uploadLinkId: linkId,
//                 },
//             }),
//             this.client.link.update({
//                 where: { id: linkId },
//                 data: {
//                     uploadCount: { increment: 1 },
//                 },
//             }),
//         ]);
//     }

//     getFiles = async (linkId: number, userId: number, skip: number, limit: number) => {
//         return await this.client.file.findMany({
//             where: {
//                 uploadLinkId: linkId,
//                 userId: userId,
//             },
//             skip,
//             take: limit,
//             orderBy: { createdAt: 'desc' }
//         })
//     }
// }
