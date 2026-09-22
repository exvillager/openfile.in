import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { eq } from "drizzle-orm";
import { FileRepositoryDrizzle } from "./file.drizzle";
import { DrizzleClient } from "./user.drizzle";
import { createDBClient } from "@/config/db";
import { files, links, users } from "@/db";

describe("FileRepositoryDrizzle", () => {
    const client = createDBClient('drizzle') as DrizzleClient
    let repo: FileRepositoryDrizzle;

    const userId = crypto.randomUUID();
    const linkId = crypto.randomUUID();
    const token = `test-${Date.now()}`;

    // Reserves a file the way /upload-url does.
    const reserve = (expiresAt: Date) => {
        const key = `uploads/files/${crypto.randomUUID()}.bin`;
        return repo.createPendingFile({
            linkId,
            userId,
            url: `https://bucket.s3.region.amazonaws.com/${key}`,
            key,
            size: BigInt(1024),
            expiresAt,
        });
    };

    const confirm = (key: string, name = "file.bin", size = BigInt(2048)) =>
        repo.confirmUpload({ key, linkId, userId, name, size });

    beforeAll(async () => {
        repo = FileRepositoryDrizzle.getInstance(client);

        await client.insert(users).values({
            id: userId,
            username: `test-${Date.now()}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await client.insert(links).values({
            id: linkId,
            token,
            maxUploads: 50,
            uploadCount: 0,
            expiresAt: new Date(Date.now() + 86_400_000),
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    });

    afterAll(async () => {
        await client.delete(files).where(eq(files.userId, userId));
        await client.delete(links).where(eq(links.id, linkId));
        await client.delete(users).where(eq(users.id, userId));
    });

    it("reserves a pending file that is not visible as a real file yet", async () => {
        const pending = await reserve(new Date(Date.now() + 60_000));

        expect(pending).not.toBeNull();
        expect(pending?.status).toBe("PENDING");
        expect(pending?.expiresAt).not.toBeNull();

        const found = await repo.findFileByIdUserIdAndLinkId(pending!.id, userId, linkId);
        expect(found).toBeNull();
    });

    it("confirms a reservation and bumps the link upload count", async () => {
        const pending = await reserve(new Date(Date.now() + 60_000));
        const before = await repo.findLinkByTokenAndUserId(token, userId);

        const [file, link] = await confirm(pending!.key);

        expect(file?.id).toBe(pending!.id);
        expect(file?.status).toBe("CONFIRMED");
        expect(file?.name).toBe("file.bin");
        expect(file?.size).toBe(BigInt(2048));
        expect(file?.expiresAt).toBeNull();
        expect(link!.uploadCount).toBe(before!.uploadCount + 1);

        const found = await repo.findFileByIdUserIdAndLinkId(file!.id, userId, linkId);
        expect(found?.id).toBe(file!.id);
    });

    it("ignores a replayed confirmation so uploads cannot be double counted", async () => {
        const pending = await reserve(new Date(Date.now() + 60_000));

        const [first] = await confirm(pending!.key);
        const [replayed, replayedLink] = await confirm(pending!.key);

        expect(first).not.toBeNull();
        expect(replayed).toBeNull();
        expect(replayedLink).toBeNull();
    });

    it("lists and counts only confirmed files", async () => {
        const pending = await reserve(new Date(Date.now() + 60_000));
        const confirmed = await reserve(new Date(Date.now() + 60_000));
        await confirm(confirmed!.key);

        const listed = await repo.getFiles(linkId, userId, 0, 100);
        expect(listed.every(file => file.status === "CONFIRMED")).toBe(true);
        expect(listed.map(file => file.id)).not.toContain(pending!.id);
        expect(listed.map(file => file.id)).toContain(confirmed!.id);

        const { totalSize } = await repo.storageUsed(userId);
        expect(Number(totalSize)).toBeGreaterThan(0);
    });

    it("finds reservations whose deadline has passed", async () => {
        const expired = await reserve(new Date(Date.now() - 60_000));
        const fresh = await reserve(new Date(Date.now() + 600_000));

        const found = await repo.find_expired_pending_files(100);
        const ids = found.map(file => file.id);

        expect(ids).toContain(expired!.id);
        expect(ids).not.toContain(fresh!.id);
    });

    it("deletes expired reservations but leaves confirmed files alone", async () => {
        const expired = await reserve(new Date(Date.now() - 60_000));
        const raced = await reserve(new Date(Date.now() - 60_000));

        // notify-upload lands before the cleanup deletes it.
        await confirm(raced!.key);

        const deleted = await repo.delete_pending_files_by_ids([expired!.id, raced!.id]);

        expect(deleted).toContain(expired!.id);
        expect(deleted).not.toContain(raced!.id);
        expect(await repo.get_file_by_id(expired!.id)).toBeUndefined();
        expect((await repo.get_file_by_id(raced!.id))?.status).toBe("CONFIRMED");
    });

    it("deletes a confirmed file from its link", async () => {
        const pending = await reserve(new Date(Date.now() + 60_000));
        const [file] = await confirm(pending!.key);

        const deleted = await repo.delete_file_from_link(file!.id, linkId, userId);

        expect(deleted?.id).toBe(file!.id);
        expect(await repo.get_file_by_id_and_userid(file!.id, userId)).toBeUndefined();
    });
});
