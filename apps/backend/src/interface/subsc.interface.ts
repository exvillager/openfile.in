export type StatusType = "success" | "failed" | "processing" | "user_not_found";

export interface ISubscriptionRepo {
  update_subscription_logs(data: {
    eventType: string;
    status: StatusType | any;
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
    error?: string | null;
  }): Promise<{
    id: string;
    eventType: string;
    status: StatusType | any;
    userEmail: string;
    userId: string | null;
    paymentId: string;
    subscriptionId: string | null;
    amount: number;
    currency: string;
    rawPayload: unknown;
    message: string;
    error: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  update_plan(
    userId: string,
    planName?: string,
  ): Promise<{
    id: string;
    status: "ACTIVE" | "INACTIVE" | "CANCELLED" | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    planName: string;
    price: number;
    startDate: Date;
    endDate: Date | null;
    cancelAt: Date | null;
  } | null>;
}
