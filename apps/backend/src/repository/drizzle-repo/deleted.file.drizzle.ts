import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { deletedFiles } from "@/db";
import { IDeleteFileRepo } from "@/interface/delete-file.interface";
import { DrizzleClient } from "./user.drizzle";


export class DeletedFileRepositoryDrizzle implements IDeleteFileRepo {
    private static instance: DeletedFileRepositoryDrizzle
    private client: DrizzleClient

    constructor(client: DrizzleClient) {
        this.client = client
    }

    static getInstance(client: DrizzleClient) {
        if (!DeletedFileRepositoryDrizzle.instance) {
            DeletedFileRepositoryDrizzle.instance = new DeletedFileRepositoryDrizzle(client);
        }
        return DeletedFileRepositoryDrizzle.instance
    }

    async createMany(files: any, linkId: string) {
        const result = await this.client
            .insert(deletedFiles)
            .values(
                files.map((file: any) => ({
                    id: uuidv7(),
                    fileId: file.id,
                    linkId,
                    fileUrl: file.url,
                    status: 'PENDING',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }))
            )
            .onConflictDoNothing({ target: deletedFiles.fileId })
            .returning();
        return result;
    }

    async findExpiredFiles(
        type: "PENDING" | "DELETED" | "FAILED",
        limit: number,
        offset: number): Promise<{ linkId: string; fileUrl: string; fileId: string; }[]> {

        const result = await this.client
            .query
            .deletedFiles
            .findMany({
                where: eq(deletedFiles.status, type),
                limit: limit,
                offset: offset,
                columns: {
                    linkId: true,
                    fileUrl: true,
                    fileId: true,
                }
            })

        return result;

    }

    async findExpiredLinkCount(type: "PENDING" | "DELETED" | "FAILED"): Promise<number> {
        const number = await this.client
            .$count(deletedFiles, eq(deletedFiles.status, type))

        return number
    }
}