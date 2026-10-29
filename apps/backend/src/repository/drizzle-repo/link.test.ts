import { describe, it, expect, beforeAll } from "bun:test";
import { LinkRepositoryDrizzle } from "./link.drizzle";
import { DrizzleClient } from "./user.drizzle";
import { createDBClient } from "@/config/db.js";
import { uuidv7 } from "uuidv7";

describe("LinkRepositoryDrizzle", () => {
  const mockClient = createDBClient("drizzle") as DrizzleClient;
  let repo: LinkRepositoryDrizzle;
  let userId = 1;
  let now = new Date();

  beforeAll(() => {
    repo = LinkRepositoryDrizzle.getInstance(mockClient);
  });

  it("should create a link and update user linkCount", async () => {
    const token = "test_token_" + uuidv7();
    const [link, user] =
      (await repo.createLink({
        finalMaxUploads: 10,
        token,
        finalExpiration: now,
        userId,
        name: "Test Link",
        expireAfterFirstUpload: true,
        shouldResetLinkCountExpiration: true,
        now,
        linkCountexpireAt: now,
      })) || [];

    expect(link).not.toBeNull();
    expect(link.token).toBe(token);
    expect(user).not.toBeNull();
  });

  it("should find link by token", async () => {
    const token = "test_token_" + uuidv7();
    const [link] =
      (await repo.createLink({
        finalMaxUploads: 5,
        token,
        finalExpiration: now,
        userId,
        name: "Token Test",
        expireAfterFirstUpload: false,
        shouldResetLinkCountExpiration: false,
        now,
        linkCountexpireAt: now,
      })) || [];

    const found = await repo.findLinkByToken(token);
    expect(found).not.toBeNull();
    expect(found?.token).toBe(token);
  });

  it("should find link by token and userId", async () => {
    const token = "user_token_" + uuidv7();
    const [link] =
      (await repo.createLink({
        finalMaxUploads: 5,
        token,
        finalExpiration: now,
        userId,
        name: "User Test",
        expireAfterFirstUpload: false,
        shouldResetLinkCountExpiration: false,
        now,
        linkCountexpireAt: now,
      })) || [];

    const found = await repo.findLinkByTokenAndUserId(token, userId);
    expect(found).not.toBeNull();
    expect(found?.token).toBe(token);
  });

  it("should return correct expired link count", async () => {
    const count = await repo.expired_link_count();
    expect(typeof count).toBe("number");
  });

  it("should find user links with search query", async () => {
    const result = await repo.findUserLinks(userId, "Test", 0, 10);
    expect(Array.isArray(result)).toBe(true);
  });

  it("should find link upload count", async () => {
    const [link] =
      (await repo.createLink({
        finalMaxUploads: 3,
        token: "upload_count_" + uuidv7(),
        finalExpiration: now,
        userId,
        name: "Upload Count Test",
        expireAfterFirstUpload: false,
        shouldResetLinkCountExpiration: false,
        now,
        linkCountexpireAt: now,
      })) || [];

    const uploadCount = await repo.findLinkUploadCount(link.id);
    expect(uploadCount).not.toBeNull();
    expect(uploadCount?.uploadCount).toBeDefined();
  });

  it("should find link with files by token and userId", async () => {
    const token = "link_files_" + uuidv7();
    const [link] =
      (await repo.createLink({
        finalMaxUploads: 5,
        token,
        finalExpiration: now,
        userId,
        name: "Link Files Test",
        expireAfterFirstUpload: false,
        shouldResetLinkCountExpiration: false,
        now,
        linkCountexpireAt: now,
      })) || [];

    const result = await repo.findLinkWithFilesByTokenAndUserId(link.id, token, userId, 0, 10);
    expect(result).not.toBeNull();
    expect(result?.files).toBeDefined();
    expect(Array.isArray(result?.files)).toBe(true);
  });
});
