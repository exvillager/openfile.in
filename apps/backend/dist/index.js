var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/db/sqlite-schema.ts
var sqlite_schema_exports = {};
__export(sqlite_schema_exports, {
  deletedFiles: () => deletedFiles2,
  files: () => files2,
  filesRelations: () => filesRelations2,
  links: () => links2,
  linksRelations: () => linksRelations2,
  subscriptionLogs: () => subscriptionLogs2,
  subscriptionLogsRelations: () => subscriptionLogsRelations2,
  subscriptions: () => subscriptions2,
  subscriptionsRelations: () => subscriptionsRelations2,
  users: () => users2,
  usersRelations: () => usersRelations2
});
import { sqliteTable, text as text2, integer as integer2, real, blob } from "drizzle-orm/sqlite-core";
import { relations as relations2 } from "drizzle-orm";
import { uuidv7 as uuidv73 } from "uuidv7";
var users2, usersRelations2, links2, linksRelations2, files2, filesRelations2, subscriptions2, subscriptionsRelations2, deletedFiles2, subscriptionLogs2, subscriptionLogsRelations2;
var init_sqlite_schema = __esm({
  "src/db/sqlite-schema.ts"() {
    users2 = sqliteTable("User", {
      id: text2("id").primaryKey().$defaultFn(() => uuidv73()),
      email: text2("email"),
      name: text2("name"),
      username: text2("username").unique().notNull(),
      passoword: text2("passoword"),
      avatar: text2("avatar").default(""),
      linkCount: integer2("linkCount").default(0).notNull(),
      linkCountExpireAt: integer2("linkCountExpireAt", { mode: "timestamp" }),
      createdAt: integer2("createdAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer2("updatedAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    usersRelations2 = relations2(users2, ({ one, many }) => ({
      links: many(links2),
      files: many(files2),
      subscription: one(subscriptions2, { fields: [users2.id], references: [subscriptions2.userId] })
    }));
    links2 = sqliteTable("Link", {
      id: text2("id").primaryKey().$defaultFn(() => uuidv73()),
      token: text2("token").notNull(),
      name: text2("name").default(""),
      maxUploads: integer2("maxUploads").notNull(),
      uploadCount: integer2("uploadCount").notNull(),
      expiresAt: integer2("expiresAt", { mode: "timestamp" }).notNull(),
      expireAfterFirstUpload: integer2("expireAfterFirstUpload", { mode: "boolean" }).default(false).notNull(),
      userId: text2("userId").notNull(),
      createdAt: integer2("createdAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer2("updatedAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    linksRelations2 = relations2(links2, ({ one, many }) => ({
      user: one(users2, { fields: [links2.userId], references: [users2.id] }),
      files: many(files2)
    }));
    files2 = sqliteTable("File", {
      id: text2("id").primaryKey().$defaultFn(() => uuidv73()),
      url: text2("url").notNull(),
      name: text2("name").notNull(),
      size: blob("size", { mode: "bigint" }).notNull(),
      keyUsed: integer2("keyUsed", { mode: "boolean" }).default(false).notNull(),
      uploadLinkId: text2("uploadLinkId").notNull(),
      userId: text2("userId").notNull(),
      createdAt: integer2("createdAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer2("updatedAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    filesRelations2 = relations2(files2, ({ one }) => ({
      uploadLink: one(links2, { fields: [files2.uploadLinkId], references: [links2.id] }),
      user: one(users2, { fields: [files2.userId], references: [users2.id] })
    }));
    subscriptions2 = sqliteTable("Subscription", {
      id: text2("id").primaryKey().$defaultFn(() => uuidv73()),
      userId: text2("userId").unique().notNull(),
      planName: text2("planName").default("free").notNull(),
      price: real("price").default(0).notNull(),
      status: text2("status", { enum: ["ACTIVE", "INACTIVE", "CANCELLED"] }).default("ACTIVE"),
      startDate: integer2("startDate", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      endDate: integer2("endDate", { mode: "timestamp" }),
      cancelAt: integer2("cancelAt", { mode: "timestamp" }),
      createdAt: integer2("createdAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer2("updatedAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    subscriptionsRelations2 = relations2(subscriptions2, ({ one }) => ({
      user: one(users2, { fields: [subscriptions2.userId], references: [users2.id] })
    }));
    deletedFiles2 = sqliteTable("DeletedFile", {
      id: text2("id").primaryKey().$defaultFn(() => uuidv73()),
      fileId: text2("fileId").notNull(),
      linkId: text2("linkId").notNull(),
      fileUrl: text2("fileUrl").notNull(),
      status: text2("status", { enum: ["PENDING", "DELETED", "FAILED"] }).default("PENDING").notNull(),
      deletedAt: integer2("deletedAt", { mode: "timestamp" }),
      createdAt: integer2("createdAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer2("updatedAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    subscriptionLogs2 = sqliteTable("SubscriptionLog", {
      id: text2("id").primaryKey().$defaultFn(() => uuidv73()),
      eventType: text2("eventType").notNull(),
      status: text2("status").notNull(),
      userEmail: text2("userEmail").notNull(),
      userId: text2("userId"),
      paymentId: text2("paymentId").unique().notNull(),
      subscriptionId: text2("subscriptionId"),
      amount: integer2("amount").notNull(),
      currency: text2("currency").notNull(),
      rawPayload: text2("rawPayload", { mode: "json" }).notNull(),
      message: text2("message").notNull(),
      error: text2("error"),
      createdAt: integer2("createdAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
      updatedAt: integer2("updatedAt", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
    });
    subscriptionLogsRelations2 = relations2(subscriptionLogs2, ({ one }) => ({
      user: one(users2, { fields: [subscriptionLogs2.userId], references: [users2.id] })
    }));
  }
});

// src/config/redis.ts
import Redis from "ioredis";
var RedisClient = class _RedisClient {
  static instance;
  constructor() {
  }
  static getInstance() {
    if (!_RedisClient.instance) {
      _RedisClient.instance = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) : new Redis({ maxRetriesPerRequest: null });
      _RedisClient.instance.set("animal", "cat");
      _RedisClient.instance.get("animal").then((result) => {
        console.log("Test value:", result);
      });
      _RedisClient.instance.once("connect", () => console.log("Redis connected"));
      _RedisClient.instance.once("error", (err) => console.error("Redis Error:", err));
    }
    return _RedisClient.instance;
  }
};
var redis = RedisClient.getInstance();

// src/config/index.ts
function get_or_throw_env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
function get_env(name) {
  return process.env[name];
}
var CONFIG = {
  // SERVER
  PORT: get_env("PORT"),
  NODE_ENV: get_env("NODE_ENV"),
  GOOGLE_CLIENT_ID: get_env("GOOGLE_CLIENT_ID"),
  CORS_ORIGINS: get_or_throw_env("CORS_ORIGIN"),
  // database
  DATABASE_URL: get_or_throw_env("DATABASE_URL"),
  DB_CLIENT: get_env("DB_CLIENT"),
  DB_HOST: get_env("DB_HOST"),
  DB_USER: get_env("DB_USER"),
  DB_PORT: get_env("DB_PORT"),
  DB_NAME: get_env("DB_NAME"),
  DB_PASS: get_env("DB_PASS"),
  // auth
  JWT_SECRET: get_or_throw_env("JWT_SECRET"),
  ACCESS_TOKEN_SECRET: get_or_throw_env("ACCESS_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: get_env("ACCESS_TOKEN_EXPIRY") ?? "5d",
  REFRESH_TOKEN_SECRET: get_or_throw_env("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRY: get_env("REFRESH_TOKEN_EXPIRY") ?? "15d",
  // cloudflare storage
  CLOUDFLARE_BUCKET: get_env("CLOUDFLARE_BUCKET"),
  CLOUDFLARE_ACCOUNT_ID: get_env("CLOUDFLARE_ACCOUNT_ID"),
  CLOUDFLARE_ACCESS_KEY: get_env("CLOUDFLARE_ACCESS_KEY"),
  CLOUDFLARE_SECRET_KEY: get_env("CLOUDFLARE_SECRET_KEY"),
  CLOUDFLARE_TOKEN_VALUE: get_env("CLOUDFLARE_TOKEN_VALUE"),
  STORAGE_TYPE: get_env("STORAGE_TYPE") ?? "r2",
  // mail
  MAIL_SERVICE: get_env("MAIL_SERVICE"),
  MAIL_USER: get_env("MAIL_USER"),
  MAIL_PASS: get_env("MAIL_PASS"),
  RESEND_API_KEY: get_env("RESEND_API_KEY"),
  // redis
  REDIS_HOST: get_env("REDIS_HOST"),
  REDIS_PASS: get_env("REDIS_PASS"),
  // dodo payments
  DODO_PAYMENTS_API_KEY: get_env("DODO_PAYMENTS_API_KEY"),
  DODO_PAYMENTS_WEBHOOK_KEY: get_env("DODO_PAYMENTS_WEBHOOK_KEY"),
  DODO_PAYMENTS_ENVIRONMENT: get_env("DODO_PAYMENTS_ENVIRONMENT") ?? "test_mode",
  DODO_PAYMENTS_RETURN_URL: get_env("DODO_PAYMENTS_RETURN_URL")
};

// src/service/cache.service.ts
var RedisCache = class _RedisCache {
  static instance;
  constructor() {
  }
  static getInstance() {
    if (!_RedisCache.instance) {
      _RedisCache.instance = new _RedisCache();
    }
    return _RedisCache.instance;
  }
  async get(key) {
    return redis.get(key);
  }
  async set(key, value, ttl) {
    if (ttl) {
      return redis.set(key, value, "EX", ttl);
    }
    return redis.set(key, value);
  }
  async setWithOptions(key, value, options) {
    const args = [key, value];
    if (options.PX) {
      args.push("PX", options.PX);
    } else if (options.EX) {
      args.push("EX", options.EX);
    }
    if (options.NX) {
      args.push("NX");
    } else if (options.XX) {
      args.push("XX");
    }
    if (args.length > 2) {
      return redis.set(args[0], args[1], ...args.slice(2));
    }
    return redis.set(key, value);
  }
  async del(key) {
    return redis.del(key);
  }
  async incr(key) {
    return redis.incr(key);
  }
  async expire(key, seconds) {
    return redis.expire(key, seconds);
  }
};

// src/service/mail.service.ts
import { Resend } from "resend";

// src/config/mail.config.ts
import * as nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  service: CONFIG.MAIL_SERVICE,
  auth: {
    user: CONFIG.MAIL_USER,
    pass: CONFIG.MAIL_PASS
  }
});
var hostEmail = CONFIG.MAIL_USER;

// src/service/mail.service.ts
var ResendMailService = class {
  resend;
  constructor() {
    this.resend = new Resend(CONFIG.RESEND_API_KEY);
  }
  async sendMail({ to, subject, html, text: text3 }) {
    if (!CONFIG.MAIL_USER) {
      console.error("Resend send error: MAIL_USER is not configured");
      return false;
    }
    ;
    const content = html ? { html } : text3 ? { text: text3 } : null;
    if (!content) {
      console.error("Resend send error: missing html or text content");
      return false;
    }
    try {
      await this.resend.emails.send({
        from: CONFIG.MAIL_USER,
        to,
        subject,
        ...content
      });
      console.log(`Resend email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      console.error("Resend send error:", error);
      return false;
    }
  }
};

// src/interface/storage.interface.ts
function extractKeyFromUrl(url) {
  const parsed = new URL(url);
  return parsed.pathname.slice(1);
}

// src/service/r2.cloudflare.ts
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// src/utils/helper.ts
import { uuidv7 } from "uuidv7";
import * as mime from "mime-types";
var getFolderByMime = (mimeType) => {
  if (mimeType.startsWith("video/")) return "videos";
  if (mimeType.startsWith("image/")) return "images";
  return "files";
};
var getKey = (mimeType) => {
  const ext = mime.extension(mimeType) || "bin";
  const folder = getFolderByMime(mimeType);
  return `uploads/${folder}/${uuidv7()}.${ext}`;
};
function calculateTTL(fileSizeBytes) {
  const MB = 1024 * 1024;
  const sizeInMB = fileSizeBytes / MB;
  const baseTTL = Math.ceil(sizeInMB / 10) * 30;
  return Math.min(Math.max(baseTTL, 30), 600);
}
var script = `
local key = KEYS[1]
local max = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local expireAfterFirst = tonumber(ARGV[3])

local current = redis.call("GET", key)
if not current then
  redis.call("SET", key, 1, "EX", ttl)
  return 1
end

current = tonumber(current)
if current >= max then
  return -1
end

current = redis.call("INCR", key)

-- If expireAfterFirstUpload and count > 1, reject
if expireAfterFirst == 1 and current > 1 then
  return -2
end

return current
`;

// src/service/r2.cloudflare.ts
import { Upload } from "@aws-sdk/lib-storage";
var R2StorageService = class _R2StorageService {
  constructor(bucket, accountId, accessKey, secretKey) {
    this.bucket = bucket;
    this.client = new S3Client({
      region: "auto",
      // cloudflare needs auto
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey
      }
    });
    this.Instancename = "r2";
  }
  bucket;
  client;
  static instance;
  Instancename;
  static getInstance(bucket, accountId, accessKey, secretKey) {
    if (!_R2StorageService.instance) {
      _R2StorageService.instance = new _R2StorageService(bucket, accountId, accessKey, secretKey);
    }
    return _R2StorageService.instance;
  }
  name() {
    return this.Instancename;
  }
  async generateSignedDownloadUrl(key) {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return await getSignedUrl(this.client, cmd, { expiresIn: 3600 });
  }
  async generatePresignedUploadUrl(mimeType) {
    const key = getKey(mimeType);
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType
    });
    const url = await getSignedUrl(this.client, cmd, { expiresIn: 3600 });
    return { url, key };
  }
  async uploadFile(file) {
    const key = getKey(file.type);
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: file.type
      }
    });
    await upload.done();
    const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, key };
  }
  async uploadStream(stream, contentType) {
    const key = getKey(contentType);
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType
      }
    });
    await upload.done();
    const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, key };
  }
  async deleteFiles(files3) {
    if (files3.length === 0) return;
    const objects = files3.map((f) => ({
      Key: extractKeyFromUrl(f.url)
    }));
    try {
      const res = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: { Objects: objects }
        })
      );
      if (res.Errors && res.Errors.length > 0) {
        console.warn("S3 deletion errors:", res.Errors);
        return false;
      }
      return true;
    } catch (error) {
      console.log("error while deleting files from R2", error);
      return false;
    }
  }
};

// src/service/s3.service.ts
import {
  DeleteObjectsCommand as DeleteObjectsCommand2,
  GetObjectCommand as GetObjectCommand2,
  PutObjectCommand as PutObjectCommand2,
  S3Client as S3Client2
} from "@aws-sdk/client-s3";
import { Upload as Upload2 } from "@aws-sdk/lib-storage";
import { getSignedUrl as getSignedUrl2 } from "@aws-sdk/s3-request-presigner";
var S3Service = class _S3Service {
  client;
  bucket;
  static instance;
  instanceName;
  constructor() {
    this.client = new S3Client2({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    this.bucket = process.env.AWS_BUCKET;
    this.instanceName = "s3";
  }
  static getInstance() {
    if (!_S3Service.instance) {
      _S3Service.instance = new _S3Service();
    }
    return _S3Service.instance;
  }
  name() {
    return this.instanceName;
  }
  async uploadFile(file) {
    const key = getKey(file.type);
    const upload = new Upload2({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: file.type
      }
    });
    await upload.done();
    const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, key };
  }
  async uploadStream(stream, contentType) {
    const key = getKey(contentType);
    const upload = new Upload2({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: stream,
        ContentType: contentType
      }
    });
    await upload.done();
    const url = `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { url, key };
  }
  async generateSignedDownloadUrl(key) {
    const cmd = new GetObjectCommand2({ Bucket: this.bucket, Key: key });
    return await getSignedUrl2(this.client, cmd, { expiresIn: 3600 });
  }
  async generatePresignedUploadUrl(mimeType) {
    try {
      const key = getKey(mimeType);
      const cmd = new PutObjectCommand2({
        Bucket: this.bucket,
        Key: key,
        ContentType: mimeType
      });
      const url = await getSignedUrl2(this.client, cmd, { expiresIn: 3600 });
      return { url, key };
    } catch (error) {
      console.error("Error generating presigned upload URL:", error);
    }
  }
  deleteFiles = async (files3) => {
    console.log("called s3 deleted method ", this.name());
    if (files3.length === 0) return;
    const objects = files3.map((f) => ({
      Key: extractKeyFromUrl(f.url)
    }));
    try {
      const res = await this.client.send(
        new DeleteObjectsCommand2({
          Bucket: this.bucket,
          Delete: { Objects: objects }
        })
      );
      if (res.Errors && res.Errors.length > 0) {
        console.warn("S3 deletion errors:", res.Errors);
        return false;
      }
      return true;
    } catch (error) {
      console.log("error while deleting files from s3", error);
      return false;
    }
  };
};

// src/container/storage.ts
function createStorageService() {
  const name = CONFIG.STORAGE_TYPE.toLowerCase() || "r2";
  switch (name) {
    case "s3":
      return S3Service.getInstance();
    case "r2":
    default:
      return R2StorageService.getInstance(
        CONFIG.CLOUDFLARE_BUCKET,
        CONFIG.CLOUDFLARE_ACCOUNT_ID,
        CONFIG.CLOUDFLARE_ACCESS_KEY,
        CONFIG.CLOUDFLARE_SECRET_KEY
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
var storageService = createStorageService();
var mailer = createMailer();
var cacheService = createCacheService();

// src/config/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// src/db/index.ts
var db_exports = {};
__export(db_exports, {
  deletedFiles: () => deletedFiles,
  deletedStatus: () => deletedStatus,
  files: () => files,
  filesRelations: () => filesRelations,
  links: () => links,
  linksRelations: () => linksRelations,
  subscriptionLogs: () => subscriptionLogs,
  subscriptionLogsRelations: () => subscriptionLogsRelations,
  subscriptionStatus: () => subscriptionStatus,
  subscriptions: () => subscriptions,
  subscriptionsRelations: () => subscriptionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});

// src/db/schema.ts
import { pgTable, varchar, text, integer, boolean, bigint, timestamp, json, doublePrecision, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uuidv7 as uuidv72 } from "uuidv7";
var subscriptionStatus = pgEnum("SubscriptionStatus", ["ACTIVE", "INACTIVE", "CANCELLED"]);
var deletedStatus = pgEnum("DeletedStatus", ["PENDING", "DELETED", "FAILED"]);
var users = pgTable("User", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv72()),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 255 }).unique().notNull(),
  passoword: text("passoword"),
  avatar: varchar("avatar", { length: 255 }).default(""),
  linkCount: integer("linkCount").default(0).notNull(),
  linkCountExpireAt: timestamp("linkCountExpireAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var usersRelations = relations(users, ({ one, many }) => ({
  links: many(links),
  files: many(files),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] })
}));
var links = pgTable(
  "Link",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv72()),
    token: varchar("token", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).default(""),
    maxUploads: integer("maxUploads").notNull(),
    uploadCount: integer("uploadCount").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    expireAfterFirstUpload: boolean("expireAfterFirstUpload").default(false).notNull(),
    userId: uuid("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull()
  }
);
var linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  files: many(files)
}));
var files = pgTable(
  "File",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv72()),
    url: text("url").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    size: bigint("size", { mode: "bigint" }).notNull(),
    keyUsed: boolean("keyUsed").default(false).notNull(),
    uploadLinkId: uuid("uploadLinkId").notNull().references(() => links.id, { onDelete: "cascade" }),
    userId: uuid("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull()
  }
);
var filesRelations = relations(files, ({ one }) => ({
  uploadLink: one(links, { fields: [files.uploadLinkId], references: [links.id] }),
  user: one(users, { fields: [files.userId], references: [users.id] })
}));
var subscriptions = pgTable(
  "Subscription",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv72()),
    userId: uuid("userId").unique().notNull(),
    planName: varchar("planName", { length: 255 }).default("free").notNull(),
    price: doublePrecision("price").default(0).notNull(),
    status: subscriptionStatus("status").default("ACTIVE"),
    startDate: timestamp("startDate").defaultNow().notNull(),
    endDate: timestamp("endDate"),
    cancelAt: timestamp("cancelAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull()
  }
);
var subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] })
}));
var deletedFiles = pgTable(
  "DeletedFile",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv72()),
    fileId: uuid("fileId").notNull(),
    linkId: uuid("linkId").notNull(),
    fileUrl: text("fileUrl").notNull(),
    status: deletedStatus("status").default("PENDING").notNull(),
    deletedAt: timestamp("deletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull()
  }
);
var subscriptionLogs = pgTable(
  "SubscriptionLog",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv72()),
    eventType: varchar("eventType", { length: 255 }).notNull(),
    status: varchar("status", { length: 255 }).notNull(),
    userEmail: varchar("userEmail", { length: 255 }).notNull(),
    userId: uuid("userId"),
    paymentId: varchar("paymentId", { length: 255 }).unique().notNull(),
    subscriptionId: varchar("subscriptionId", { length: 255 }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 10 }).notNull(),
    rawPayload: json("rawPayload").notNull(),
    message: text("message").notNull(),
    error: text("error"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull()
  }
);
var subscriptionLogsRelations = relations(subscriptionLogs, ({ one }) => ({
  user: one(users, { fields: [subscriptionLogs.userId], references: [users.id] })
}));

// src/config/db.ts
var createDBClient = (name = "drizzle") => {
  switch (name) {
    case "sqlite": {
      const { Database } = __require("bun:sqlite");
      const { drizzle: sqliteDrizzle } = __require("drizzle-orm/bun-sqlite");
      const sqliteSchema = (init_sqlite_schema(), __toCommonJS(sqlite_schema_exports));
      const sqlite = new Database("./dev.db");
      return sqliteDrizzle(sqlite, { schema: sqliteSchema });
    }
    case "drizzle":
    default: {
      const pool = new Pool({ connectionString: CONFIG.DATABASE_URL });
      return drizzle(pool, { schema: db_exports });
    }
  }
};

// src/repository/drizzle-repo/deleted.file.drizzle.ts
import { eq } from "drizzle-orm";
import { uuidv7 as uuidv74 } from "uuidv7";
var DeletedFileRepositoryDrizzle = class _DeletedFileRepositoryDrizzle {
  static instance;
  client;
  constructor(client) {
    this.client = client;
  }
  static getInstance(client) {
    if (!_DeletedFileRepositoryDrizzle.instance) {
      _DeletedFileRepositoryDrizzle.instance = new _DeletedFileRepositoryDrizzle(client);
    }
    return _DeletedFileRepositoryDrizzle.instance;
  }
  async createMany(files3, linkId) {
    const result = await this.client.insert(deletedFiles).values(
      files3.map((file) => ({
        id: uuidv74(),
        fileId: file.id,
        linkId,
        fileUrl: file.url,
        status: "PENDING",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }))
    ).returning();
    return result;
  }
  async findExpiredFiles(type, limit, offset) {
    const result = await this.client.query.deletedFiles.findMany({
      where: eq(deletedFiles.status, type),
      limit,
      offset,
      columns: {
        linkId: true,
        fileUrl: true,
        fileId: true
      }
    });
    return result;
  }
  async findExpiredLinkCount(type) {
    const number = await this.client.$count(deletedFiles, eq(deletedFiles.status, type));
    return number;
  }
};

// src/repository/drizzle-repo/file.drizzle.ts
import { and, eq as eq2, sql } from "drizzle-orm";
import { uuidv7 as uuidv75 } from "uuidv7";
var FileRepositoryDrizzle = class _FileRepositoryDrizzle {
  static instance;
  client;
  constructor(client) {
    this.client = client;
  }
  static getInstance(client) {
    if (!_FileRepositoryDrizzle.instance) {
      _FileRepositoryDrizzle.instance = new _FileRepositoryDrizzle(client);
    }
    return _FileRepositoryDrizzle.instance;
  }
  async createFileAndUpdateLink({ linkId, userId, url, name, size }) {
    console.log("creating file", name, size, userId, linkId);
    const [createdFile] = await this.client.insert(files).values({
      id: uuidv75(),
      url,
      name,
      size,
      userId,
      uploadLinkId: linkId,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    if (!createdFile) {
      console.log("failed to create file");
      return [null, null];
    }
    const [updatedLink] = await this.client.update(links).set({
      uploadCount: sql`${links.uploadCount}+1`
    }).where(and(eq2(links.id, linkId), eq2(links.userId, userId))).returning();
    if (!updatedLink) {
      console.log("failed to update link");
      return [createdFile, null];
    }
    return [createdFile, updatedLink];
  }
  async findFileByIdUserIdAndLinkId(fileId, userId, linkId) {
    const result = await this.client.query.files.findFirst({
      where: and(
        eq2(files.id, fileId),
        eq2(files.userId, userId),
        eq2(files.uploadLinkId, linkId)
      )
    });
    return result ?? null;
  }
  async findLinkByTokenAndUserId(token, userId) {
    const result = await this.client.query.links.findFirst({
      where: and(
        eq2(links.token, token),
        eq2(links.userId, userId)
      )
    });
    return result ?? null;
  }
  async getFiles(linkId, userId, skip, limit) {
    const result = await this.client.query.files.findMany({
      where: and(
        eq2(files.uploadLinkId, linkId),
        eq2(files.userId, userId)
      ),
      offset: skip,
      limit,
      orderBy: sql`${files.createdAt} DESC`
    });
    return result;
  }
  async getUser(id) {
    const result = await this.client.query.users.findFirst({
      where: eq2(links.id, id),
      columns: { id: true }
    });
    return result ?? null;
  }
  async storageUsed(userId) {
    const result = await this.client.select({
      totalSize: sql`SUM(${files.size})`
    }).from(files).where(eq2(files.userId, userId)).limit(1);
    return result[0];
  }
  async get_file_by_id(id) {
    const result = await this.client.query.files.findFirst({
      where: eq2(files.id, id)
    });
    return result;
  }
  async get_file_by_id_and_userid(id, user_id) {
    const result = await this.client.query.files.findFirst({
      where: and(
        eq2(files.id, id),
        eq2(files.userId, user_id)
      )
    });
    return result;
  }
  async delete_file_from_link(file_id, link_id, user_id) {
    const [deletedFile] = await this.client.delete(files).where(and(
      eq2(files.id, file_id),
      eq2(files.uploadLinkId, link_id),
      eq2(files.userId, user_id)
    )).returning();
    if (!deletedFile) return null;
    return deletedFile;
  }
};

// src/repository/drizzle-repo/link.drizzle.ts
import { and as and2, count, eq as eq3, ilike, lt, or, sql as sql2 } from "drizzle-orm";
import { uuidv7 as uuidv77 } from "uuidv7";

// src/service/link.service.ts
import { uuidv7 as uuidv76 } from "uuidv7";

// src/utils/apiError.ts
var ApiError = class extends Error {
  statusCode;
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
};

// src/utils/apiRespone.ts
var ApiResponse = class {
  statusCode;
  data;
  message;
  success;
  constructor(statusCode, message = "Success", data) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
};

// src/utils/getLinkExpiration.ts
var getFinalLinkExpiration = (expiresAt, maxExpiration, now) => {
  if (expiresAt) {
    const userExp = new Date(expiresAt);
    return userExp.getTime() - now.getTime() > maxExpiration ? new Date(now.getTime() + maxExpiration) : userExp;
  } else {
    return new Date(now.getTime() + maxExpiration);
  }
};

// src/queue/bullmq/queue/delete-files.queue.ts
import { Queue } from "bullmq";
var deleteQueue = new Queue("delete-queue", { connection: redis });

// src/service/link.service.ts
var planLimits = {
  free: { maxLinks: 5, maxUploadsPerLink: 2, fileExpiration: 1 },
  pro: { maxLinks: 100, maxUploadsPerLink: 100, fileExpiration: 15 },
  enterprise: { maxLinks: Infinity, maxUploadsPerLink: 100, fileExpiration: 30 }
};
var ONE_DAY = 24 * 60 * 60 * 1e3;
var LinkService = class _LinkService {
  constructor(linkRepository2, deletedFileRepository2, cache) {
    this.linkRepository = linkRepository2;
    this.deletedFileRepository = deletedFileRepository2;
    this.cache = cache;
  }
  linkRepository;
  deletedFileRepository;
  cache;
  static instance;
  static getInstance(linkRepository2, deletedFileRepository2, cache) {
    if (!_LinkService.instance) {
      _LinkService.instance = new _LinkService(linkRepository2, deletedFileRepository2, cache);
    }
    return _LinkService.instance;
  }
  //
  GenerateLinkForUpload = async (user, body) => {
    const planName = user.subscription?.planName || "free";
    const limits = planLimits[planName] ?? planLimits.free;
    const now = /* @__PURE__ */ new Date();
    const linkCount = user.linkCount;
    const linkCountexpireAt = user.linkCountExpireAt;
    let shouldResetLinkCountExpiration = false;
    if (linkCount === 0 || !linkCountexpireAt || now > new Date(linkCountexpireAt)) {
      shouldResetLinkCountExpiration = true;
    }
    if (linkCount >= limits.maxLinks) {
      const readableTime = linkCountexpireAt?.toLocaleString() || "tomorrow";
      throw new ApiError(
        `You have reached your daily limit of ${limits.maxLinks} links. Try again after ${readableTime}`,
        403
      );
    }
    const { expiresAt, maxUploads, expireAfterFirstUpload } = body;
    let finalMaxUploads;
    if (expireAfterFirstUpload) {
      finalMaxUploads = 1;
    } else if (planName === "free") {
      finalMaxUploads = limits.maxUploadsPerLink;
    } else {
      if (maxUploads > limits.maxUploadsPerLink) {
        throw new ApiError(`You can only upload ${limits.maxUploadsPerLink} files per link.`, 400);
      } else if (!maxUploads) {
        finalMaxUploads = limits.maxUploadsPerLink;
      } else {
        finalMaxUploads = maxUploads;
      }
    }
    const maxExpiration = limits.fileExpiration * ONE_DAY;
    let finalExpiration = getFinalLinkExpiration(expiresAt, maxExpiration, now);
    const token = uuidv76();
    const [link] = await this.linkRepository.createLink(
      {
        expireAfterFirstUpload,
        finalExpiration,
        finalMaxUploads,
        linkCountexpireAt,
        name: body.name ?? "",
        now,
        shouldResetLinkCountExpiration,
        token,
        userId: user.id
      }
    );
    if (!link) throw new ApiError("error while creating link", 500);
    return new ApiResponse(
      201,
      "link created successfully",
      {
        id: link.id,
        token
      }
    );
  };
  validateLink = async (token) => {
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
    if (isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      throw new ApiError("Link is not valid", 400);
    }
    return true;
  };
  deleteLink = async (link, userId) => {
    const files3 = link.files;
    if (files3.length > 0) {
      await this.deletedFileRepository.createMany(files3, link.id);
      await deleteQueue.add("delete-queue", {
        linkId: link.id,
        files: files3.map((file) => ({
          id: file.id,
          url: file.url
        }))
      });
    }
    await this.linkRepository.deleteLink(link.id, userId);
    this.cache.del(`link:${link.token}`);
    return new ApiResponse(
      200,
      "link deleted successfully",
      {}
    );
  };
  //
  getLinksCount = async (userId) => {
    const links3 = await this.linkRepository.FindUserLinksCount(userId);
    return new ApiResponse(
      200,
      "links count fetched successfully",
      { links: links3 }
    );
  };
};

// src/repository/drizzle-repo/link.drizzle.ts
var LinkRepositoryDrizzle = class _LinkRepositoryDrizzle {
  static instance;
  client;
  constructor(client) {
    this.client = client;
  }
  static getInstance(client) {
    if (!_LinkRepositoryDrizzle.instance) {
      _LinkRepositoryDrizzle.instance = new _LinkRepositoryDrizzle(client);
    }
    return _LinkRepositoryDrizzle.instance;
  }
  async FindLinkWithTokenIvAndKey(token) {
    const result = await this.client.select().from(links).where(eq3(links.token, token)).limit(1);
    return result[0] ?? null;
  }
  async FindUserLinksCount(userId) {
    const result = this.client.$count(links, eq3(links.userId, userId));
    return result ?? null;
  }
  async createLink({
    finalMaxUploads,
    token,
    expireAfterFirstUpload,
    finalExpiration,
    name,
    userId,
    shouldResetLinkCountExpiration,
    now,
    linkCountexpireAt
  }) {
    const [createdLink] = await this.client.insert(links).values({
      id: uuidv77(),
      maxUploads: finalMaxUploads,
      token,
      uploadCount: 0,
      expiresAt: finalExpiration,
      userId,
      name,
      expireAfterFirstUpload: expireAfterFirstUpload || false,
      createdAt: new Date(now.getTime()),
      updatedAt: new Date(now.getTime())
    }).returning();
    if (!createdLink) {
      console.log("failed to generate link");
      return [null, null];
    }
    const [updatedUser] = await this.client.update(users).set({
      linkCount: shouldResetLinkCountExpiration ? 1 : sql2`${users.linkCount}+1`,
      linkCountExpireAt: shouldResetLinkCountExpiration ? new Date(now.getTime() + ONE_DAY) : linkCountexpireAt
    }).where(eq3(users.id, userId)).returning();
    if (!updatedUser) {
      console.log("failed to update user ", userId);
      return [createdLink, null];
    }
    return [createdLink, updatedUser];
  }
  async deleteLink(linkId, userId) {
    const result = await this.client.delete(links).where(and2(eq3(links.id, linkId), eq3(links.userId, userId))).returning();
    return result[0] ?? null;
  }
  async delete_link_by_id(id) {
    const result = await this.client.delete(links).where(eq3(links.id, id)).returning();
    return result[0] ?? null;
  }
  async expired_link_count() {
    const result = await this.client.select({ count: count() }).from(links).where(lt(links.expiresAt, /* @__PURE__ */ new Date()));
    return result[0]?.count ?? 0;
  }
  async findFilesForLink(linkId, userId) {
    const result = await this.client.select().from(files).where(and2(eq3(files.uploadLinkId, linkId), eq3(files.userId, userId)));
    return result;
  }
  async findLinkByIdAndUser(linkId, userId) {
    const result = await this.client.query.links.findFirst({
      where: and2(
        eq3(links.id, linkId),
        eq3(links.userId, userId)
      ),
      columns: {
        id: true,
        token: true
      },
      with: {
        files: {
          columns: {
            url: true,
            id: true
          }
        }
      }
    });
    return result ?? null;
  }
  async findLinkByToken(token) {
    const result = await this.client.select().from(links).where(eq3(links.token, token)).limit(1);
    return result[0] ?? null;
  }
  async findLinkByTokenAndUserId(token, userId) {
    const result = await this.client.select().from(links).where(and2(eq3(links.token, token), eq3(links.userId, userId))).limit(1);
    return result[0] ?? null;
  }
  async findLinkUploadCount(linkId) {
    const result = await this.client.select({ uploadCount: links.uploadCount }).from(links).where(eq3(links.id, linkId)).limit(1);
    return result[0] ?? null;
  }
  async findLinkWithFilesByTokenAndUserId(linkId, token, userId, skip, limit) {
    const link = await this.client.query.links.findFirst({
      where: and2(
        eq3(links.id, linkId),
        eq3(links.userId, userId),
        eq3(links.token, token)
      ),
      columns: { id: true, token: true }
    });
    if (!link) {
      console.log("could not find link ");
      return null;
    }
    const fileList = await this.client.query.files.findMany({
      where: and2(
        eq3(files.uploadLinkId, linkId)
      ),
      columns: {
        id: true,
        name: true,
        url: true,
        size: true,
        createdAt: true
      },
      offset: skip,
      limit,
      orderBy: sql2`${files.createdAt} DESC`
    });
    return { ...link, files: fileList };
  }
  async findUserLinks(userId, query, skip, limit) {
    const result = await this.client.select({
      id: links.id,
      name: links.name,
      token: links.token,
      createdAt: links.createdAt,
      maxUploads: links.maxUploads,
      expiresAt: links.expiresAt,
      uploadCount: links.uploadCount
    }).from(links).where(and2(
      eq3(links.userId, userId),
      or(
        ilike(links.name, `%${query}%`),
        ilike(links.token, `%${query}%`)
      )
    )).offset(skip).limit(limit).orderBy(sql2`${links.createdAt} DESC`);
    return result;
  }
  async find_expired_links(limit, offset) {
    const result = await this.client.query.links.findMany({
      where: lt(links.expiresAt, /* @__PURE__ */ new Date()),
      with: {
        files: true
      },
      limit,
      offset
    });
    return result;
  }
};

// src/repository/drizzle-repo/subscription.drizzle.ts
import { eq as eq4 } from "drizzle-orm";
import { uuidv7 as uuidv78 } from "uuidv7";
var SubscriptionRepositoryDrizzle = class _SubscriptionRepositoryDrizzle {
  static instance;
  client;
  constructor(client) {
    this.client = client;
  }
  static getInstance(client) {
    if (!_SubscriptionRepositoryDrizzle.instance) {
      _SubscriptionRepositoryDrizzle.instance = new _SubscriptionRepositoryDrizzle(client);
    }
    return _SubscriptionRepositoryDrizzle.instance;
  }
  update_subscription_logs = async (data) => {
    const payload = typeof data.rawPayload === "string" ? data.rawPayload : JSON.stringify(data.rawPayload);
    const result = await this.client.insert(subscriptionLogs).values({
      id: uuidv78(),
      ...data,
      message: data.message ?? "",
      rawPayload: payload,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).onConflictDoUpdate({
      target: subscriptionLogs.paymentId,
      set: {
        ...data,
        message: data.message ?? "",
        rawPayload: payload,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return result[0] ?? null;
  };
  update_plan = async (userId, planName = "pro") => {
    const result = await this.client.update(subscriptions).set({ planName }).where(eq4(subscriptions.userId, userId)).returning();
    return result[0] ?? null;
  };
  check_plan = async (userId) => {
    const result = await this.client.select({ planName: subscriptions.planName }).from(subscriptions).where(eq4(subscriptions.userId, userId)).limit(1);
    return result[0] ?? null;
  };
};

// src/repository/drizzle-repo/user.drizzle.ts
import { eq as eq5 } from "drizzle-orm";

// src/utils/hash.password.ts
var getHashedPassword = async (rawPassowrd) => {
  return await Bun.password.hash(rawPassowrd, { algorithm: "bcrypt", cost: 10 });
};

// src/repository/drizzle-repo/user.drizzle.ts
import { uuidv7 as uuidv79 } from "uuidv7";
var UserRepositoryDrizzle = class _UserRepositoryDrizzle {
  static instance;
  client;
  constructor(client) {
    this.client = client;
  }
  static getInstance(client) {
    if (!_UserRepositoryDrizzle.instance) {
      _UserRepositoryDrizzle.instance = new _UserRepositoryDrizzle(client);
    }
    return _UserRepositoryDrizzle.instance;
  }
  // --- OAuth createUser (disabled) ---
  // async createUser(name: string, email: string, avatar: string): Promise<User | null> {
  //     const now = new Date();
  //     try {
  //         const [newUser] = await this.client
  //             .insert(users)
  //             .values({ name, email, avatar, createdAt: now, updatedAt: now })
  //             .returning();
  //         if (!newUser) { console.error("Failed to insert new User."); return null }
  //         const [newSubscription] = await this.client
  //             .insert(subscriptions)
  //             .values({ userId: newUser.id, planName: 'free', createdAt: now, updatedAt: now })
  //             .returning()
  //         if (!newSubscription) { console.error("Failed to insert new subscription."); return null }
  //         return newUser
  //     } catch (error) {
  //         console.error("Database error during createUser:", error);
  //         return null;
  //     }
  // }
  // --- end OAuth createUser ---
  async createUser(username, password) {
    const now = /* @__PURE__ */ new Date();
    const hashedPassword = await getHashedPassword(password);
    try {
      const [newUser] = await this.client.insert(users).values({
        id: uuidv79(),
        username,
        name: username,
        passoword: hashedPassword,
        avatar: "",
        createdAt: now,
        updatedAt: now
      }).returning();
      if (!newUser) {
        console.error("Failed to insert new User.");
        return null;
      }
      const [newSubscription] = await this.client.insert(subscriptions).values({
        id: uuidv79(),
        userId: newUser.id,
        planName: "free",
        createdAt: now,
        updatedAt: now
      }).returning();
      if (!newSubscription) {
        console.error("Failed to insert new subscription.");
        return null;
      }
      return newUser;
    } catch (error) {
      console.error("Database error during createUser:", error);
      return null;
    }
  }
  async findUserAndPlanName(userId) {
    const data = await this.client.select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      avatar: users.avatar,
      linkCount: users.linkCount,
      linkCountExpireAt: users.linkCountExpireAt,
      subscription: {
        planName: subscriptions.planName
      }
    }).from(users).leftJoin(subscriptions, eq5(subscriptions.userId, users.id)).where(eq5(users.id, userId)).limit(1);
    return data[0] ?? null;
  }
  // findUserByEmail disabled — email auth removed
  // findUserByEmail = async (email: string): Promise<User | null> => {
  //     const data = await this.client.select().from(users).where(eq(users.email, email)).limit(1)
  //     return data[0] ?? null;
  // }
  async findUserId(id) {
    const data = await this.client.select({ id: users.id }).from(users).where(eq5(users.id, id)).limit(1);
    return data[0] ?? null;
  }
  // findUserByEmailOrUserName disabled — username-only auth
  // async findUserByEmailOrUserName(emailOrUserName: string): Promise<User | null> {
  //     const user = await this.client.select().from(users)
  //         .where(or(eq(users.email, emailOrUserName), eq(users.username, emailOrUserName)))
  //         .limit(1)
  //     return user[0] ?? null;
  // }
  async findUserByUsername(username) {
    const user = await this.client.select().from(users).where(eq5(users.username, username)).limit(1);
    return user[0] ?? null;
  }
};

// src/container/repositories.ts
function createRepository(repositoryName, dbType) {
  const clientType = CONFIG.DB_CLIENT || dbType;
  const client = createDBClient(clientType);
  switch (repositoryName) {
    case "link":
      if (clientType === "drizzle") return LinkRepositoryDrizzle.getInstance(client);
    // return LinkRepository.getInstance(client as PrismaClient);
    case "deleted_file":
      if (clientType === "drizzle") return DeletedFileRepositoryDrizzle.getInstance(client);
    // return DeletedFileRepository.getInstance(client as PrismaClient);
    case "user":
      if (clientType === "drizzle") return UserRepositoryDrizzle.getInstance(client);
    // return UserRepository.getInstance(client as PrismaClient);
    case "file":
      if (clientType === "drizzle") return FileRepositoryDrizzle.getInstance(client);
    // return FileRepository.getInstance(client as PrismaClient);
    case "subscription":
      if (clientType === "drizzle") return SubscriptionRepositoryDrizzle.getInstance(client);
    // return SubscriptionRepository.getInstance(client as PrismaClient) as ISubscriptionRepo;
    default:
      throw new Error(`Repository ${repositoryName} not found`);
  }
}
var linkRepository = createRepository("link");
var userRepository = createRepository("user");
var subscriptionRepository = createRepository("subscription");
var fileRepository = createRepository("file");
var deletedFileRepository = createRepository("deleted_file");

// src/utils/generate.token.ts
import * as jwt from "jsonwebtoken";
var generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error while generating refresh and access token", error);
    throw {
      status: 500,
      message: "Something went wrong while generating refresh and access token"
    };
  }
};
var generateAccessToken = (user) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
  if (!ACCESS_TOKEN_SECRET || !ACCESS_TOKEN_EXPIRY) {
    throw new Error("Access token environment variables are not defined.");
  }
  return jwt.sign({ id: user?.id, username: user?.username }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY
  });
};
var generateRefreshToken = (user) => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;
  if (!REFRESH_TOKEN_SECRET || !REFRESH_TOKEN_EXPIRY) {
    throw new Error("Refresh token environment variables are not defined.");
  }
  return jwt.sign(
    {
      id: user?.id,
      username: user?.username
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY
    }
  );
};

// src/dto/user.dto.ts
var UserDTO = class {
  id;
  username;
  email;
  avatar;
  name;
  createdAt;
  updatedAt;
  plan;
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email ?? null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.name = user.name ?? null;
    this.avatar = user.avatar ?? null;
    this.plan = user.subscription?.planName || "free";
  }
};

// src/service/auth.service.ts
var AuthService = class _AuthService {
  constructor(_notificationService, userRepository2) {
    this.userRepository = userRepository2;
  }
  userRepository;
  static instance;
  static getInstance(notificationService2, userRepository2) {
    if (!_AuthService.instance) {
      _AuthService.instance = new _AuthService(notificationService2, userRepository2);
    }
    return _AuthService.instance;
  }
  // signInWithGoogle = async (token: string): Promise<ApiResponse> => {
  //   const ticket = await oAuthClient.verifyIdToken({
  //     idToken: token,
  //     audience: process.env.GOOGLE_CLIENT_ID,
  //   });
  //   if (!ticket) throw new ApiError("Invalid id_token", 401);
  //   const payload = ticket.getPayload();
  //   if (!payload || !payload?.email) throw new ApiError("Invalid id_token", 401);
  //   const { email, name, picture } = payload;
  //   let user = await this.userRepository.findUserByEmail(email)
  //   if (!user) {
  //     user = await this.userRepository.createUser(name, email, picture) as any
  //     if (!user) throw new ApiError("Something went wrong while creating user", 500)
  //     this.notificationService.sendWelcomeEmail(email);
  //   }
  //   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
  //   const userDTO = new UserDTO(user);
  //   return new ApiResponse(201, "Login successful", { user: userDTO, accessToken, refreshToken })
  // }
  signup = async (username, password) => {
    const existingUser = await this.userRepository.findUserByUsername(username);
    if (existingUser) throw new ApiError("Username already taken", 409);
    const user = await this.userRepository.createUser(username, password);
    if (!user) throw new ApiError("Something went wrong while creating user", 500);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const userDTO = new UserDTO(user);
    return new ApiResponse(201, "Account created successfully", { user: userDTO, accessToken, refreshToken });
  };
  login = async (username, password) => {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) throw new ApiError("Invalid credentials", 401);
    if (!user.passoword) throw new ApiError("Invalid credentials", 401);
    const isPasswordValid = await Bun.password.verify(password, user.passoword);
    if (!isPasswordValid) throw new ApiError("Invalid credentials", 401);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const userDTO = new UserDTO(user);
    return new ApiResponse(200, "Login successful", { user: userDTO, accessToken, refreshToken });
  };
  refresh_token = async (user) => {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    return new ApiResponse(200, "new access_token generated successfully", { accessToken, refreshToken });
  };
};

// src/queue/bullmq/queue/cleanup-queue.ts
import { Queue as Queue2 } from "bullmq";
var cleanupQueue = new Queue2("cleanup", { connection: redis });

// src/service/cleanup.service.ts
import { Worker } from "bullmq";

// src/queue/bullmq/workers/delete-files.worker.ts
import { and as and3, eq as eq6 } from "drizzle-orm";
async function deleteFiles(files3, linkId) {
  const db = createDBClient("drizzle");
  const updatePromises = [];
  for (const file of files3) {
    try {
      await storageService.deleteFiles([{ id: file.id, url: file.url }]);
      redis.del(`signed-url:${file.id}`);
      updatePromises.push(
        db.update(deletedFiles).set({
          status: "DELETED",
          deletedAt: /* @__PURE__ */ new Date()
        }).where(
          eq6(deletedFiles.fileId, file.id)
        )
      );
    } catch (err) {
      console.log(`File not found in S3: ${file.url}, marking as deleted`);
      if (err.code === "NoSuchKey" || err.statusCode === 404 || err.statusCode === 204) {
        updatePromises.push(
          db.update(deletedFiles).set({
            status: "DELETED",
            deletedAt: /* @__PURE__ */ new Date()
          }).where(
            and3(
              eq6(deletedFiles.fileId, file.id),
              eq6(deletedFiles.linkId, linkId)
            )
          )
          // db.deletedFile.updateMany({
          //     where: {
          //         fileId: file.id,
          //         linkId: linkId,
          //     },
          //     data: {
          //         status: "DELETED",
          //         deletedAt: new Date(),
          //     },
          // })
        );
      } else {
        updatePromises.push(
          db.update(deletedFiles).set({
            status: "FAILED",
            deletedAt: /* @__PURE__ */ new Date()
          }).where(
            and3(
              eq6(deletedFiles.fileId, file.id),
              eq6(deletedFiles.linkId, linkId)
            )
          )
          // db.deletedFile.updateMany({
          //     where: {
          //         fileId: file.id,
          //         linkId: linkId,
          //     },
          //     data: {
          //         status: "FAILED",
          //     },
          // })
        );
      }
    }
  }
  await Promise.all(updatePromises);
}

// src/service/cleanup.service.ts
var CleanupService = class _CleanupService {
  constructor(linkRepository2, deletedFileRepo, cache) {
    this.linkRepository = linkRepository2;
    this.deletedFileRepo = deletedFileRepo;
    this.cache = cache;
  }
  linkRepository;
  deletedFileRepo;
  cache;
  static instance;
  static getInstance(linkRepository2, deletedFileRepo, cache) {
    if (!_CleanupService.instance) {
      _CleanupService.instance = new _CleanupService(linkRepository2, deletedFileRepo, cache);
    }
    return _CleanupService.instance;
  }
  /**
   * Executes a task exclusively across distributed server nodes using a Redis lock.
   */
  async runExclusive(lockName, fn, intervalMs = 6e4) {
    const lockKey = `lock:${lockName}`;
    const lockTtlMs = Math.min(Math.floor(intervalMs * 0.9), 10 * 60 * 1e3);
    const acquired = await this.cache.setWithOptions(lockKey, "locked", { PX: lockTtlMs, NX: true });
    if (!acquired) {
      console.warn(`[Cleanup] Skipped: '${lockName}' is already in progress by another instance.`);
      return;
    }
    try {
      await fn();
    } catch (error) {
      console.error(`[Cleanup] Error in guarded execution for '${lockName}':`, error);
    } finally {
      await this.cache.del(lockKey);
    }
  }
  parseInterval = (value) => {
    const match = value.match(/^(\d+)(s|m|h)$/);
    if (!match) throw new Error("Invalid interval format. Use '10s', '5m', or '1h'.");
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10);
    switch (unit) {
      case "s":
        return amount * 1e3;
      case "m":
        return amount * 60 * 1e3;
      case "h":
        return amount * 60 * 60 * 1e3;
      default:
        throw new Error("Unsupported time unit.");
    }
  };
  /**
   * Generic runner to schedule any task function on a specified interval with distributed locking.
   */
  runTaskInterval = (taskName, taskFn, interval = "10m") => {
    const intervalMs = this.parseInterval(interval);
    return setInterval(async () => {
      await this.runExclusive(taskName, taskFn, intervalMs);
    }, intervalMs);
  };
  /**
   * Schedules periodic expired links cleanup.
   */
  runLinkCleanupInterval = (interval = "10m") => {
    return this.runTaskInterval("cleanup-expired-links", this.cleanupExpiredLinks, interval);
  };
  /**
   * Schedules periodic recovery for pending/failed deleted files.
   */
  runFileRecoveryInterval = (interval = "10m") => {
    return this.runTaskInterval("requeue-pending-failed-files", this.requeuePendingAndFailedFiles, interval);
  };
  // Backward compatibility alias for runLinkCleanupInterval
  runInterval = async (interval = "10m") => {
    this.runLinkCleanupInterval(interval);
  };
  addQueue = async (minute = 10) => {
    await cleanupQueue.add(
      "cleanup-expired-links",
      {},
      {
        repeat: { every: minute * 60 * 1e3 },
        removeOnComplete: true
      }
    );
  };
  runWorker = async () => {
    new Worker("cleanup", async () => {
      await this.runExclusive("cleanup-expired-links", this.cleanupExpiredLinks);
    }, { connection: redis });
  };
  run_delete_file_worker = () => {
    console.log("\nStarting delete file worker\n");
    new Worker(
      "delete-queue",
      async (job) => {
        try {
          const { data } = job;
          const { linkId, files: files3 } = data;
          await deleteFiles(files3, linkId);
        } catch (error) {
          console.log("File deletion failed", error);
        }
      },
      {
        connection: redis,
        maxStalledCount: 2,
        limiter: { max: 5, duration: 1e3 },
        concurrency: 3
      }
    );
  };
  LinkCleanup() {
    return {
      runWoker: this.runWorker,
      runInterval: this.runInterval,
      addQueue: this.addQueue
    };
  }
  /**
   * Sweeps deleted_files DB table for PENDING or FAILED records and requeues them to BullMQ.
   */
  requeuePendingAndFailedFiles = async () => {
    await this.requeueFilesByStatus("PENDING");
    await this.requeueFilesByStatus("FAILED");
  };
  requeueFilesByStatus = async (status) => {
    try {
      let total = await this.deletedFileRepo.findExpiredLinkCount(status);
      if (total === 0) return;
      console.log(`[Recovery] Found ${total} ${status} deleted files.`);
      let offset = 0;
      const BATCH_SIZE = 100;
      while (total > 0) {
        const limit = Math.min(BATCH_SIZE, total);
        const files3 = await this.deletedFileRepo.findExpiredFiles(status, limit, offset);
        if (files3.length === 0) break;
        const grouped = /* @__PURE__ */ new Map();
        for (const file of files3) {
          const group = grouped.get(file.linkId) || [];
          group.push({ id: file.fileId, url: file.fileUrl });
          grouped.set(file.linkId, group);
        }
        for (const [linkId, groupedFiles] of grouped) {
          await deleteQueue.add("delete-queue", { linkId, files: groupedFiles });
        }
        total = total - limit;
        offset = offset + limit;
        console.log(`[Recovery] Requeued ${files3.length} ${status} deleted files.`);
      }
    } catch (error) {
      console.error(`[Recovery] Error requeuing ${status} files:`, error);
    }
  };
  /**
   * Sweeps database for expired links, records files into deleted_files, enqueues to deleteQueue, and deletes link.
   */
  cleanupExpiredLinks = async () => {
    try {
      let totalLinks = await this.linkRepository.expired_link_count();
      let offset = 0;
      const BATCH_SIZE = 50;
      while (totalLinks > 0) {
        const limit = Math.min(BATCH_SIZE, totalLinks);
        const expiredLinks = await this.linkRepository.find_expired_links(limit, offset);
        if (expiredLinks.length === 0) {
          break;
        }
        await Promise.all(expiredLinks.map(async (link) => {
          const files3 = link.files;
          const fileUrls = files3.map((file) => file.url);
          if (fileUrls.length > 0) {
            await this.deletedFileRepo.createMany(files3, link.id);
            await deleteQueue.add("delete-queue", {
              linkId: link.id,
              files: files3.map((file) => ({
                id: file.id,
                url: file.url
              }))
            });
          }
          await this.linkRepository.delete_link_by_id(link.id);
        }));
        totalLinks = totalLinks - limit;
        offset = offset + limit;
        console.log(`Remaining expired links: ${totalLinks}`);
      }
    } catch (error) {
      console.error("Error while cleaning up expired links:", error);
    }
  };
};

// src/service/file.service.ts
var FileService = class _FileService {
  constructor(fileRepository2, storageService2, link_repository, deletedFileRepository2) {
    this.fileRepository = fileRepository2;
    this.storageService = storageService2;
    this.link_repository = link_repository;
    this.deletedFileRepository = deletedFileRepository2;
  }
  fileRepository;
  storageService;
  link_repository;
  deletedFileRepository;
  static instance;
  static getInstance(fileRepository2, storageService2, link_repository, deletedFileRepository2) {
    if (!_FileService.instance) {
      _FileService.instance = new _FileService(fileRepository2, storageService2, link_repository, deletedFileRepository2);
    }
    return _FileService.instance;
  }
  notifyUpload = async ({ link, s3Key, fileSize, name }) => {
    const user = await this.fileRepository.getUser(link.userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
    const [fileRes, linkRes] = await this.fileRepository.createFileAndUpdateLink({
      linkId: link.id,
      userId: user.id,
      url,
      name: name ?? "",
      size: BigInt(fileSize)
    });
    if (!fileRes || !linkRes) {
      throw new ApiError("Partial failure updating DB.", 500);
    }
    return new ApiResponse(201, "File metadata stored and link updated.", {});
  };
  uploadPreSignedUrl = async (mimeType) => {
    const { url, key } = await this.storageService.generatePresignedUploadUrl(mimeType);
    return new ApiResponse(200, "URL generated successfully", { url, key });
  };
  getDownloadPreSignedUrl = async (userId, token, fileId, s3key) => {
    const link = await this.fileRepository.findLinkByTokenAndUserId(token, userId);
    if (!link) {
      throw new ApiError("Invalid link or unauthorized", 404);
    }
    const file = await this.fileRepository.findFileByIdUserIdAndLinkId(fileId, userId, link.id);
    if (!file) {
      throw new ApiError("File not found or unauthorized", 404);
    }
    const cacheKey = `signed-url:${fileId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const cachedStr = cached.toString();
      const { url: url2 } = JSON.parse(cachedStr);
      return new ApiResponse(200, "URL generated successfully", { url: url2 });
    }
    const url = await this.storageService.generateSignedDownloadUrl(s3key);
    await redis.set(cacheKey, JSON.stringify({ url }), "EX", 3600);
    return new ApiResponse(200, "URL generated successfully", { url });
  };
  storageUsed = async (userId) => {
    const storageUsed = await this.fileRepository.storageUsed(userId);
    if (!storageUsed) throw new ApiError("Failed to get storage used", 500);
    return new ApiResponse(200, "Storage used fetched successfully", { storageUsed: Number(storageUsed.totalSize) });
  };
  getFilesByLinkAndToken = async (token, userId, page, limit, skip) => {
    const link = await this.fileRepository.findLinkByTokenAndUserId(token, userId);
    if (!link) {
      throw new ApiError("Link not found or Unauthorized", 404);
    }
    const files3 = await this.fileRepository.getFiles(link.id, userId, skip, limit);
    if (!files3) {
      throw new ApiError("No files found or Unauthorized", 404);
    }
    const safeFiles = files3.map((file) => ({
      ...file,
      size: Number(file.size)
    }));
    return new ApiResponse(
      200,
      "Files fetched successfully",
      {
        files: safeFiles,
        pagination: {
          page,
          limit
        }
      }
    );
  };
  delete_a_file_from_a_link = async (link_id, file_id, user_id) => {
    const link = await this.link_repository.findLinkByIdAndUser(link_id, user_id);
    if (!link) {
      throw new ApiError("Link is expired or doesn't exist.", 404);
    }
    const file = await this.fileRepository.get_file_by_id_and_userid(file_id, user_id);
    if (!file) {
      throw new ApiError("File doesn't exist or Unauthorized", 404);
    }
    if (file.uploadLinkId !== link.id) {
      throw new ApiError("Unauthorized", 403);
    }
    await this.deletedFileRepository.createMany([{ id: file.id, url: file.url }], link.id);
    const deleted = await this.fileRepository.delete_file_from_link(file.id, link.id, user_id);
    if (!deleted) {
      throw new ApiError("Failed to delete file.", 500);
    }
    await deleteQueue.add("delete-queue", {
      linkId: link.id,
      files: [{ id: file.id, url: file.url }]
    });
    redis.del(`signed-url:${file.id}`).catch((err) => {
      console.error(`Failed to delete redis cache for file ${file.id}:`, err);
    });
    return new ApiResponse(200, "File deleted successfully", {});
  };
};

// src/service/notification.service.ts
var NotificationService = class _NotificationService {
  constructor(mailer2) {
    this.mailer = mailer2;
  }
  mailer;
  static instance;
  static getInstance(mailer2) {
    if (!_NotificationService.instance) {
      _NotificationService.instance = new _NotificationService(mailer2);
    }
    return _NotificationService.instance;
  }
  async sendWelcomeEmail(email) {
    const subject = `\u{1F44B} Welcome`;
    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <p style="font-size: 16px; line-height: 1.5;">
              Welcome to <strong>OpenFile.in</strong> \u2014 your anonymous file sharing platform!
            </p>
            <p style="font-size: 14px;">Cheers,<br><strong>The OpenFile Team</strong></p>
          </div>
        </div>
      `;
    const isSuccessfull = await this.mailer.sendMail({ to: email, subject, html });
    if (!isSuccessfull) false;
  }
  // send email to user who bough our paid pro subscription
  async sendSubscriptionSuccessEmail(email, amount, currency) {
    const subject = `Subscription Activated - Welcome to Pro Plan`;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #4CAF50;">Your subscription is now active! \u{1F680}</h2>
        <p style="font-size: 16px;">Hi there,</p>
        <p style="font-size: 16px; line-height: 1.5;">
          Thank you for subscribing to the <strong>Pro Plan</strong> on <strong>OpenFile.in</strong>.
        </p>
        <p style="font-size: 14px;">We have successfully received your payment of <strong>${amount} ${currency}</strong>.</p>
        <p style="font-size: 14px;">Enjoy faster uploads, larger storage, and premium features.</p>
        <br>
        <p style="font-size: 14px;">Cheers,<br><strong>The OpenFile Team</strong></p>
      </div>
    </div>
  `;
    const isSuccessfull = await this.mailer.sendMail({ to: email, subject, html });
    if (!isSuccessfull) return false;
    return true;
  }
};

// src/container/services.ts
var notificationService = NotificationService.getInstance(mailer);
var linkService = LinkService.getInstance(
  linkRepository,
  deletedFileRepository,
  cacheService
);
var fileService = FileService.getInstance(fileRepository, storageService, linkRepository, deletedFileRepository);
var authService = AuthService.getInstance(notificationService, userRepository);
var cleanupService = CleanupService.getInstance(
  linkRepository,
  deletedFileRepository,
  cacheService
);

// src/utils/cookie.ts
var accessTokenOptions = {
  httpOnly: true,
  path: "/",
  secure: true,
  sameSite: "None",
  maxAge: 5 * 24 * 60 * 60
};
var refreshTokenOptions = {
  ...accessTokenOptions,
  maxAge: 15 * 24 * 60 * 60
};
var set_cookie = (params) => {
  params.c.setCookie("accessToken", params.accessToken, accessTokenOptions);
  params.c.setCookie("refreshToken", params.refreshToken, refreshTokenOptions);
};

// src/utils/handle-error.ts
function handleErrorResponse(c, error) {
  if (error instanceof ApiError) {
    return c.json({ error: error.message }, error.statusCode);
  }
  console.error(error);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
}

// src/zod/schema.ts
import { z } from "zod";
var registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username is too long"),
  password: z.string().min(4, "Password must be at least 4 characters").max(100, "Password is too long")
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
var createLinkSchema = z.object({
  maxUploads: z.number().min(1),
  allowedFileType: z.array(z.string()).optional(),
  expiresAt: z.string().datetime(),
  name: z.string().optional(),
  expireAfterFirstUpload: z.boolean().optional().default(false)
});
var secretKeySchema = z.object({
  secretKey: z.string().min(4, "Secret key is required")
});
var fileSchema = z.custom((file) => file instanceof File).refine((file) => {
  const mime2 = file.type;
  return mime2.startsWith("image/") || mime2.startsWith("video/");
}, {
  message: "Only image and video files are allowed."
});
var uploadRequestSchema = z.object({
  mimeType: z.string().optional().default("application/octet-stream"),
  fileSize: z.number({
    required_error: "File size is required.",
    invalid_type_error: "File size must be a number."
  }).positive("File size must be greater than zero.")
});
var notifyUploadSchema = z.object({
  s3Key: z.string().min(1, "s3Key required"),
  fileSize: z.number({
    required_error: "File size is required.",
    invalid_type_error: "File size must be a number."
  }).positive("File size must be greater than zero."),
  name: z.string().optional()
});

// src/api/controller/auth.controller.ts
import { HTTPException } from "diesel-core/http-exception";

// src/utils/mustGet.ts
function mustGet(c, key, status = 401) {
  const value = c.get(key);
  if (value === void 0) {
    throw new ApiError(`Missing "${key}" in request context`, status);
  }
  return value;
}

// src/api/controller/auth.controller.ts
var DieselAuthController = class _DieselAuthController {
  static instance;
  authService;
  constructor(authService2) {
    this.authService = authService2;
  }
  static getInstance(authService2) {
    if (!_DieselAuthController.instance) {
      _DieselAuthController.instance = new _DieselAuthController(authService2);
    }
    return _DieselAuthController.instance;
  }
  // OAuth (Google) sign-in disabled
  // handleGoogleSignIn = async (c: ContextType) => {
  //     try {
  //         const body = await c.body
  //         const result = authSchema.safeParse(body)
  //         if (!result.success) {
  //             const message = result.error.errors[0].message
  //             throw new HTTPException(400, { res: c.json({ error: message }, 400) })
  //         }
  //         const { token } = result.data
  //         const apiRespone: ApiResponse = await this.authService.signInWithGoogle(token);
  //         c.setCookie("accessToken", apiRespone.data.accessToken, accessTokenOptions as any);
  //         c.setCookie("refreshToken", apiRespone.data.refreshToken, refreshTokenOptions as any);
  //         return c.json(apiRespone.data, apiRespone.statusCode);
  //     } catch (error) {
  //         console.error("Auth error:", error.message);
  //         throw new HTTPException(500, { res: handleErrorResponse(c, error) })
  //         return handleErrorResponse(c, error)
  //     }
  // };
  // --- end OAuth ---
  signup = async (c) => {
    return c.json({ error: "SignUp is Disabled." }, 400);
    try {
      const body = await c.body;
      const result = registerSchema.safeParse(body);
      if (!result.success) {
        const message = result.error.errors[0].message;
        throw new HTTPException(400, { res: c.json({ error: message }, 400) });
      }
      const { username, password } = result.data;
      const apiResponse = await this.authService.signup(username, password);
      const refreshToken = apiResponse.data.refreshToken;
      const accessToken = apiResponse.data.accessToken;
      set_cookie({ c, accessToken, refreshToken });
      return c.json(apiResponse.data, apiResponse.statusCode);
    } catch (error) {
      console.error("Signup error:", error.message);
      throw new HTTPException(500, { res: handleErrorResponse(c, error) });
      return handleErrorResponse(c, error);
    }
  };
  login = async (c) => {
    try {
      const body = await c.body;
      const result = loginSchema.safeParse(body);
      if (!result.success) {
        const message = result.error.errors[0].message;
        throw new HTTPException(400, { res: c.json({ error: message }, 400) });
      }
      const { username, password } = result.data;
      const apiResponse = await this.authService.login(username, password);
      const refreshToken = apiResponse.data.refreshToken;
      const accessToken = apiResponse.data.accessToken;
      set_cookie({ c, accessToken, refreshToken });
      return c.json(apiResponse.data, apiResponse.statusCode);
    } catch (error) {
      console.error("Login error:", error.message);
      throw new HTTPException(500, { res: handleErrorResponse(c, error) });
      return handleErrorResponse(c, error);
    }
  };
  logout = async (c) => {
    try {
      c.setCookie("accessToken", "", accessTokenOptions);
      c.setCookie("refreshToken", "", refreshTokenOptions);
      return c.json({ message: "User logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error.message);
      throw new HTTPException(500, { res: handleErrorResponse(c, error) });
      return handleErrorResponse(c, error);
    }
  };
  checkAuth = async (c) => {
    try {
      const user = mustGet(c, "user");
      return c.json({ user });
    } catch (error) {
      console.error("check auth error:", error.message);
      throw new HTTPException(500, { res: handleErrorResponse(c, error) });
      return handleErrorResponse(c, error);
    }
  };
  refresh_token = async (c) => {
    try {
      const user = mustGet(c, "user");
      const apiResponse = await this.authService.refresh_token(user);
      const refreshToken = apiResponse.data.refreshToken;
      const accessToken = apiResponse.data.accessToken;
      set_cookie({ c, accessToken, refreshToken });
      return c.json(apiResponse.data, apiResponse.statusCode);
    } catch (e) {
      return handleErrorResponse(c, e);
    }
  };
};

// src/api/controller/file.controller.ts
import { HTTPException as HTTPException2 } from "diesel-core/http-exception";
var DieselFileController = class _DieselFileController {
  static instance;
  fileService;
  constructor(fileService2) {
    this.fileService = fileService2;
  }
  static getInstance(fileService2) {
    if (!_DieselFileController.instance) {
      _DieselFileController.instance = new _DieselFileController(fileService2);
    }
    return _DieselFileController.instance;
  }
  getFilesByLinkToken = async (c) => {
    try {
      const files3 = mustGet(c, "files");
      const { page, limit } = mustGet(c, "pagination");
      const safeFiles = files3.map((file) => ({
        ...file,
        size: Number(file.size)
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
      return handleErrorResponse(c, error);
    }
  };
  notifyFileUpload = async (c) => {
    try {
      const link = mustGet(c, "link");
      const body = await c.req.json();
      const parsed = notifyUploadSchema.safeParse(body);
      if (!parsed.success) {
        return c.json({ error: parsed.error.format() }, 400);
      }
      const { s3Key, fileSize, name } = parsed.data;
      if (!s3Key || !fileSize) {
        return c.json({ error: "Missing required fields" }, 400);
      }
      const apiResponse = await this.fileService.notifyUpload({ link, s3Key, fileSize, name });
      return c.json({ message: apiResponse.message }, apiResponse.statusCode);
    } catch (error) {
      console.error("notifyFileUpload error:", error);
      return handleErrorResponse(c, error);
    }
  };
  getUploadPresignedUrl = async (c) => {
    try {
      const safeMimeType = mustGet(c, "mimeType");
      const res = await this.fileService.uploadPreSignedUrl(safeMimeType);
      return c.json(res.data, res.statusCode);
    } catch (error) {
      throw new HTTPException2(500, {
        message: "Internal Server Error in getUploadPresignedUrl"
      });
    }
  };
  getDownloadPresignedUrl = async (c) => {
    const token = c.query?.token;
    const fileId = c.query?.fileId;
    const s3key = c.query?.s3key;
    if (!token || !s3key || !fileId) {
      return c.json({ error: "Missing or invalid parameters" }, 400);
    }
    try {
      const user = mustGet(c, "user");
      const apiRespone = await this.fileService.getDownloadPreSignedUrl(user.id, token, fileId, s3key);
      return c.json(apiRespone, apiRespone.statusCode);
    } catch (error) {
      console.error("Signed URL error:", error);
      return handleErrorResponse(c, error);
    }
  };
  deleteFileFromLink = async (c) => {
    try {
      const user = mustGet(c, "user");
      const link_id = c.params.id;
      const file_id = c.params.file_id;
      if (!link_id || !file_id) {
        return c.json({ error: "Missing or invalid parameters" }, 400);
      }
      const apiResponse = await this.fileService.delete_a_file_from_a_link(link_id, file_id, user.id);
      return c.json({ message: apiResponse.message }, apiResponse.statusCode);
    } catch (error) {
      console.error("deleteFileFromLink error:", error);
      return handleErrorResponse(c, error);
    }
  };
  storeageUsed = async (c) => {
    try {
      const user = mustGet(c, "user");
      const apiRespone = await this.fileService.storageUsed(user.id);
      return c.json(apiRespone, apiRespone.statusCode);
    } catch (error) {
      console.error("storage used error:", error);
      return handleErrorResponse(c, error);
    }
  };
};

// src/api/controller/link.controller.ts
var DieselLinkController = class _DieselLinkController {
  static instance;
  linkService;
  constructor(linkService2) {
    this.linkService = linkService2;
  }
  static getInstance(linkService2) {
    if (!_DieselLinkController.instance) {
      _DieselLinkController.instance = new _DieselLinkController(linkService2);
    }
    return _DieselLinkController.instance;
  }
  generateLink = async (c) => {
    try {
      const user = mustGet(c, "user");
      const body = await c.body;
      const result = createLinkSchema.safeParse(body);
      if (!result.success) {
        const message = result.error.errors[0].message;
        return c.json({ error: message }, 400);
      }
      const apiResponse = await this.linkService.GenerateLinkForUpload(user, result.data);
      return c.json(apiResponse.data, apiResponse.statusCode);
    } catch (error) {
      console.error("Error generating link:", error);
      return handleErrorResponse(c, error);
    }
  };
  getUserLinks = async (c) => {
    try {
      const links3 = mustGet(c, "userLinks");
      const pagination = mustGet(c, "pagination");
      return c.json({
        message: "Links fetched successfully",
        success: true,
        data: links3,
        page: pagination.page,
        limit: pagination.limit
      }, 200);
    } catch (error) {
      console.error("Error fetching user links:", error);
      return handleErrorResponse(c, error);
    }
  };
  validateLink = async (c) => {
    try {
      const token = c.query.token;
      if (!token) return c.json({ error: "pls provide token" }, 404);
      await this.linkService.validateLink(token);
      return c.json({ message: "Link is valid" }, 200);
    } catch (error) {
      console.error("Error validating link:", error);
      return handleErrorResponse(c, error);
    }
  };
  deleteLink = async (c) => {
    try {
      const link = mustGet(c, "link");
      const userId = mustGet(c, "userId");
      const apiResponse = await this.linkService.deleteLink(link, userId);
      return c.json(apiResponse.message, apiResponse.statusCode);
    } catch (error) {
      console.error("Error deleting link:", error);
      return handleErrorResponse(c, error);
    }
  };
  getLinksCount = async (c) => {
    try {
      const user = mustGet(c, "user");
      const apiResponse = await this.linkService.getLinksCount(user.id);
      return c.json(apiResponse.data, apiResponse.statusCode);
    } catch (error) {
      console.error("Error getting links count:", error);
      return handleErrorResponse(c, error);
    }
  };
};

// src/api/middleware.ts
import { HTTPException as HTTPException4 } from "diesel-core/http-exception";

// src/utils/jwt.ts
import * as jwt2 from "jsonwebtoken";
function verifyToken(token) {
  if (token.startsWith("Bearer ")) token = token.slice(7);
  return jwt2.verify(token, process.env.ACCESS_TOKEN_SECRET);
}
function verifyRefreshToken(token) {
  if (token.startsWith("Bearer ")) token = token.slice(7);
  return jwt2.verify(token, process.env.REFRESH_TOKEN_SECRET);
}

// constant.ts
var RATE_LIMIT = parseInt(process.env.UPLOAD_RATE_LIMIT) || 60;
var WINDOW = parseInt(process.env.UPLOAD_RATE_WINDOW) || 60;
var REFRESH_TOKEN_RATE_LIMIT = parseInt(process.env.REFRESH_TOKEN_RATE_LIMIT) || 10;
var REFRESH_TOKEN_RATE_WINDOW = parseInt(process.env.REFRESH_TOKEN_RATE_WINDOW) || 60;

// src/utils/rate-limit.ts
import { HTTPException as HTTPException3 } from "diesel-core/http-exception";
import { connInfo } from "diesel-core/bun";
var getClientIp = (c) => {
  const ipInfo = connInfo(c);
  if (ipInfo && typeof ipInfo === "object" && "address" in ipInfo) return ipInfo.address;
  if (typeof ipInfo === "string") return ipInfo;
  return null;
};
var enforceRateLimit = async (key, limit, window) => {
  const current = Number(await redis.incr(key));
  if (current === 1) await redis.expire(key, window);
  if (current > limit) {
    throw new HTTPException3(429, {
      message: "Too many requests. Try again later.",
      cause: "Too many requests. Try again later."
    });
  }
};

// src/api/middleware.ts
var DieselMiddlewares = class _DieselMiddlewares {
  static instance;
  userRepository;
  linkRepository;
  cache;
  constructor(userRepository2, linkRepository2, cache) {
    this.userRepository = userRepository2, this.linkRepository = linkRepository2, this.cache = cache;
  }
  static getInstance(userRepository2, linkRepository2, cache) {
    if (!this.instance) {
      this.instance = new _DieselMiddlewares(userRepository2, linkRepository2, cache);
    }
    return _DieselMiddlewares.instance;
  }
  authJwt = async (c) => {
    try {
      let token = c.req?.headers.get("Authorization") ?? c.cookies?.accessToken;
      if (!token) {
        throw new HTTPException4(401, {
          message: "Unauthorized",
          cause: "No token provided"
        });
      }
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        throw new HTTPException4(401, {
          message: "Unauthorized",
          cause: "Invalid token"
        });
      }
      const user = await this.userRepository.findUserAndPlanName(decoded.id);
      if (!user) {
        throw new HTTPException4(401, {
          message: "Unauthorized: User not found"
        });
      }
      c.set("user", user);
    } catch (error) {
      console.error("JWT verification error:", error?.message);
      let errMsg = "Invalid token";
      if (error.name === "TokenExpiredError") {
        errMsg = "Token expired";
      } else if (error.name === "JsonWebTokenError") {
        errMsg = "Malformed or tampered token";
      }
      if (error.name === "HTTPException") throw error;
      throw new HTTPException4(401, {
        message: errMsg,
        cause: error?.message
        // res: c.json({ message: "Unauthorized", error: errMsg }, 401)
      });
    }
  };
  // 
  UploadRateLimit = async (c) => {
    try {
      const ip = getClientIp(c);
      const token = c.query.token;
      const key = `upload:rate:${ip}:${token}`;
      const current = Number(await redis.incr(key));
      if (current === 1) await redis.expire(key, WINDOW);
      c.setHeader("X-RateLimit-Limit", RATE_LIMIT.toString());
      c.setHeader("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT - current).toString());
      c.setHeader("X-RateLimit-Reset", WINDOW.toString());
      if (current > RATE_LIMIT) {
        throw new HTTPException4(429, {
          message: "Too many requests. Try again later.",
          cause: "Too many requests. Try again later."
        });
      }
      return;
    } catch (error) {
      if (error.name === "HTTPException") throw error;
      console.error("Internal error in UploadRateLimit:", error);
      throw new HTTPException4(500, { message: "Internal Server Error in rate limit upload" });
    }
  };
  validateToken = async (ctx) => {
    try {
      const token = ctx.query.token;
      if (!token) throw new HTTPException4(404, { message: "Token is required" });
      const link = await this.linkRepository.findLinkByToken(token);
      if (!link || new Date(link.expiresAt) < /* @__PURE__ */ new Date()) {
        throw new HTTPException4(404, { message: "Link not found or expired" });
      }
      ctx.set("link", link);
    } catch (error) {
      if (error.name === "HTTPException") throw error;
      console.error("Internal Server Error in validate token ", error);
      throw new HTTPException4(500, { message: "Internal Server Error in validate token" });
    }
  };
  //
  validateLinkAccess = async (c) => {
    try {
      const link = c.get("link");
      if (!link) throw new HTTPException4(400, { message: "Link not found in context" });
      const body = await c.body;
      const parsed = uploadRequestSchema.safeParse(body);
      if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);
      const { mimeType, fileSize } = parsed.data;
      const redisKey = `upload:count:${link.id}`;
      const maxUploads = link.maxUploads;
      const ttl = calculateTTL(fileSize);
      const expireAfterFirst = link.expireAfterFirstUpload ? "1" : "0";
      let result;
      try {
        result = Number(await redis.eval(script, 1, redisKey, maxUploads, ttl, expireAfterFirst));
      } catch (err) {
        console.error("Redis error:", err);
        result = 0;
      }
      if (result === -1 || result === -2) {
        throw new HTTPException4(403, {
          message: "Unable to process upload at this time."
        });
      }
      const { uploadCount } = await this.linkRepository.findLinkUploadCount(link.id);
      if (result === -1 || result === -2 || uploadCount >= maxUploads) {
        throw new HTTPException4(403, {
          message: "Unable to process upload at this time."
        });
      }
      c.set("mimeType", mimeType);
    } catch (error) {
      if (error?.name === "HTTPException") throw error;
      console.error("validateLinkAccess error:", error);
      throw new HTTPException4(500, {
        res: c.json({ error: "Internal Server Error in validateLinkAccess" }, 500)
      });
    }
  };
  fetchUser = async (c) => {
    try {
      let token = c.req.headers.get("Authorization") ?? c.cookies?.accessToken;
      if (!token) throw new HTTPException4(401, { message: "Unauthorized", cause: "No token provided" });
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) throw new HTTPException4(401, { message: "Unauthorized", cause: "Invalid token" });
      const user = await this.userRepository.findUserId(decoded.id);
      if (!user) throw new HTTPException4(401, { message: "Unauthorized: User not found" });
      c.set("user", user);
    } catch (error) {
      if (error?.name === "HTTPException") throw error;
      throw new HTTPException4(401, { message: "Unauthorized", cause: error?.message });
    }
  };
  fetchUserFromRefreshToken = async (c) => {
    try {
      const ip = getClientIp(c);
      await enforceRateLimit(`refresh:rate:ip:${ip}`, REFRESH_TOKEN_RATE_LIMIT, REFRESH_TOKEN_RATE_WINDOW);
      const token = c.cookies?.refreshToken;
      if (!token) throw new HTTPException4(401, { message: "Unauthorized", cause: "No refresh token provided" });
      const decoded = verifyRefreshToken(token);
      if (!decoded || !decoded.id) throw new HTTPException4(401, { message: "Unauthorized", cause: "Invalid refresh token" });
      await enforceRateLimit(`refresh:rate:user:${decoded.id}`, REFRESH_TOKEN_RATE_LIMIT, REFRESH_TOKEN_RATE_WINDOW);
      const user = await this.userRepository.findUserId(decoded.id);
      if (!user) throw new HTTPException4(401, { message: "Unauthorized: User not found" });
      c.set("user", user);
    } catch (error) {
      if (error?.name === "HTTPException") throw error;
      throw new HTTPException4(401, { message: "Unauthorized", cause: error?.message });
    }
  };
  fetchUserLinks = async (c) => {
    try {
      let token = c.req.headers.get("Authorization") ?? c.cookies?.accessToken;
      if (!token) throw new HTTPException4(401, { message: "Unauthorized", cause: "No token provided" });
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) throw new HTTPException4(401, { message: "Unauthorized", cause: "Invalid token" });
      const query = c.query.query || "";
      const limit = parseInt(c.query.limit || "10");
      const page = parseInt(c.query.page || "1");
      const skip = (page - 1) * limit;
      const links3 = await this.linkRepository.findUserLinks(decoded.id, query, skip, limit);
      if (!links3 || links3.length === 0) {
        return c.json({ error: "No links found or unauthorized", data: [] }, 200);
      }
      c.set("userId", decoded.id);
      c.set("userLinks", links3);
      c.set("pagination", { limit, page });
    } catch (error) {
      if (error?.name === "HTTPException") throw error;
      throw new HTTPException4(500, { message: "Internal Server Error in fetchUserLinks" });
    }
  };
  fetchLinkWithUser = async (c) => {
    try {
      let token = c.req.headers.get("Authorization") ?? c.cookies?.accessToken;
      if (!token) throw new HTTPException4(401, { message: "Unauthorized", cause: "No token provided" });
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) throw new HTTPException4(401, { message: "Unauthorized", cause: "Invalid token" });
      const linkId = c.params.id;
      if (!linkId) throw new HTTPException4(400, { message: "Invalid link ID" });
      const link = await this.linkRepository.findLinkByIdAndUser(linkId, decoded.id);
      if (!link) throw new HTTPException4(404, { message: "Not Found" });
      c.set("userId", decoded.id);
      c.set("link", link);
    } catch (error) {
      if (error?.name === "HTTPException") throw error;
      throw new HTTPException4(500, { message: "Internal Server Error in fetchLinkWithUser" });
    }
  };
  fetchFilesByTokenMiddleware = async (c) => {
    try {
      let token = c.req.headers.get("Authorization") ?? c.cookies?.accessToken;
      if (!token) throw new HTTPException4(401, { message: "Unauthorized", cause: "No token provided" });
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) throw new HTTPException4(401, { message: "Unauthorized", cause: "Invalid token" });
      const linkToken = c.params.token;
      const linkId = c.params.id;
      if (!linkToken || !linkId) throw new HTTPException4(400, { message: "Token param or linkId missing" });
      const limit = parseInt(c.query.limit || "10");
      const page = parseInt(c.query.page || "1");
      const skip = (page - 1) * limit;
      const link = await this.linkRepository.findLinkWithFilesByTokenAndUserId(linkId, linkToken, decoded.id, skip, limit);
      if (!link) throw new HTTPException4(404, { message: "No files found or unauthorized access" });
      c.set("files", link.files);
      c.set("pagination", { page, limit });
    } catch (error) {
      if (error?.name === "HTTPException") throw error;
      throw new HTTPException4(500, { message: "Internal Server Error in fetchFilesByTokenMiddleware" });
    }
  };
};

// src/container/controllers.ts
var dieselAuthController = DieselAuthController.getInstance(authService);
var dieselMiddleware = DieselMiddlewares.getInstance(userRepository, linkRepository, cacheService);
var diesel_file_controller = DieselFileController.getInstance(fileService);
var diesel_link_controller = DieselLinkController.getInstance(linkService);

// serve.ts
import { Pool as Pool2 } from "pg";
import { serve } from "diesel-core/node";

// app.ts
import { Diesel as Diesel4 } from "diesel-core";
import { cors } from "diesel-core/cors";
import { advancedLogger } from "diesel-core/logger";

// metrics.ts
import { Registry, Gauge, Counter, Histogram } from "prom-client";
import * as os from "os";
var registry = new Registry();
var cpuGauge = new Gauge({
  name: "cpu_load_avg_1m",
  help: "1-minute load average"
});
registry.registerMetric(cpuGauge);
var rssGauge = new Gauge({ name: "memory_rss_mb", help: "RSS memory in MB" });
var heapTotalGauge = new Gauge({ name: "memory_heap_total_mb", help: "Heap total in MB" });
var heapUsedGauge = new Gauge({ name: "memory_heap_used_mb", help: "Heap used in MB" });
registry.registerMetric(rssGauge);
registry.registerMetric(heapTotalGauge);
registry.registerMetric(heapUsedGauge);
var eventLoopLagGauge = new Gauge({
  name: "event_loop_lag_ms",
  help: "Approximate event loop lag in milliseconds"
});
registry.registerMetric(eventLoopLagGauge);
var httpRequestsCounter = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"]
});
registry.registerMetric(httpRequestsCounter);
var httpResponseTime = new Histogram({
  name: "http_response_time_seconds",
  help: "HTTP response time in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});
registry.registerMetric(httpResponseTime);
var computeMetrics = (time = 30 * 1e3) => {
  const update = () => {
    const mem = process.memoryUsage();
    const cpuLoad = os.loadavg()[0];
    cpuGauge.set(cpuLoad);
    rssGauge.set(mem.rss / 1024 / 1024);
    heapTotalGauge.set(mem.heapTotal / 1024 / 1024);
    heapUsedGauge.set(mem.heapUsed / 1024 / 1024);
    const start = Date.now();
    setTimeout(() => eventLoopLagGauge.set(Date.now() - start), 0);
    console.log(
      `[Metrics] CPU:${cpuLoad.toFixed(2)} RSS:${(mem.rss / 1024 / 1024).toFixed(2)}MB HeapUsed:${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`
    );
  };
  update();
  setInterval(update, time);
};
computeMetrics();

// src/api/routes/auth.routes.ts
import { Diesel } from "diesel-core";
import { logger } from "diesel-core/logger";
var diesel_auth_router = new Diesel();
diesel_auth_router.useLogger(logger);
diesel_auth_router.get("/", (c) => {
  return c.text("auth route mounted to diesel");
}).post("/signup", dieselAuthController.signup).post("/login", dieselAuthController.login).get("/check", dieselMiddleware.authJwt, dieselAuthController.checkAuth).get("/logout", dieselAuthController.logout).get("/refresh-token", dieselMiddleware.fetchUserFromRefreshToken, dieselAuthController.refresh_token);

// src/api/routes/link.routes.ts
import { Diesel as Diesel2 } from "diesel-core";
import { logger as logger2 } from "diesel-core/logger";
var diesel_link_router = new Diesel2();
diesel_link_router.useLogger(logger2);
diesel_link_router.get("/", dieselMiddleware.fetchUserLinks, diesel_link_controller.getUserLinks).get("/count", dieselMiddleware.fetchUser, diesel_link_controller.getLinksCount).get("/validate", diesel_link_controller.validateLink).post("/", dieselMiddleware.authJwt, diesel_link_controller.generateLink).delete("/:id", dieselMiddleware.fetchLinkWithUser, diesel_link_controller.deleteLink);

// src/api/routes/file.routes.ts
import { Diesel as Diesel3 } from "diesel-core";
import { logger as logger3 } from "diesel-core/logger";
var diesel_file_router = new Diesel3({ errorFormat: "json" });
diesel_file_router.useLogger(logger3);
diesel_file_router.get("/:id/:token/files", dieselMiddleware.fetchFilesByTokenMiddleware, diesel_file_controller.getFilesByLinkToken).get("/storage-used", dieselMiddleware.fetchUser, diesel_file_controller.storeageUsed).get("/signed-url", dieselMiddleware.fetchUser, diesel_file_controller.getDownloadPresignedUrl).post(
  "/upload-url",
  dieselMiddleware.UploadRateLimit,
  dieselMiddleware.validateToken,
  dieselMiddleware.validateLinkAccess,
  diesel_file_controller.getUploadPresignedUrl
).post("/notify-upload", dieselMiddleware.validateToken, diesel_file_controller.notifyFileUpload).delete("/:id/files/:file_id", dieselMiddleware.fetchUser, diesel_file_controller.deleteFileFromLink);

// app.ts
function createApp() {
  const app = new Diesel4({});
  app.useAdvancedLogger(advancedLogger);
  const allowedOrigins = CONFIG.CORS_ORIGINS?.split(",") || [];
  app.use(cors({ origin: allowedOrigins, credentials: true })).addHooks("onRequest", (ctx) => {
    ctx.set("_start", Date.now());
  }).addHooks("onSend", async (ctx, res) => {
    if (!res) return;
    const duration = (Date.now() - (ctx.get("_start") ?? Date.now())) / 1e3;
    httpRequestsCounter.labels(ctx.req.method, ctx.req.url, res.status.toString()).inc();
    httpResponseTime.labels(ctx.req.method, ctx.req.url, res.status.toString()).observe(duration);
  }).addHooks("onSend", async (_ctx, res) => {
    if (!res) return;
    res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("X-XSS-Protection", "0");
    res.headers.set("X-Content-Type-Options", "nosniff");
    return res;
  }).get("/", () => new Response("Welcome to openfile")).get("/health", (c) => c.text("i'm good lady boy!")).get("/metrics", async (c) => {
    const metrics = await registry.metrics();
    return c.text(metrics, 200, { "Content-Type": registry.contentType });
  });
  app.sub("/api/v1/auth/*", diesel_auth_router);
  app.sub("/api/v1/link/*", diesel_link_router);
  app.sub("/api/v1/file/*", diesel_file_router);
  return app;
}

// serve.ts
async function checkDB() {
  const pool = new Pool2({ connectionString: CONFIG.DATABASE_URL });
  try {
    await pool.query("SELECT 1");
    console.log("[DB] Connection OK");
  } finally {
    await pool.end();
  }
}
async function startServer() {
  await checkDB();
  const app = createApp();
  const port = CONFIG.PORT || 8e3;
  serve({
    port,
    fetch: app.fetch
  });
  console.log(`Listening on http://localhost:${port}`);
}

// index.ts
async function pushPendingFilesToQueue() {
  await cleanupService.requeuePendingAndFailedFiles();
}
if (process.env.NODE_ENV === "development") {
  await redis.flushall();
  await redis.flushdb();
}
cleanupService.run_delete_file_worker();
cleanupService.runLinkCleanupInterval(process.env.CLEANUP_INTERVAL ?? "10m");
cleanupService.runFileRecoveryInterval(process.env.FILE_RECOVERY_INTERVAL ?? "10m");
cleanupService.requeuePendingAndFailedFiles().catch((err) => console.error("[Recovery] Failed initial requeue on startup:", err));
startServer().catch((err) => {
  console.error("[Server] Failed to start:", err);
  process.exit(1);
});
export {
  pushPendingFilesToQueue
};
