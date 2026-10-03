-- create enum type "SubscriptionStatus"
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');
-- create enum type "DeletedStatus"
CREATE TYPE "DeletedStatus" AS ENUM ('PENDING', 'DELETED', 'FAILED');
-- create enum type "FileStatus"
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'CONFIRMED');
-- create "DeletedFile" table
CREATE TABLE "DeletedFile" (
  "id" uuid NOT NULL,
  "fileId" uuid NOT NULL,
  "linkId" uuid NOT NULL,
  "fileUrl" text NOT NULL,
  "status" "DeletedStatus" NOT NULL DEFAULT 'PENDING',
  "deletedAt" timestamp NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "DeletedFile_fileId_key" UNIQUE ("fileId")
);
-- create "Link" table
CREATE TABLE "Link" (
  "id" uuid NOT NULL,
  "token" character varying(255) NOT NULL,
  "name" character varying(255) NULL DEFAULT '',
  "maxUploads" integer NOT NULL,
  "uploadCount" integer NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "expireAfterFirstUpload" boolean NOT NULL DEFAULT false,
  "userId" uuid NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- create "Subscription" table
CREATE TABLE "Subscription" (
  "id" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "planName" character varying(255) NOT NULL DEFAULT 'free',
  "price" double precision NOT NULL DEFAULT 0.0,
  "status" "SubscriptionStatus" NULL DEFAULT 'ACTIVE',
  "startDate" timestamp NOT NULL DEFAULT now(),
  "endDate" timestamp NULL,
  "cancelAt" timestamp NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_userId_key" UNIQUE ("userId")
);
-- create "SubscriptionLog" table
CREATE TABLE "SubscriptionLog" (
  "id" uuid NOT NULL,
  "eventType" character varying(255) NOT NULL,
  "status" character varying(255) NOT NULL,
  "userEmail" character varying(255) NOT NULL,
  "userId" uuid NULL,
  "paymentId" character varying(255) NOT NULL,
  "subscriptionId" character varying(255) NULL,
  "amount" integer NOT NULL,
  "currency" character varying(10) NOT NULL,
  "rawPayload" json NOT NULL,
  "message" text NOT NULL,
  "error" text NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "SubscriptionLog_paymentId_key" UNIQUE ("paymentId")
);
-- create "User" table
CREATE TABLE "User" (
  "id" uuid NOT NULL,
  "email" character varying(255) NULL,
  "name" character varying(255) NULL,
  "username" character varying(255) NOT NULL,
  "passoword" text NULL,
  "avatar" character varying(255) NULL DEFAULT '',
  "linkCount" integer NOT NULL DEFAULT 0,
  "linkCountExpireAt" timestamp NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "User_username_key" UNIQUE ("username")
);
-- create "File" table
CREATE TABLE "File" (
  "id" uuid NOT NULL,
  "url" text NOT NULL,
  "key" text NOT NULL,
  "name" character varying(255) NOT NULL,
  "size" bigint NOT NULL,
  "keyUsed" boolean NOT NULL DEFAULT false,
  "status" "FileStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt" timestamp NULL,
  "uploadLinkId" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "File_key_key" UNIQUE ("key"),
  CONSTRAINT "File_uploadLinkId_fkey" FOREIGN KEY ("uploadLinkId") REFERENCES "Link" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- create index "File_status_expiresAt_idx" to table: "File"
CREATE INDEX "File_status_expiresAt_idx" ON "File" ("status", "expiresAt");
