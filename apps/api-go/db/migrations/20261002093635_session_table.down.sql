-- reverse: create index "Session_userId_idx" to table: "Session"
DROP INDEX "Session_userId_idx";
-- reverse: create "Session" table
DROP TABLE "Session";
-- reverse: modify "User" table
ALTER TABLE "User" ADD COLUMN "avatar" character varying(255) NULL DEFAULT '';
