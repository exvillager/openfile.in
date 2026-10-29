import { CONFIG } from "@/config";
import { RedisCache } from "@/service/cache.service";
import { ResendMailService } from "@/service/mail.service";
import { R2StorageService } from "@/service/r2.cloudflare";
import { S3Service } from "@/service/s3.service";

// Select storage
function createStorageService() {
  const name = CONFIG.STORAGE_TYPE.toLowerCase() || "r2";

  switch (name) {
    case "s3":
      return S3Service.getInstance();

    case "r2":
    default:
      return R2StorageService.getInstance(
        CONFIG.CLOUDFLARE_BUCKET!,
        CONFIG.CLOUDFLARE_ACCOUNT_ID!,
        CONFIG.CLOUDFLARE_ACCESS_KEY!,
        CONFIG.CLOUDFLARE_SECRET_KEY!,
      );
  }
}

function createMailer() {
  const type = process.env.MAILER_TYPE || "resend";
  switch (type.toLowerCase()) {
    case "resend":
      return new ResendMailService();
    case "nodemailer":
    default:
      return new ResendMailService();
  }
}

function createCacheService() {
  const name = process.env.CACHE;
  switch (name) {
    case "redis":
      return RedisCache.getInstance();

    default:
      return RedisCache.getInstance();
  }
}

export const storageService = createStorageService();
export const mailer = createMailer();
export const cacheService = createCacheService();
