import { and, count, eq, ilike, lt, or, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { ILinkRepo } from "@/interface/link.interface";
import { files, links, users } from "@/db/schema";
import { ONE_DAY } from "@/service/link.service";
import { DrizzleClient } from "./user.drizzle";




export class LinkRepositoryDrizzle implements ILinkRepo {
    private static instance: LinkRepositoryDrizzle
    private client: DrizzleClient;

    constructor(client: DrizzleClient) {
        this.client = client;
    }

    static getInstance(client: DrizzleClient) {
        if (!LinkRepositoryDrizzle.instance) {
            LinkRepositoryDrizzle.instance = new LinkRepositoryDrizzle(client);
        }
        return LinkRepositoryDrizzle.instance
    }

    async FindLinkWithTokenIvAndKey(token: string) {
        const result = await this
            .client
            .select()
            .from(links)
            .where(eq(links.token, token))
            .limit(1)
        return result[0] ?? null;
    }

    async FindUserLinksCount(userId: string) {
        const result = this
            .client
            .$count(links, eq(links.userId, userId))

        return result ?? null;
    }

    async createLink(
        { finalMaxUploads,
            token,
            expireAfterFirstUpload,
            finalExpiration,
            name,
            userId,
            shouldResetLinkCountExpiration,
            now,
            linkCountexpireAt }
            : {
                finalMaxUploads: number;
                token: string;
                finalExpiration: Date | string;
                userId: string;
                name: string;
                expireAfterFirstUpload: boolean;
                shouldResetLinkCountExpiration: boolean;
                now: Date;
                linkCountexpireAt: Date;
            }
    ): ReturnType<ILinkRepo['createLink']> {
        const [createdLink] = await this
            .client
            .insert(links)
            .values({
                id: uuidv7(),
                maxUploads: finalMaxUploads,
                token,
                uploadCount: 0,
                expiresAt: finalExpiration as any,
                userId: userId,
                name: name,
                expireAfterFirstUpload: expireAfterFirstUpload || false,
                createdAt: new Date(now.getTime()),
                updatedAt: new Date(now.getTime())
            })
            .returning()

        if (!createdLink) {
            console.log('failed to generate link')
            return [null, null];
        }

        const [updatedUser] = await this
            .client
            .update(users)
            .set({
                linkCount: shouldResetLinkCountExpiration
                    ? 1
                    : sql`${users.linkCount}+1`,
                linkCountExpireAt: shouldResetLinkCountExpiration
                    ? new Date(now.getTime() + ONE_DAY)
                    : linkCountexpireAt
            })
            .where(eq(users.id, userId))
            .returning()
        if (!updatedUser) {
            console.log('failed to update user ', userId)
            return [createdLink, null];
        }

        return [createdLink, updatedUser];
    }

    async deleteLink(linkId: string, userId: string) {
        const result = await this
            .client
            .delete(links)
            .where(and(eq(links.id, linkId), eq(links.userId, userId)))
            .returning()
        return result[0] ?? null;
    }

    async delete_link_by_id(id: string) {
        const result = await this
            .client
            .delete(links)
            .where(eq(links.id, id))
            .returning();
        return result[0] ?? null;
    }

    async expired_link_count() {
        const result = await this
            .client
            .select({ count: count() })
            .from(links)
            .where(lt(links.expiresAt, new Date()));

        return result[0]?.count ?? 0;
    }

    async findFilesForLink(linkId: string, userId: string) {
        const result = await this
            .client
            .select()
            .from(files)
            .where(and(eq(files.uploadLinkId, linkId), eq(files.userId, userId)));

        return result;
    }

    async findLinkByIdAndUser(linkId: string, userId: string) {
        const result = await this
            .client
            .query
            .links
            .findFirst({
                where: and(
                    eq(links.id, linkId),
                    eq(links.userId, userId),
                ),
                columns: {
                    id: true,
                    token: true,
                },
                with: {
                    files: {
                        columns: {
                            url: true,
                            id: true
                        }
                    }
                }
            })

        return result ?? null;
    }

    async findLinkByToken(token: string) {
        const result = await this
            .client
            .select()
            .from(links)
            .where(eq(links.token, token))
            .limit(1);

        return result[0] ?? null;
    }

    async findLinkByTokenAndUserId(token: string, userId: string) {
        const result = await this
            .client
            .select()
            .from(links)
            .where(and(eq(links.token, token), eq(links.userId, userId)))
            .limit(1);

        return result[0] ?? null;
    }

    async findLinkUploadCount(linkId: string) {
        const result = await this
            .client
            .select({ uploadCount: links.uploadCount })
            .from(links)
            .where(eq(links.id, linkId))
            .limit(1);

        return result[0] ?? null;
    }

    async findLinkWithFilesByTokenAndUserId(linkId: string, token: string, userId: string, skip: number, limit: number) {
        const link = await this
            .client
            .query
            .links
            .findFirst({
                where: and(
                    eq(links.id, linkId),
                    eq(links.userId, userId),
                    eq(links.token, token)
                ),
                columns: { id: true, token: true },
            });

        if (!link) {
            console.log('could not find link ')
            return null;
        }

        const fileList = await this
            .client
            .query
            .files
            .findMany({
                where: and(
                    eq(files.uploadLinkId, linkId),
                    eq(files.status, 'CONFIRMED'),
                ),
                columns: {
                    id: true,
                    name: true,
                    url: true,
                    size: true,
                    createdAt: true,
                },
                offset: skip,
                limit: limit,
                orderBy: sql`${files.createdAt} DESC`
            })
        return { ...link, files: fileList };
    }

    async findUserLinks(userId: string, query: string, skip: number, limit: number) {
        const result = await this
            .client
            .select({
                id: links.id,
                name: links.name,
                token: links.token,
                createdAt: links.createdAt,
                maxUploads: links.maxUploads,
                expiresAt: links.expiresAt,
                uploadCount: links.uploadCount
            })
            .from(links)
            .where(and(
                eq(links.userId, userId),
                or(
                    ilike(links.name, `%${query}%`),
                    ilike(links.token, `%${query}%`)
                )
            ))
            .offset(skip)
            .limit(limit)
            .orderBy(sql`${links.createdAt} DESC`);

        return result;
    }

    async find_expired_links(limit: number, offset: number) {
        const result = await this
            .client
            .query
            .links
            .findMany({
                where: lt(links.expiresAt, new Date()),
                with: {
                    files: true
                },
                limit: limit,
                offset: offset
            });
        return result;
    }
}
