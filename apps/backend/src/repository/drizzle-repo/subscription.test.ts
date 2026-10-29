import { describe, it, expect, beforeAll } from "bun:test";
import { SubscriptionRepositoryDrizzle } from "./subscription.drizzle";
import { DrizzleClient } from "./user.drizzle";
import { createDBClient } from "@/config/db";
import { StatusType } from "@/interface/subsc.interface";
import { uuidv7 } from "uuidv7";

describe("SubscriptionRepositoryDrizzle", () => {
  const mockClient = createDBClient("drizzle") as DrizzleClient;
  let repo: SubscriptionRepositoryDrizzle;
  const userId = 1;
  const now = new Date();

  beforeAll(() => {
    repo = SubscriptionRepositoryDrizzle.getInstance(mockClient);
  });

  it("should insert or update subscription logs", async () => {
    const payload = {
      eventType: "payment_intent.succeeded",
      status: "success" as StatusType,
      userEmail: "test@example.com",
      userId,
      paymentId: "pay_" + uuidv7(),
      subscriptionId: "sub_" + uuidv7(),
      amount: 199,
      currency: "USD",
      rawPayload: { test: true },
      message: "Payment processed successfully",
      createdAt: now,
      updatedAt: now,
    };

    const result = await repo.update_subscription_logs(payload);
    expect(result).not.toBeNull();
    expect(result?.paymentId).toBe(payload.paymentId);
    expect(result?.status).toBe("success");
  });

  it("should update plan for a user", async () => {
    const result = await repo.update_plan(userId, "enterprise");
    expect(result).not.toBeNull();
    expect(result?.planName).toBe("enterprise");
  });

  it("should check plan for a user", async () => {
    const plan = await repo.check_plan(userId);
    expect(plan).not.toBeNull();
    expect(plan?.planName).toBeDefined();
  });

  it("should update subscription_logs when same paymentId inserted again", async () => {
    const paymentId = "repeat_" + uuidv7();
    const basePayload = {
      eventType: "payment_intent.processing",
      status: "processing" as StatusType,
      userEmail: "repeat@example.com",
      userId,
      paymentId,
      subscriptionId: "sub_repeat",
      amount: 300,
      currency: "INR",
      rawPayload: { init: true },
      message: "Processing started",
      createdAt: now,
      updatedAt: now,
    };

    const first = await repo.update_subscription_logs(basePayload);
    expect(first).not.toBeNull();

    const updated = await repo.update_subscription_logs({
      ...basePayload,
      status: "failed",
      message: "Payment failed",
      rawPayload: { error: true },
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("failed");
  });
});
