// src/schema.ts
import { pgTable, varchar, text, integer, boolean, bigint, timestamp, json, doublePrecision, pgEnum, uuid, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

// Enums
export const subscriptionStatus = pgEnum("SubscriptionStatus", ["ACTIVE", "INACTIVE", "CANCELLED"]);
export const deletedStatus = pgEnum("DeletedStatus", ["PENDING", "DELETED", "FAILED"]);
// PENDING  -> a presigned upload URL was handed out, the client has not confirmed the upload yet.
// CONFIRMED -> the client called notify-upload, the object is really in the bucket.
export const fileStatus = pgEnum("FileStatus", ["PENDING", "CONFIRMED"]);

// Users table
export const users = pgTable("User", {
  id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 255 }).unique().notNull(),
  passoword: text("passoword"),
  avatar: varchar("avatar", { length: 255 }).default(''),
  linkCount: integer("linkCount").default(0).notNull(),
  linkCountExpireAt: timestamp("linkCountExpireAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  links: many(links),
  files: many(files),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
}));

// Links table
export const links = pgTable(
  "Link",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
    token: varchar("token", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).default(""),
    maxUploads: integer("maxUploads").notNull(),
    uploadCount: integer("uploadCount").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    expireAfterFirstUpload: boolean("expireAfterFirstUpload").default(false).notNull(),
    userId: uuid("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
);

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, { fields: [links.userId], references: [users.id] }),
  files: many(files),
}));

// Files table
export const files = pgTable(
  "File",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
    url: text("url").notNull(),
    key: text("key").unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    size: bigint("size", { mode: "bigint" }).notNull(),
    keyUsed: boolean("keyUsed").default(false).notNull(),
    status: fileStatus("status").default("PENDING").notNull(),
    // Deadline for the client to confirm the upload. Null once the file is CONFIRMED.
    expiresAt: timestamp("expiresAt"),
    uploadLinkId: uuid("uploadLinkId").notNull().references(() => links.id, { onDelete: "cascade" }),
    userId: uuid("userId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => [
    // Drives the sweep for abandoned uploads.
    index("File_status_expiresAt_idx").on(table.status, table.expiresAt),
  ],
);

export const filesRelations = relations(files, ({ one }) => ({
  uploadLink: one(links, { fields: [files.uploadLinkId], references: [links.id] }),
  user: one(users, { fields: [files.userId], references: [users.id] }),
}));

// Subscriptions table
export const subscriptions = pgTable(
  "Subscription",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
    userId: uuid("userId").unique().notNull(),
    planName: varchar("planName", { length: 255 }).default("free").notNull(),
    price: doublePrecision("price").default(0.0).notNull(),
    status: subscriptionStatus("status").default("ACTIVE"),
    startDate: timestamp("startDate").defaultNow().notNull(),
    endDate: timestamp("endDate"),
    cancelAt: timestamp("cancelAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

// DeletedFiles table
export const deletedFiles = pgTable(
  "DeletedFile",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
    fileId: uuid("fileId").notNull(),
    linkId: uuid("linkId").notNull(),
    fileUrl: text("fileUrl").notNull(),
    status: deletedStatus("status").default("PENDING").notNull(),
    deletedAt: timestamp("deletedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
);

// SubscriptionLogs table
export const subscriptionLogs = pgTable(
  "SubscriptionLog",
  {
    id: uuid("id").primaryKey().$defaultFn(() => uuidv7()),
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
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
);

export const subscriptionLogsRelations = relations(subscriptionLogs, ({ one }) => ({
  user: one(users, { fields: [subscriptionLogs.userId], references: [users.id] }),
}));
