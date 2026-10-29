// import { PrismaClient } from "../generated/prisma";
// import { IUserRepository } from "../interface/user.interface";

// export default class UserRepository implements IUserRepository {
//     private static instance: UserRepository
//     private client: PrismaClient

//     constructor(client: PrismaClient) {
//         this.client = client
//     }

//     static getInstance(client: PrismaClient) {
//         if (!UserRepository.instance) {
//             UserRepository.instance = new UserRepository(client);
//         }
//         return UserRepository.instance
//     }

//     findUserId = async (id: number): Promise<{ id: number; } | null> => {
//         return await this.client.user.findUnique({
//             where: {
//                 id
//             },
//             select: {
//                 id: true
//             }
//         })
//     }

//     findUserByEmail = async (email: string) => {
//         return await this.client.user.findUnique({
//             where: {
//                 email
//             }
//         });
//     }

//     createUser = async (name: string, email: string, avatar: string) => {
//         return await this.client.user.create({
//             data: {
//                 name,
//                 email,
//                 avatar,
//                 subscription: {
//                     create: {}
//                 }
//             }
//         });
//     }

//     findUserAndPlanName = async (userId: number) => {
//         return await this.client.user.findUnique({
//             where: {
//                 id: userId
//             },
//             select: {
//                 id: true,
//                 name: true,
//                 email: true,
//                 avatar: true,
//                 linkCount: true,
//                 linkCountExpireAt: true,
//                 subscription: {
//                     select: {
//                         planName: true
//                     }
//                 }
//             }
//         })
//     }
// }
