CREATE TYPE "public"."DeletedStatus" AS ENUM('PENDING', 'DELETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."FileStatus" AS ENUM('PENDING', 'CONFIRMED');--> statement-breakpoint
CREATE TYPE "public"."SubscriptionStatus" AS ENUM('ACTIVE', 'INACTIVE', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "DeletedFile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"fileId" uuid NOT NULL,
	"linkId" uuid NOT NULL,
	"fileUrl" text NOT NULL,
	"status" "DeletedStatus" DEFAULT 'PENDING' NOT NULL,
	"deletedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "File" (
	"id" uuid PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"key" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"size" bigint NOT NULL,
	"keyUsed" boolean DEFAULT false NOT NULL,
	"status" "FileStatus" DEFAULT 'PENDING' NOT NULL,
	"expiresAt" timestamp,
	"uploadLinkId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "File_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "Link" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"name" varchar(255) DEFAULT '',
	"maxUploads" integer NOT NULL,
	"uploadCount" integer NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"expireAfterFirstUpload" boolean DEFAULT false NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SubscriptionLog" (
	"id" uuid PRIMARY KEY NOT NULL,
	"eventType" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"userEmail" varchar(255) NOT NULL,
	"userId" uuid,
	"paymentId" varchar(255) NOT NULL,
	"subscriptionId" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(10) NOT NULL,
	"rawPayload" json NOT NULL,
	"message" text NOT NULL,
	"error" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "SubscriptionLog_paymentId_unique" UNIQUE("paymentId")
);
--> statement-breakpoint
CREATE TABLE "Subscription" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"planName" varchar(255) DEFAULT 'free' NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"status" "SubscriptionStatus" DEFAULT 'ACTIVE',
	"startDate" timestamp DEFAULT now() NOT NULL,
	"endDate" timestamp,
	"cancelAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Subscription_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"name" varchar(255),
	"username" varchar(255) NOT NULL,
	"passoword" text,
	"avatar" varchar(255) DEFAULT '',
	"linkCount" integer DEFAULT 0 NOT NULL,
	"linkCountExpireAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "User_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "File" ADD CONSTRAINT "File_uploadLinkId_Link_id_fk" FOREIGN KEY ("uploadLinkId") REFERENCES "public"."Link"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "File_status_expiresAt_idx" ON "File" USING btree ("status","expiresAt");