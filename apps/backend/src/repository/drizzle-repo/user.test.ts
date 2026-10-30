// Bun test

import { describe, it, expect, beforeAll } from "bun:test";
import UserRepositoryDrizzle from "./user.drizzle";
import { createDBClient } from "@/config/db";

const mockClient = createDBClient("drizzle");

describe("UserRepositoryDrizzle", () => {
  let repo: UserRepositoryDrizzle;

  beforeAll(() => {
    repo = UserRepositoryDrizzle.getInstance(mockClient as any);
  });

  it("should create a new user and subscription", async () => {
    const email = `testuser${Date.now()}@example.com`;
    const user = await repo.createUser("Test User", email, "avatar.png");
    expect(user).not.toBeNull();
    expect(user?.name).toBe("Test User");
    // expect(user?.email).toBe("testuser@example.com");
  });

  it("should find user by email", async () => {
    const user = await repo.findUserByEmail("testuser@example.com");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("testuser@example.com");
  });

  it("should find user by id", async () => {
    const user = await repo.findUserId(1);
    expect(user).not.toBeNull();
    expect(user?.id).toBe(1);
  });

  it("should fetch user and plan name", async () => {
    const result = await repo.findUserAndPlanName(1);
    expect(result).not.toBeNull();
    expect(result?.subscription?.planName).toBe("enterprise");
  });
});
