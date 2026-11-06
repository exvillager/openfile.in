-- modify "Session" table
ALTER TABLE "Session" ADD COLUMN "refreshTokenHash" text NOT NULL, ADD CONSTRAINT "Session_refreshTokenHash_key" UNIQUE ("refreshTokenHash");
