-- modify "User" table
ALTER TABLE "User" DROP COLUMN "avatar";
-- create "Session" table
CREATE TABLE "Session" (
  "id" uuid NOT NULL,
  "userId" uuid NOT NULL,
  "tokenHash" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "revokedAt" timestamp NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "Session_tokenHash_key" UNIQUE ("tokenHash"),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- create index "Session_userId_idx" to table: "Session"
CREATE INDEX "Session_userId_idx" ON "Session" ("userId");
