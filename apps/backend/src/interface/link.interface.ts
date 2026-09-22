import { files, links } from "../db";
import { ApiError } from "../utils/apiError"
import ApiResponse from "../utils/apiRespone"
import { CreateLinkBody } from "../zod/schema"
import { UserWithPlan } from "./user.interface"

export type Link = typeof links.$inferSelect
type FileRow = typeof files.$inferSelect

export interface ILinkRepo {
    findLinkByIdAndUser(linkId: string, userId: string): Promise<{
        token: string;
        id: string;
        files: {
            id: string;
            url: string;
        }[];
    } | null>

    findLinkByTokenAndUserId(token: string, userId: string): Promise<{
        token: string;
        expireAfterFirstUpload: boolean;
        name: string | null;
        userId: string;
        id: string;
        maxUploads: number;
        uploadCount: number;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>

    findLinkByToken(token: string): Promise<{
        token: string;
        expireAfterFirstUpload: boolean;
        name: string | null;
        userId: string;
        id: string;
        maxUploads: number;
        uploadCount: number;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>

    FindLinkWithTokenIvAndKey(token: string): Promise<{
        token: string;
        expireAfterFirstUpload: boolean;
        name: string | null;
        userId: string;
        id: string;
        maxUploads: number;
        uploadCount: number;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }>

    findFilesForLink(linkId: string, userId: string): Promise<FileRow[]>

    deleteLink(linkId: string, userId: string): Promise<{
        token: string;
        expireAfterFirstUpload: boolean;
        name: string | null;
        userId: string;
        id: string;
        maxUploads: number;
        uploadCount: number;
        expiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    } | null>

    delete_link_by_id(id: string): Promise<{
        id: string;
        token: string;
        name: string | null;
        maxUploads: number;
        uploadCount: number;
        expiresAt: Date;
        expireAfterFirstUpload: boolean;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>

    findLinkWithFilesByTokenAndUserId(linkId: string, token: string, userId: string, skip: number, limit: number): Promise<{
        id: string;
        files: {
            name: string;
            id: string;
            createdAt: Date;
            url: string;
            size: bigint;
        }[];
    } | null>


    findUserLinks(userId: string, query: string, skip: number, limit: number): Promise<{
        token: string;
        name: string | null;
        id: string;
        maxUploads: number;
        uploadCount: number;
        expiresAt: Date;
        createdAt: Date;
    }[]>

    findLinkUploadCount(linkId: string): Promise<{
        uploadCount: number;
    }>

    FindUserLinksCount(userId: string): Promise<number>

    createLink(
        {
            finalMaxUploads,
            token,
            expireAfterFirstUpload,
            finalExpiration,
            name,
            userId,
            shouldResetLinkCountExpiration,
            now,
            linkCountexpireAt
        }
            : {
                finalMaxUploads: number
                token: string
                finalExpiration: Date | string
                userId: string
                name: string
                expireAfterFirstUpload: boolean
                shouldResetLinkCountExpiration: boolean
                now: Date
                linkCountexpireAt: Date | null
            }
    ):
        Promise<[{
            token: string;
            expireAfterFirstUpload: boolean;
            name: string | null;
            userId: string;
            id: string;
            maxUploads: number;
            uploadCount: number;
            expiresAt: Date;
            createdAt: Date;
            updatedAt: Date;
        } | null, {
            name: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            avatar: string | null;
            linkCount: number;
            linkCountExpireAt: Date | null;
        } | null]>

    expired_link_count(): Promise<number>

    find_expired_links(limit: number, offset: number):
        Promise<(Link & { files: FileRow[] })[]>

}



export interface ILinkService {
    GenerateLinkForUpload(user: UserWithPlan, body: CreateLinkBody): Promise<ApiResponse | ApiError>

    validateLink(token: string): Promise<boolean>

    deleteLink(link: any, userId: string): Promise<ApiResponse | ApiError>

    getLinksCount(userId: string): Promise<ApiResponse | ApiError>
}
