import { sqliteTable, text, integer, real, blob, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

export const users = sqliteTable("User", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  email: text("email"),
  name: text("name"),
  username: text("username").unique().notNull(),
  passoword: text("passoword"),
  avatar: text("avatar").default(''),
  linkCount: integer("linkCount").default(0).notNull(),
  linkCountExpireAt: integer("linkCountExpireAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  links: many(links),
  files: many(files),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
}));

export const links = sqliteTable("Link", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  token: text("token").notNull(),
  name: text("name").default(""),
  maxUploads: integer("maxUploads").notNull(),
  uploadCount: integer("uploadCount").notNull(),
  expiresAt: integer("expiresAt", { mode: 'timestamp' }).notNull(),
  expireAfterFirstUpload: integer("expireAfterFirstUpload", { mode: 'boolean' }).default(false).notNull(),
  userId: text("userId").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  files: many(files),
}));

export const files = sqliteTable("File", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  url: text("url").notNull(),
  key: text("key").unique().notNull(),
  name: text("name").notNull(),
  size: blob("size", { mode: 'bigint' }).notNull(),
  keyUsed: integer("keyUsed", { mode: 'boolean' }).default(false).notNull(),
  status: text("status", { enum: ["PENDING", "CONFIRMED"] }).default("PENDING").notNull(),
  expiresAt: integer("expiresAt", { mode: 'timestamp' }),
  uploadLinkId: text("uploadLinkId").notNull(),
  userId: text("userId").notNull(),
  createdAt: integer("createdAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => [
  index("File_status_expiresAt_idx").on(table.status, table.expiresAt),
]);

export const filesRelations = relations(files, ({ one }) => ({
  uploadLink: one(links, { fields: [files.uploadLinkId], references: [links.id] }),
  user: one(users, { fields: [files.userId], references: [users.id] }),
}));

export const subscriptions = sqliteTable("Subscription", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  userId: text("userId").unique().notNull(),
  planName: text("planName").default("free").notNull(),
  price: real("price").default(0.0).notNull(),
  status: text("status", { enum: ["ACTIVE", "INACTIVE", "CANCELLED"] }).default("ACTIVE"),
  startDate: integer("startDate", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  endDate: integer("endDate", { mode: 'timestamp' }),
  cancelAt: integer("cancelAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const deletedFiles = sqliteTable("DeletedFile", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  fileId: text("fileId").notNull(),
  linkId: text("linkId").notNull(),
  fileUrl: text("fileUrl").notNull(),
  status: text("status", { enum: ["PENDING", "DELETED", "FAILED"] }).default("PENDING").notNull(),
  deletedAt: integer("deletedAt", { mode: 'timestamp' }),
  createdAt: integer("createdAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const subscriptionLogs = sqliteTable("SubscriptionLog", {
  id: text("id").primaryKey().$defaultFn(() => uuidv7()),
  eventType: text("eventType").notNull(),
  status: text("status").notNull(),
  userEmail: text("userEmail").notNull(),
  userId: text("userId"),
  paymentId: text("paymentId").unique().notNull(),
  subscriptionId: text("subscriptionId"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  rawPayload: text("rawPayload", { mode: 'json' }).notNull(),
  message: text("message").notNull(),
  error: text("error"),
  createdAt: integer("createdAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const subscriptionLogsRelations = relations(subscriptionLogs, ({ one }) => ({
  user: one(users, { fields: [subscriptionLogs.userId], references: [users.id] }),
}));
