-- reverse: modify "Session" table
ALTER TABLE "Session" DROP CONSTRAINT "Session_refreshTokenHash_key", DROP COLUMN "refreshTokenHash";
