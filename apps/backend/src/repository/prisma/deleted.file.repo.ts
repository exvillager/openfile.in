// import { PrismaClient } from "../generated/prisma";
// import { IDeleteFileRepo } from "../interface/delete-file.interface";

// export class DeletedFileRepository implements IDeleteFileRepo {
//     private static instance: DeletedFileRepository
//     private client: PrismaClient

//     constructor(client: PrismaClient) {
//         this.client = client
//     }

//     static getInstance(client: PrismaClient) {
//         if (!DeletedFileRepository.instance) {
//             DeletedFileRepository.instance = new DeletedFileRepository(client);
//         }
//         return DeletedFileRepository.instance
//     }

//     createMany = async (files: any, linkId: number) => {
//         return await this.client.deletedFile.createMany({
//             data: files.map((file) => ({
//                 fileId: file.id,
//                 linkId,
//                 fileUrl: file.url,
//                 status: 'PENDING',
//             }))
//         })
//     }

//     findExpiredLinkCount = async (type: 'PENDING' | 'DELETED' | 'FAILED' = 'PENDING') => {
//         let totalExpiredFiles = await this.client.deletedFile.count({
//             where: { status: type },
//         })
//         return totalExpiredFiles;
//     }

//     findExpiredFiles = async (type: 'PENDING' | 'DELETED' | 'FAILED' = 'PENDING', limit: number, offset: number) => {
//         return await this.client.deletedFile.findMany({
//             where: { status: type },
//             take: limit,
//             skip: offset,
//             select: {
//                 linkId: true,
//                 fileUrl: true,
//                 fileId: true,
//             },
//         });
//     }

// }
