import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { ISubscriptionRepo, StatusType } from "@/interface/subsc.interface";
import { subscriptionLogs, subscriptions } from "@/db/schema";
import { DrizzleClient } from "./user.drizzle";

interface dt {
  eventType: string;
  status: StatusType;
  userEmail: string;
  userId?: string | null;
  paymentId: string;
  subscriptionId?: string | null;
  amount: number;
  currency: string;
  rawPayload: any;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export class SubscriptionRepositoryDrizzle implements ISubscriptionRepo {
  private static instance: SubscriptionRepositoryDrizzle;
  private client: DrizzleClient;

  private constructor(client: DrizzleClient) {
    this.client = client;
  }

  static getInstance(client: DrizzleClient) {
    if (!SubscriptionRepositoryDrizzle.instance) {
      SubscriptionRepositoryDrizzle.instance = new SubscriptionRepositoryDrizzle(client);
    }
    return SubscriptionRepositoryDrizzle.instance;
  }

  update_subscription_logs = async (data: dt) => {
    const payload =
      typeof data.rawPayload === "string" ? data.rawPayload : JSON.stringify(data.rawPayload);

    const result = await this.client
      .insert(subscriptionLogs)
      .values({
        id: uuidv7(),
        ...data,
        message: data.message ?? "",
        rawPayload: payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscriptionLogs.paymentId,
        set: {
          ...data,
          message: data.message ?? "",
          rawPayload: payload,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0] ?? null;
  };

  update_plan = async (userId: string, planName: string = "pro") => {
    const result = await this.client
      .update(subscriptions)
      .set({ planName })
      .where(eq(subscriptions.userId, userId))
      .returning();
    return result[0] ?? null;
  };

  check_plan = async (userId: string) => {
    const result = await this.client
      .select({ planName: subscriptions.planName })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
    return result[0] ?? null;
  };
}

// const dc = createDBClient('drizzle')
// const drizzleUser = UserRepositoryDrizzle.getInstance(dc as any)
// const drizzleSub = SubscriptionRepositoryDrizzle.getInstance(dc as any)

// const prismaSub = SubscriptionRepository.getInstance(createDBClient('prisma') as any)

// const user = await drizzleSub.check_plan(1)
// console.log('drzile user ', user)

// const prismaUsers = await prismaSub.check_plan(1)
// console.log('prisma user ', prismaUsers)

// const drizzleUpdatePlan = await drizzleSub.update_plan(1, 'pro')
// console.log('drzile update plan ', drizzleUpdatePlan)

// const prismaUpdatePlan = await prismaSub.update_plan(1, 'pro')
// console.log('prisma update plan ', prismaUpdatePlan)

// const prismaUpdateLog = await prismaSub.update_subscription_logs({
//     eventType: 'test',
//     status: 'processing',
//     userEmail: 'test',
//     userId: 1,
//     paymentId: 'test',
//     subscriptionId: 'test',
//     amount: 1,
//     currency: 'test',
//     rawPayload: 'test',
//     message: 'test',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     error: 'no'
// })
// console.log('prisma update log ', prismaUpdateLog)

// const drizzleUpdateLog = await drizzleSub.update_subscription_logs({
//     eventType: 'test',
//     status: 'failed',
//     userEmail: 'test',
//     userId: 1,
//     paymentId: 'test',
//     subscriptionId: 'test',
//     amount: 1,
//     currency: 'test',
//     rawPayload: 'test',
//     message: 'test',
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     error: 'yes hain'
// })
// console.log('drzile update log ', drizzleUpdateLog)
