import { files } from "../db";
import ApiResponse from "../utils/apiRespone";
import { Link } from "./link.interface";

export type FileRow = typeof files.$inferSelect

export type NotifyUploadParams = { link: Link; s3Key: string; fileSize: number; name?: string }

/** Reservation written when a presigned upload URL is handed out. */
export type CreatePendingFileParams = {
    linkId: string
    userId: string
    url: string
    key: string
    size: bigint
    expiresAt: Date
}

/** Flips a reservation to CONFIRMED once the client reports the upload finished. */
export type ConfirmUploadParams = {
    key: string
    linkId: string
    userId: string
    name: string
    size: bigint
}

/** Minimal shape the cleanup sweep needs to hand a row to the delete pipeline. */
export type ExpiredPendingFile = {
    id: string
    url: string
    uploadLinkId: string
}

export interface IFileService {
    notifyUpload(params: NotifyUploadParams): Promise<ApiResponse>
    uploadPreSignedUrl(link: Link, mimeType: string, fileSize: number): Promise<ApiResponse>;
    getDownloadPreSignedUrl(userId: string, token: string, fileId: string): Promise<ApiResponse>;
    storageUsed(userId: string): Promise<ApiResponse>
    getFilesByLinkAndToken(token: string, userId: string, page: number, limit: number, skip: number): Promise<ApiResponse>
    delete_a_file_from_a_link(link_id: string, file_id: string, user_id: string): Promise<ApiResponse>
}

export interface IFileRepo {
    getUser(id: string): Promise<{ id: string } | null>

    findLinkByTokenAndUserId(token: string, userId: string): Promise<Link | null>

    findFileByIdUserIdAndLinkId(fileId: string, userId: string, linkId: string): Promise<FileRow | null>

    storageUsed(userId: string): Promise<{
        totalSize: number;
    }>

    /**
     * Reserves a File row in PENDING state before the client is given the upload URL.
     * Nothing else in the app treats a PENDING row as a real file.
     */
    createPendingFile(params: CreatePendingFileParams): Promise<FileRow | null>

    /**
     * Marks a reservation CONFIRMED, records the real name/size, clears expiresAt and
     * bumps the link's uploadCount. Only ever transitions PENDING -> CONFIRMED, so a
     * replayed notify-upload cannot double-count an upload.
     */
    confirmUpload(params: ConfirmUploadParams): Promise<[FileRow | null, Link | null]>

    getFiles(linkId: string, userId: string, skip: number, limit: number): Promise<FileRow[]>

    get_file_by_id(id: string): Promise<FileRow | undefined>

    get_file_by_id_and_userid(file_id: string, user_id: string): Promise<FileRow | undefined>

    delete_file_from_link(file_id: string, link_id: string, user_id: string): Promise<FileRow | null>

    /** Reservations whose deadline has passed and that were never confirmed. */
    find_expired_pending_files(limit: number): Promise<ExpiredPendingFile[]>

    /** Removes swept reservations. Guarded on PENDING so a race with notify-upload loses. */
    delete_pending_files_by_ids(ids: string[]): Promise<string[]>
}
