import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("CC Agent"), // Super Admin, CC Agent, CRO Agent
  officialNumber: text("official_number"),
  profilePicture: text("profile_picture"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerNumber: text("customer_number").notNull(),
  category: text("category"), // Switched Off, Busy, No Answer, Not Interested, Interested
  createdAt: timestamp("created_at").defaultNow(),
  deletedAt: timestamp("deleted_at"), // for auto-deletion after 24 hours
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  customerNumber: text("customer_number").notNull(),
  biodataFile: text("biodata_file"),
  description: text("description"),
  isTransferred: boolean("is_transferred").default(false),
  transferredTo: integer("transferred_to").references(() => users.id),
  transferredAt: timestamp("transferred_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  onlineCall: integer("online_call").default(0),
  offlineCall: integer("offline_call").default(0),
  totalLeads: integer("total_leads").default(0),
  reportDate: timestamp("report_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  addLeadCompleted: boolean("add_lead_completed").default(false),
  addLeadCount: integer("add_lead_count").default(0),
  transferLeadCompleted: boolean("transfer_lead_completed").default(false),
  transferLeadCount: integer("transfer_lead_count").default(0),
  reportSubmitted: boolean("report_submitted").default(false),
  taskDate: timestamp("task_date").defaultNow(),
});

export const numberUploads = pgTable("number_uploads", {
  id: serial("id").primaryKey(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  assignedTo: integer("assigned_to").references(() => users.id),
  fileName: text("file_name").notNull(),
  numbers: jsonb("numbers").notNull(), // JSON array of phone numbers
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  calls: many(calls),
  leads: many(leads),
  reports: many(reports),
  tasks: many(tasks),
  uploadedNumbers: many(numberUploads, { relationName: "uploader" }),
  assignedNumbers: many(numberUploads, { relationName: "assignee" }),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  user: one(users, {
    fields: [calls.userId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  user: one(users, {
    fields: [leads.userId],
    references: [users.id],
  }),
  transferredToUser: one(users, {
    fields: [leads.transferredTo],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const numberUploadsRelations = relations(numberUploads, ({ one }) => ({
  uploader: one(users, {
    fields: [numberUploads.uploadedBy],
    references: [users.id],
    relationName: "uploader",
  }),
  assignee: one(users, {
    fields: [numberUploads.assignedTo],
    references: [users.id],
    relationName: "assignee",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCallSchema = createInsertSchema(calls).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  transferredAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  reportDate: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  taskDate: true,
});

export const insertNumberUploadSchema = createInsertSchema(numberUploads).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type NumberUpload = typeof numberUploads.$inferSelect;
export type InsertNumberUpload = z.infer<typeof insertNumberUploadSchema>;
