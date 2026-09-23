import { uuidv7 } from "uuidv7"
import { ApiError } from "../utils/apiError";
import ApiResponse from "../utils/apiRespone";
import { getFinalLinkExpiration } from "../utils/getLinkExpiration";
import { enqueueFileDeletes } from "../queue/bullmq/queue/delete-files.queue";
import { ILinkRepo, ILinkService } from "../interface/link.interface";
import { IDeleteFileRepo } from "../interface/delete-file.interface";
import { RedisCache } from "./cache.service";
import { UserWithPlan } from "../interface/user.interface";
import { CreateLinkBody } from "../zod/schema";

export const planLimits = {
    free: { maxLinks: 5, maxUploadsPerLink: 2, fileExpiration: 1 },
    pro: { maxLinks: 100, maxUploadsPerLink: 100, fileExpiration: 15 },
    enterprise: { maxLinks: Infinity, maxUploadsPerLink: 100, fileExpiration: 30 },
};

interface PlanLimits {
    maxLinks: number
    maxUploadsPerLink: number
    fileExpiration: number
}

export const ONE_DAY = 24 * 60 * 60 * 1000



export default class LinkService implements ILinkService {
    private static instance: LinkService

    constructor(
        private linkRepository: ILinkRepo,
        private deletedFileRepository: IDeleteFileRepo,
        private cache: RedisCache
    ) { }

    static getInstance(linkRepository: ILinkRepo, deletedFileRepository: IDeleteFileRepo, cache: RedisCache) {
        if (!LinkService.instance) {
            LinkService.instance = new LinkService(linkRepository, deletedFileRepository, cache)
        }
        return LinkService.instance;
    }

    //
    GenerateLinkForUpload = async (user: UserWithPlan, body: CreateLinkBody) => {
        const planName = (user.subscription?.planName as keyof typeof planLimits) || 'free';
        const limits: PlanLimits = planLimits[planName] ?? planLimits.free;

        const now = new Date()

        const linkCount = user.linkCount;
        const linkCountexpireAt = user.linkCountExpireAt;
        let shouldResetLinkCountExpiration: boolean = false

        // it is used to make user only generated limited amount of link and next day gets expired so now he can create new link
        // it means it's first time link creation or link count expiration has expied
        if (linkCount === 0 || !linkCountexpireAt || now > new Date(linkCountexpireAt)) {
            shouldResetLinkCountExpiration = true
        }

        if (linkCount >= limits.maxLinks) {
            const readableTime = linkCountexpireAt?.toLocaleString() || "tomorrow";
            throw new ApiError(
                `You have reached your daily limit of ${limits.maxLinks} links. Try again after ${readableTime}`,
                403)
        }

        const { expiresAt, maxUploads, expireAfterFirstUpload } = body

        // checking max upload of a user
        let finalMaxUploads: number;
        if (expireAfterFirstUpload) {
            finalMaxUploads = 1;
        }
        else if (planName === 'free') {
            finalMaxUploads = limits.maxUploadsPerLink;
        }
        else {
            if (maxUploads > limits.maxUploadsPerLink) {
                throw new ApiError(`You can only upload ${limits.maxUploadsPerLink} files per link.`, 400)
            }
            else if (!maxUploads) {
                finalMaxUploads = limits.maxUploadsPerLink
            }
            else {
                finalMaxUploads = maxUploads
            }
        }

        // check expiresAt of a user
        const maxExpiration = limits.fileExpiration * ONE_DAY
        let finalExpiration: Date | string = getFinalLinkExpiration(expiresAt, maxExpiration, now as Date)

        const token = uuidv7()

        // Creating
        const [link] = await this.linkRepository.createLink(
            {
                expireAfterFirstUpload,
                finalExpiration,
                finalMaxUploads,
                linkCountexpireAt,
                name: body.name ?? '',
                now,
                shouldResetLinkCountExpiration,
                token,
                userId: user.id
            }
        )

        if (!link) throw new ApiError("error while creating link", 500)

        return new ApiResponse(
            201,
            "link created successfully",
            {
                id: link.id,
                token,
            },
        )

    }


    validateLink = async (token: string): Promise<boolean> => {
        const cacheKey = `link:${token}`;

        let cached = await this.cache.get(cacheKey);
        let link = cached ? JSON.parse(cached) : null;

        if (!link) {
            link = await this.linkRepository.FindLinkWithTokenIvAndKey(token);

            if (!link) {
                throw new ApiError("Link is not valid", 400);
            }

            await this.cache.setWithOptions(cacheKey, JSON.stringify(link), { EX: 60 });
        }

        const expiresAt = new Date(link.expiresAt);

        if (
            isNaN(expiresAt.getTime()) ||
            expiresAt.getTime() <= Date.now()
        ) {
            throw new ApiError("Link is not valid", 400);
        }

        return true;
    };

    deleteLink = async (link: any, userId: string) => {

        // in future we have to make delete files async so it will delete all files in the background
        // for that we can store all files url in redis and db then run a background job that will clean all these
        // url so even if server shuts down or link /file gets deleted we will have therir files url saved and
        // can delete by brute force thet if deleted then delete from local db or for next round cron job
        const files = link.files as Array<{ id: string, url: string }>;
        if (files.length > 0) {

            await this.deletedFileRepository.createMany(files, link.id)

            await enqueueFileDeletes(link.id, files);
        }

        await this.linkRepository.deleteLink(link.id, userId)
        this.cache.del(`link:${link.token}`)

        return new ApiResponse(
            200,
            "link deleted successfully",
            {},
        )
    }

    //
    getLinksCount = async (userId: string) => {
        const links = await this.linkRepository.FindUserLinksCount(userId)
        return new ApiResponse(
            200,
            "links count fetched successfully",
            { links },
        )
    }
}
