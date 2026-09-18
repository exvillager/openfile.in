-- Mirrors apps/backend/src/db/schema.ts (drizzle). This is the schema sqlc
-- reads to type-check queries — it is not run as a migration. The actual
-- database is migrated from the TS backend via drizzle-kit.

CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED');
CREATE TYPE "DeletedStatus" AS ENUM ('PENDING', 'DELETED', 'FAILED');

CREATE TABLE "User" (
    id uuid PRIMARY KEY,
    email varchar(255),
    name varchar(255),
    username varchar(255) NOT NULL UNIQUE,
    passoword text,
    avatar varchar(255) DEFAULT '',
    "linkCount" integer NOT NULL DEFAULT 0,
    "linkCountExpireAt" timestamp,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "Link" (
    id uuid PRIMARY KEY,
    token varchar(255) NOT NULL,
    name varchar(255) DEFAULT '',
    "maxUploads" integer NOT NULL,
    "uploadCount" integer NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "expireAfterFirstUpload" boolean NOT NULL DEFAULT false,
    "userId" uuid NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "File" (
    id uuid PRIMARY KEY,
    url text NOT NULL,
    name varchar(255) NOT NULL,
    size bigint NOT NULL,
    "keyUsed" boolean NOT NULL DEFAULT false,
    "uploadLinkId" uuid NOT NULL REFERENCES "Link" (id) ON DELETE CASCADE,
    "userId" uuid NOT NULL,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "Subscription" (
    id uuid PRIMARY KEY,
    "userId" uuid NOT NULL UNIQUE,
    "planName" varchar(255) NOT NULL DEFAULT 'free',
    price double precision NOT NULL DEFAULT 0.0,
    status "SubscriptionStatus" DEFAULT 'ACTIVE',
    "startDate" timestamp NOT NULL DEFAULT now(),
    "endDate" timestamp,
    "cancelAt" timestamp,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "DeletedFile" (
    id uuid PRIMARY KEY,
    "fileId" uuid NOT NULL,
    "linkId" uuid NOT NULL,
    "fileUrl" text NOT NULL,
    status "DeletedStatus" NOT NULL DEFAULT 'PENDING',
    "deletedAt" timestamp,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "SubscriptionLog" (
    id uuid PRIMARY KEY,
    "eventType" varchar(255) NOT NULL,
    status varchar(255) NOT NULL,
    "userEmail" varchar(255) NOT NULL,
    "userId" uuid,
    "paymentId" varchar(255) NOT NULL UNIQUE,
    "subscriptionId" varchar(255),
    amount integer NOT NULL,
    currency varchar(10) NOT NULL,
    "rawPayload" json NOT NULL,
    message text NOT NULL,
    error text,
    "createdAt" timestamp NOT NULL DEFAULT now(),
    "updatedAt" timestamp NOT NULL DEFAULT now()
);
