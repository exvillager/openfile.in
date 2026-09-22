import { ContextType } from "diesel-core";
import { IFileService } from "../../interface/file.interface";
import { handleErrorResponse } from "../../utils/handle-error";
import ApiResponse from "../../utils/apiRespone";
import { notifyUploadSchema } from "../../zod/schema";
import { User } from "../../interface/user.interface";
import { Link } from "../../interface/link.interface";
import { mustGet } from "../../utils/mustGet";


export default class DieselFileController {
    private static instance: DieselFileController
    private fileService: IFileService

    constructor(fileService: IFileService) {
        this.fileService = fileService
    }

    static getInstance(fileService: IFileService) {
        if (!DieselFileController.instance) {
            DieselFileController.instance = new DieselFileController(fileService)
        }
        return DieselFileController.instance;
    }


    getFilesByLinkToken = async (c: ContextType) => {
        try {
            const files = mustGet<any[]>(c, "files");
            const { page, limit } = mustGet<{ page: number; limit: number }>(c, "pagination");

            const safeFiles = files.map((file: any) => ({
                ...file,
                size: Number(file.size),
            }));
            return c.json({
                message: "Files fetched successfully",
                success: true,
                data: safeFiles,
                page,
                limit
            }, 200);
        } catch (error) {
            console.error("Error fetching files:", error);
            return handleErrorResponse(c, error)
        }
    }

    notifyFileUpload = async (c: ContextType) => {
        try {
            const link = mustGet<Link>(c, 'link')

            const body = await c.req.json();
            const parsed = notifyUploadSchema.safeParse(body)
            if (!parsed.success) {
                return c.json({ error: parsed.error.format() }, 400);
            }

            const { s3Key, fileSize, name } = parsed.data
            if (!s3Key || !fileSize) {
                return c.json({ error: 'Missing required fields' }, 400);
            }

            const apiResponse: ApiResponse = await this.fileService.notifyUpload({ link, s3Key, fileSize, name })
            return c.json({ message: apiResponse.message }, apiResponse.statusCode)
        } catch (error) {
            console.error("notifyFileUpload error:", error);
            return handleErrorResponse(c, error)
        }
    };


    getUploadPresignedUrl = async (c: ContextType) => {
        try {
            const link = mustGet<Link>(c, 'link')
            const safeMimeType = mustGet<string>(c, 'mimeType')
            const fileSize = mustGet<number>(c, 'fileSize')

            const res: ApiResponse = await this.fileService.uploadPreSignedUrl(link, safeMimeType, fileSize)
            return c.json(res.data, res.statusCode);
        } catch (error) {
            console.error("getUploadPresignedUrl error:", error);
            return handleErrorResponse(c, error)
        }
    }

    getDownloadPresignedUrl = async (c: ContextType) => {
        const token = c.query?.token;
        const fileId = c.query?.fileId
        const s3key = c.query?.s3key

        if (!token || !s3key || !fileId) {
            return c.json({ error: "Missing or invalid parameters" }, 400);
        }
        try {
            const user = mustGet<User>(c, 'user')
            const apiRespone: ApiResponse = await this.fileService.getDownloadPreSignedUrl(user.id, token, fileId, s3key)

            return c.json(apiRespone, apiRespone.statusCode);
        } catch (error) {
            console.error("Signed URL error:", error);
            
            return handleErrorResponse(c, error)
        }
    }

    deleteFileFromLink = async (c: ContextType) => {
        try {
            const user = mustGet<User>(c, 'user')
            const link_id = c.params.id
            const file_id = c.params.file_id

            if (!link_id || !file_id) {
                return c.json({ error: "Missing or invalid parameters" }, 400);
            }

            const apiResponse: ApiResponse = await this.fileService.delete_a_file_from_a_link(link_id, file_id, user.id)
            return c.json({ message: apiResponse.message }, apiResponse.statusCode)
        } catch (error) {
            console.error("deleteFileFromLink error:", error);
            return handleErrorResponse(c, error)
        }
    }

    storeageUsed = async (c: ContextType) => {
        try {
            const user = mustGet<User>(c, 'user')
            const apiRespone = await this.fileService.storageUsed(user.id)

            return c.json(apiRespone, apiRespone.statusCode);
        } catch (error) {
            console.error("storage used error:", error);
            return handleErrorResponse(c, error)
        }
    }

}