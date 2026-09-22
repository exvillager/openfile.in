import { ICache } from "../interface/cache.interface"
import { ILinkRepo, Link } from "../interface/link.interface"
import { IUserRepository } from "../interface/user.interface"
import { HTTPException } from "diesel-core/http-exception"
import { verifyToken, verifyRefreshToken } from "../utils/jwt"
import { calculateTTL, script } from "../utils/helper"
import { redis } from "../config/redis"
import { uploadRequestSchema } from "../zod/schema"
import { RATE_LIMIT, WINDOW, REFRESH_TOKEN_RATE_LIMIT, REFRESH_TOKEN_RATE_WINDOW } from "../../constant"
import { ContextType } from "diesel-core"
import { enforceRateLimit, getClientIp } from "../utils/rate-limit"


export class DieselMiddlewares {
    private static instance: DieselMiddlewares
    private userRepository: IUserRepository
    private linkRepository: ILinkRepo
    private cache: ICache

    constructor(
        userRepository: IUserRepository,
        linkRepository: ILinkRepo,
        cache: ICache,
    ) {
        this.userRepository = userRepository,
            this.linkRepository = linkRepository,
            this.cache = cache
    }

    static getInstance(userRepository: IUserRepository, linkRepository: ILinkRepo, cache: ICache) {
        if (!this.instance) {
            this.instance = new DieselMiddlewares(userRepository, linkRepository, cache)
        }
        return DieselMiddlewares.instance
    }


    authJwt = async (c: ContextType) => {
        try {
            let token = c.req?.headers.get("Authorization") ?? c.cookies?.accessToken

            if (!token) {
                throw new HTTPException(401, {
                    message: "Unauthorized",
                    cause: "No token provided"
                });
            }

            const decoded = verifyToken(token)
            if (!decoded || !decoded.id) {
                throw new HTTPException(401, {
                    message: "Unauthorized",
                    cause: "Invalid token"
                });
            }


            const user = await this.userRepository.findUserAndPlanName(decoded.id as string)

            if (!user) {
                throw new HTTPException(401, {
                    message: "Unauthorized: User not found",
                });
            }

            c.set("user", user);
        } catch (error: any) {
            console.error("JWT verification error:", error?.message);
            let errMsg = "Invalid token";
            if (error.name === "TokenExpiredError") {
                errMsg = "Token expired";
            } else if (error.name === "JsonWebTokenError") {
                errMsg = "Malformed or tampered token";
            }

            if ((error).name === 'HTTPException') throw error;

            throw new HTTPException(401, {
                message: errMsg,
                cause: error?.message
                // res: c.json({ message: "Unauthorized", error: errMsg }, 401)
            });
        }
    }

    // 

    UploadRateLimit = async (c: ContextType): Promise<Response | void | any> => {
        try {
            // here we can make upload rate limit more better with using token as key so that a token can only hanlde 5 req/s 
            // but what if many users wants to upload at the same link token? it would be bad experience
            // mayb ewe can try ip+token so that each user can only make 5 req/s with his ip with the token
            const ip = getClientIp(c);

            const token = c.query.token
            const key = `upload:rate:${ip}:${token}`

            const current = Number(await redis.incr(key))
            if (current === 1) await redis.expire(key, WINDOW);

            c.setHeader('X-RateLimit-Limit', RATE_LIMIT.toString())
            c.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - current).toString())
            c.setHeader('X-RateLimit-Reset', (WINDOW).toString())

            if (current > RATE_LIMIT) {
                throw new HTTPException(429, {
                    message: "Too many requests. Try again later.",
                    cause: "Too many requests. Try again later."
                });
            }

            // do nothing.
            return;
        } catch (error: any) {
            if ((error).name === 'HTTPException') throw error;
            console.error("Internal error in UploadRateLimit:", error);
            throw new HTTPException(500, { message: "Internal Server Error in rate limit upload" });
        }
    }

    validateToken = async (ctx: ContextType): Promise<any> => {
        try {
            const token = ctx.query.token
            if (!token) throw new HTTPException(404, { message: "Token is required" });

            const link = await this.linkRepository.findLinkByToken(token);
            if (!link || new Date(link.expiresAt) < new Date()) {
                throw new HTTPException(404, { message: "Link not found or expired" });
            }

            ctx.set('link', link)

        } catch (error: any) {
            if ((error).name === 'HTTPException') throw error;
            console.error("Internal Server Error in validate token ", error);
            throw new HTTPException(500, { message: "Internal Server Error in validate token" });
        }
    }

    //

    validateLinkAccess = async (c: ContextType) => {
        try {
            const link = c.get("link") as Link
            if (!link) throw new HTTPException(400, { message: "Link not found in context" });


            const body = await c.body
            const parsed = uploadRequestSchema.safeParse(body);
            if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);

            const { mimeType, fileSize } = parsed.data;
            const redisKey = `upload:count:${link.id}`;
            const maxUploads = link.maxUploads
            const ttl = calculateTTL(fileSize);
            const expireAfterFirst = link.expireAfterFirstUpload ? "1" : "0";

            let result: number;
            try {
                result = Number(await redis.eval(script, 1, redisKey, maxUploads, ttl, expireAfterFirst));
            } catch (err) {
                console.error("Redis error:", err);
                result = 0;
            }

            if (result === -1 || result === -2) {
                throw new HTTPException(403, {
                    message: "Unable to process upload at this time.",
                });
            }

            const { uploadCount } = await this.linkRepository.findLinkUploadCount(link.id)
            if (result === -1 || result === -2 || uploadCount >= maxUploads) {
                throw new HTTPException(403, {
                    message: "Unable to process upload at this time.",
                });
            }


            c.set('mimeType', mimeType)
            c.set('fileSize', fileSize)

        } catch (error: any) {
            if (error?.name === "HTTPException") throw error;
            console.error("validateLinkAccess error:", error);
            throw new HTTPException(500, {
                res: c.json({ error: "Internal Server Error in validateLinkAccess" }, 500)
            });
        }
    };


    fetchUser = async (c: ContextType): Promise<any> => {
        try {
            let token = c.req.headers.get('Authorization') ?? c.cookies?.accessToken
            if (!token) throw new HTTPException(401, { message: 'Unauthorized', cause: 'No token provided' })

            const decoded = verifyToken(token)
            if (!decoded || !decoded.id) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid token' })

            const user = await this.userRepository.findUserId(decoded.id as string)
            if (!user) throw new HTTPException(401, { message: 'Unauthorized: User not found' })

            c.set('user', user)
        } catch (error: any) {
            if (error?.name === 'HTTPException') throw error
            throw new HTTPException(401, { message: 'Unauthorized', cause: error?.message })
        }
    }

    fetchUserFromRefreshToken = async (c: ContextType): Promise<any> => {
        try {
            const ip = getClientIp(c)
            await enforceRateLimit(`refresh:rate:ip:${ip}`, REFRESH_TOKEN_RATE_LIMIT, REFRESH_TOKEN_RATE_WINDOW)

            const token = c.cookies?.refreshToken
            if (!token) throw new HTTPException(401, { message: 'Unauthorized', cause: 'No refresh token provided' })

            const decoded = verifyRefreshToken(token)
            if (!decoded || !decoded.id) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid refresh token' })

            await enforceRateLimit(`refresh:rate:user:${decoded.id}`, REFRESH_TOKEN_RATE_LIMIT, REFRESH_TOKEN_RATE_WINDOW)

            const user = await this.userRepository.findUserId(decoded.id as string)
            if (!user) throw new HTTPException(401, { message: 'Unauthorized: User not found' })

            c.set('user', user)
        } catch (error: any) {
            if (error?.name === 'HTTPException') throw error
            throw new HTTPException(401, { message: 'Unauthorized', cause: error?.message })
        }
    }

    fetchUserLinks = async (c: ContextType): Promise<any> => {
        try {
            let token = c.req.headers.get('Authorization') ?? c.cookies?.accessToken
            if (!token) throw new HTTPException(401, { message: 'Unauthorized', cause: 'No token provided' })

            const decoded = verifyToken(token)
            if (!decoded || !decoded.id) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid token' })

            const query = c.query.query || ''
            const limit = parseInt(c.query.limit || '10')
            const page = parseInt(c.query.page || '1')
            const skip = (page - 1) * limit

            const links = await this.linkRepository.findUserLinks(decoded.id as string, query, skip, limit)
            if (!links || links.length === 0) {
                return c.json({ error: 'No links found or unauthorized', data: [] }, 200)
            }

            c.set('userId', decoded.id)
            c.set('userLinks', links)
            c.set('pagination', { limit, page })
        } catch (error: any) {
            if (error?.name === 'HTTPException') throw error
            throw new HTTPException(500, { message: 'Internal Server Error in fetchUserLinks' })
        }
    }

    fetchLinkWithUser = async (c: ContextType): Promise<any> => {
        try {
            let token = c.req.headers.get('Authorization') ?? c.cookies?.accessToken
            if (!token) throw new HTTPException(401, { message: 'Unauthorized', cause: 'No token provided' })

            const decoded = verifyToken(token)
            if (!decoded || !decoded.id) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid token' })

            const linkId = c.params.id
            if (!linkId) throw new HTTPException(400, { message: 'Invalid link ID' })

            const link = await this.linkRepository.findLinkByIdAndUser(linkId, decoded.id as string)
            if (!link) throw new HTTPException(404, { message: 'Not Found' })

            c.set('userId', decoded.id)
            c.set('link', link)
        } catch (error: any) {
            if (error?.name === 'HTTPException') throw error
            throw new HTTPException(500, { message: 'Internal Server Error in fetchLinkWithUser' })
        }
    }

    fetchFilesByTokenMiddleware = async (c: ContextType): Promise<any> => {
        try {
            let token = c.req.headers.get('Authorization') ?? c.cookies?.accessToken
            if (!token) throw new HTTPException(401, { message: 'Unauthorized', cause: 'No token provided' })

            const decoded = verifyToken(token)
            if (!decoded || !decoded.id) throw new HTTPException(401, { message: 'Unauthorized', cause: 'Invalid token' })
            const linkToken = c.params.token
            const linkId = c.params.id
            if (!linkToken || !linkId) throw new HTTPException(400, { message: 'Token param or linkId missing' })

            const limit = parseInt(c.query.limit || '10')
            const page = parseInt(c.query.page || '1')
            const skip = (page - 1) * limit

            const link = await this.linkRepository.findLinkWithFilesByTokenAndUserId(linkId, linkToken, decoded.id as string, skip, limit)
            if (!link) throw new HTTPException(404, { message: 'No files found or unauthorized access' })

            c.set('files', link.files)
            c.set('pagination', { page, limit })
        } catch (error: any) {
            if (error?.name === 'HTTPException') throw error
            throw new HTTPException(500, { message: 'Internal Server Error in fetchFilesByTokenMiddleware' })
        }
    }

}