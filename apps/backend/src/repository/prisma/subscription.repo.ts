// import { PrismaClient } from "../generated/prisma";
// import { ISubscriptionRepo, StatusType } from "../interface/subsc.interface";

// export class SubscriptionRepository implements ISubscriptionRepo {
//     private static instance: SubscriptionRepository
//     private client: PrismaClient;

//     private constructor(client: PrismaClient) {
//         this.client = client;
//     }

//     static getInstance(client: PrismaClient) {
//         if (!SubscriptionRepository.instance) {
//             SubscriptionRepository.instance = new SubscriptionRepository(client);
//         }
//         return SubscriptionRepository.instance
//     }

//     update_subscription_logs = async (
//         data: {
//             eventType: string
//             status: StatusType | any
//             userEmail: string
//             userId?: number | null
//             paymentId: string
//             subscriptionId?: string | null
//             amount: number
//             currency: string
//             rawPayload: any
//             message?: string
//             createdAt: Date
//             updatedAt: Date
//             error?: String
//         }
//     ) => {

//         return await this.client.subscriptionLog.upsert({
//             where: {
//                 paymentId: data.paymentId,
//             },
//             update: {
//                 ...data,
//                 rawPayload:
//                     typeof data.rawPayload === 'string'
//                         ? data.rawPayload
//                         : JSON.stringify(data.rawPayload),
//             },
//             create: {
//                 ...data,
//                 rawPayload:
//                     typeof data.rawPayload === 'string'
//                         ? data.rawPayload
//                         : JSON.stringify(data.rawPayload)
//             }
//         });
//     }

//     // Update User Plan
//     update_plan = async (userId: number, planName: string = 'pro') => {
//         return await this.client.subscription.update({
//             where: {
//                 userId
//             },
//             data: {
//                 planName
//             }
//         })
//     }

//     // check a user's plan by email
//     check_plan = async (userId: number) => {
//         return await this.client.subscription.findFirst({
//             where: {
//                 userId: userId
//             },
//             select: {
//                 planName: true
//             }
//         })
//     }
// }
