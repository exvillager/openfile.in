// import { PrismaClient } from "../generated/prisma";
// import { ILinkRepo } from "../interface/link.interface";
// import { ONE_DAY } from "../service/link.service";

// export class LinkRepository implements ILinkRepo{
//     private static instance: LinkRepository
//     private client: PrismaClient;

//     constructor(client: PrismaClient) {
//         this.client = client;
//     }

//     static getInstance(client: PrismaClient) {
//         if (!LinkRepository.instance) {
//             LinkRepository.instance = new LinkRepository(client);
//         }
//         return LinkRepository.instance
//     }

//     findLinkByIdAndUser = async (linkId: number, userId: number) => {
//         return await this.client.link.findFirst({
//             where: { id: linkId, userId },
//             select: {
//                 id: true,
//                 token: true,
//                 files: {
//                     select: {
//                         url: true,
//                         id: true,
//                     }
//                 }
//             }
//         });
//     }

//     findLinkByTokenAndUserId = async (token: string, userId: number) => {
//         return this.client.link.findFirst({
//             where: { token, userId },
//         });
//     }

//     findLinkByToken = async (token: string) => {
//         return await this.client.link.findFirst({
//             where: {
//                 token
//             }
//         })
//     }

//     FindLinkWithTokenIvAndKey = async (token: string) => {
//         return this.client.link.findFirst({
//             where: {
//                 token: token
//             }
//         })
//     }

//     findFilesForLink = async (linkId: number, userId: number) => {
//         return this.client.file.findMany({
//             where: { uploadLinkId: linkId, userId },
//         });
//     }

//     deleteFilesForLink = async (linkId: number, userId: number) => {
//         return this.client.file.deleteMany({
//             where: { uploadLinkId: linkId, userId },
//         });
//     }

//     deleteLink = async (linkId: number, userId: number) => {
//         return this.client.link.delete({
//             where: { id: linkId, userId },
//         });
//     }

//     delete_link_by_id = async (id: number) => {
//         return await this.client.link.delete({ where: { id } })
//     }

//     findLinkWithFilesByTokenAndUserId = async (linkId: number, token: string, userId: number, skip: number, limit: number) => {
//         return await this.client.link.findFirst({
//             where: {
//                 id: linkId,
//                 userId,
//                 token
//             },
//             select: {
//                 id: true,
//                 files: {
//                     skip,
//                     take: limit,
//                     select: {
//                         id: true,
//                         name: true,
//                         url: true,
//                         size: true,
//                         createdAt: true
//                     }
//                 }
//             }
//         });
//     }

//     findUserLinks = async (userId: number, query: string, skip: number, limit: number) => {
//         return await this.client.link.findMany({
//             where: {
//                 userId,
//                 OR: [
//                     { name: { contains: query } },
//                     { token: { contains: query } }
//                 ]
//             },
//             skip,
//             take: limit,
//             select: {
//                 id: true,
//                 name: true,
//                 token: true,
//                 createdAt: true,
//                 maxUploads: true,
//                 expiresAt: true,
//                 uploadCount: true
//             },
//             orderBy: {
//                 createdAt: 'desc'
//             }
//         });
//     }

//     findLinkUploadCount = async (linkId: number) => {
//         return await this.client.link.findUnique({
//             where: { id: linkId },
//             select: { uploadCount: true },
//         });
//     }

//     FindUserLinksCount = async (userId: number) => {
//         return await this.client.link.count({ where: { userId } })
//     }

//     createLink = async (
//         {
//             finalMaxUploads,
//             token,
//             expireAfterFirstUpload,
//             finalExpiration,
//             name = '',
//             userId,
//             shouldResetLinkCountExpiration,
//             now,
//             linkCountexpireAt
//         }
//             : {
//                 finalMaxUploads: number
//                 token: string
//                 finalExpiration: Date | string
//                 userId: number
//                 name: string
//                 expireAfterFirstUpload: boolean
//                 shouldResetLinkCountExpiration: boolean
//                 now: Date
//                 linkCountexpireAt: Date
//             }
//     ) => {
//         return await this.client.$transaction([
//             this.client.link.create({
//                 data: {
//                     maxUploads: finalMaxUploads,
//                     token,
//                     uploadCount: 0,
//                     expiresAt: finalExpiration,
//                     userId: userId,
//                     name: name,
//                     expireAfterFirstUpload: expireAfterFirstUpload || false
//                 }
//             }),
//             this.client.user.update({
//                 where: { id: userId },
//                 data: {
//                     linkCount: shouldResetLinkCountExpiration ? 1 : { increment: 1 },
//                     linkCountExpireAt: shouldResetLinkCountExpiration
//                         ? new Date(now.getTime() + ONE_DAY) : linkCountexpireAt // for 1 day
//                 }
//             })
//         ])
//     }

//     expired_link_count = async () => {
//         return await this.client.link.count({
//             where: {
//                 expiresAt: { lt: new Date() },
//             },
//         })
//     }

//     find_expired_links = async (limit: number, offset: number) => {
//         return await this.client.link.findMany({
//             where: {
//                 expiresAt: { lt: new Date() },
//             },
//             include: { files: true },
//             take: limit,
//             skip: offset
//         })
//     }
// }
