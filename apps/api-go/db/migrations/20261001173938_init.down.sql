-- reverse: create index "File_status_expiresAt_idx" to table: "File"
DROP INDEX "File_status_expiresAt_idx";
-- reverse: create "File" table
DROP TABLE "File";
-- reverse: create "User" table
DROP TABLE "User";
-- reverse: create "SubscriptionLog" table
DROP TABLE "SubscriptionLog";
-- reverse: create "Subscription" table
DROP TABLE "Subscription";
-- reverse: create "Link" table
DROP TABLE "Link";
-- reverse: create "DeletedFile" table
DROP TABLE "DeletedFile";
-- reverse: create enum type "FileStatus"
DROP TYPE "FileStatus";
-- reverse: create enum type "DeletedStatus"
DROP TYPE "DeletedStatus";
-- reverse: create enum type "SubscriptionStatus"
DROP TYPE "SubscriptionStatus";
