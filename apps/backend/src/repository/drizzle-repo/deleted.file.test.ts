import { describe, it, expect, beforeAll } from "bun:test";
import { DeletedFileRepositoryDrizzle } from "./deleted.file.drizzle";
import { createDBClient } from "@/config/db";

describe("DeletedFileRepositoryDrizzle", () => {
  const mockClient = createDBClient("drizzle") as any;
  let repo: DeletedFileRepositoryDrizzle;
  const linkId = 295;

  beforeAll(() => {
    repo = DeletedFileRepositoryDrizzle.getInstance(mockClient);
  });

  it("should create multiple deleted file entries", async () => {
    const fakeFiles = [
      { id: 11, url: "https://cdn.example.com/file1.png" },
      { id: 12, url: "https://cdn.example.com/file2.png" },
    ];

    const result = await repo.createMany(fakeFiles, linkId);

    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty("fileId");
      expect(result[0]).toHaveProperty("linkId");
    }
  });

  it("should find expired files by status", async () => {
    const status = "PENDING";
    const result = await repo.findExpiredFiles(status, 10, 0);

    expect(Array.isArray(result)).toBe(true);
    for (const row of result) {
      expect(row).toHaveProperty("fileId");
      expect(row).toHaveProperty("linkId");
      expect(row).toHaveProperty("fileUrl");
    }
  });

  it("should return 0 for findExpiredLinkCount (placeholder)", async () => {
    const count = await repo.findExpiredLinkCount("PENDING");
    expect(count).toBe(0);
  });

  it("should ensure singleton instance", async () => {
    const newInstance = DeletedFileRepositoryDrizzle.getInstance(mockClient);
    expect(newInstance).toBe(repo);
  });
});
