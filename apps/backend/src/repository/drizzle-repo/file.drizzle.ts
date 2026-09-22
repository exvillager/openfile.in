import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { files, links } from "@/db";
import {
    ConfirmUploadParams,
    CreatePendingFileParams,
    IFileRepo,
} from "@/interface/file.interface";
import { DrizzleClient } from "./user.drizzle";


export class FileRepositoryDrizzle implements IFileRepo {
    private static instance: FileRepositoryDrizzle
    private client: DrizzleClient

    constructor(client: DrizzleClient) {
        this.client = client
    }


    static getInstance(client: DrizzleClient) {
        if (!FileRepositoryDrizzle.instance) {
            FileRepositoryDrizzle.instance = new FileRepositoryDrizzle(client);
        }
        return FileRepositoryDrizzle.instance
    }

    async createPendingFile(
        { linkId, userId, url, key, size, expiresAt }: CreatePendingFileParams
    ): ReturnType<IFileRepo['createPendingFile']> {
        const [pendingFile] = await this
            .client
            .insert(files)
            .values({
                id: uuidv7(),
                url,
                key,
                name: '',
                size,
                status: 'PENDING',
                expiresAt,
                userId,
                uploadLinkId: linkId,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return pendingFile ?? null;
    }

    async confirmUpload(
        { key, linkId, userId, name, size }: ConfirmUploadParams
    ): ReturnType<IFileRepo['confirmUpload']> {
        const [confirmedFile] = await this
            .client
            .update(files)
            .set({
                name,
                size,
                status: 'CONFIRMED',
                expiresAt: null,
                updatedAt: new Date(),
            })
            .where(and(
                eq(files.key, key),
                eq(files.uploadLinkId, linkId),
                eq(files.userId, userId),
                eq(files.status, 'PENDING'),
            ))
            .returning();

        if (!confirmedFile) {
            return [null, null];
        }

        const [updatedLink] = await this
            .client
            .update(links)
            .set({
                uploadCount: sql`${links.uploadCount}+1`,
            })
            .where(and(eq(links.id, linkId), eq(links.userId, userId)))
            .returning();

        if (!updatedLink) {
            console.log('failed to update link')
            return [confirmedFile, null];
        }

        return [confirmedFile, updatedLink];
    }

    async findFileByIdUserIdAndLinkId(fileId: string, userId: string, linkId: string) {
        const result = await this
            .client
            .query
            .files
            .findFirst({
                where: and(
                    eq(files.id, fileId),
                    eq(files.userId, userId),
                    eq(files.uploadLinkId, linkId),
                    eq(files.status, 'CONFIRMED')
                )
            })

        return result ?? null
    }

    async findLinkByTokenAndUserId(token: string, userId: string) {
        const result = await this
            .client
            .query
            .links
            .findFirst({
                where: and(
                    eq(links.token, token),
                    eq(links.userId, userId)
                )
            })

        return result ?? null;
    }

    async getFiles(linkId: string, userId: string, skip: number, limit: number) {
        const result = await this
            .client
            .query
            .files
            .findMany({
                where: and(
                    eq(files.uploadLinkId, linkId),
                    eq(files.userId, userId),
                    eq(files.status, 'CONFIRMED')
                ),
                offset: skip,
                limit: limit,
                orderBy: sql`${files.createdAt} DESC`
            })

        return result;
    }

    async getUser(id: string): Promise<{ id: string; } | null> {
        const result = await this
            .client
            .query
            .users
            .findFirst({
                where: eq(links.id, id),
                columns: { id: true }
            })

        return result ?? null;
    }

    async storageUsed(userId: string) {
        const result = await this.client
            .select({
                totalSize: sql<number>`SUM(${files.size})`
            })
            .from(files)
            .where(and(
                eq(files.userId, userId),
                eq(files.status, 'CONFIRMED')
            ))
            .limit(1)
        
        return result[0]
    }

    async get_file_by_id(id:string) {
        const result = await this.client.query.files.findFirst({
            where: eq(files.id, id),
        })
        return result;
    }

    async get_file_by_id_and_userid(id:string,user_id:string){
        const result = await this.client.query.files.findFirst({
            where: and(
                eq(files.id, id),
                eq(files.userId, user_id)
            )
        })
        return result;
    }

    async delete_file_from_link(file_id:string, link_id:string, user_id:string) {
        const [deletedFile] = await this
            .client
            .delete(files)
            .where(and(
                eq(files.id, file_id),
                eq(files.uploadLinkId, link_id),
                eq(files.userId, user_id)
            ))
            .returning();

        if (!deletedFile) return null;

        // await this
        //     .client
        //     .update(links)
        //     .set({
        //         uploadCount: sql`GREATEST(${links.uploadCount}-1, 0)`,
        //     })
        //     .where(and(eq(links.id, link_id), eq(links.userId, user_id)))

        return deletedFile;
    }

    async find_expired_pending_files(limit: number) {
        const result = await this
            .client
            .query
            .files
            .findMany({
                where: and(
                    eq(files.status, 'PENDING'),
                    lt(files.expiresAt, new Date())
                ),
                columns: {
                    id: true,
                    url: true,
                    uploadLinkId: true,
                },
                limit: limit,
                orderBy: sql`${files.expiresAt} ASC`
            })

        return result;
    }

    async delete_pending_files_by_ids(ids: string[]) {
        if (ids.length === 0) return [];

        const deleted = await this
            .client
            .delete(files)
            .where(and(
                inArray(files.id, ids),
                eq(files.status, 'PENDING')
            ))
            .returning({ id: files.id });

        return deleted.map(row => row.id);
    }
}

// local test
