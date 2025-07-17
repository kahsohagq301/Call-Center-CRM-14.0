import { 
  users, 
  calls, 
  leads, 
  reports, 
  tasks, 
  numberUploads,
  type User, 
  type InsertUser,
  type Call,
  type InsertCall,
  type Lead,
  type InsertLead,
  type Report,
  type InsertReport,
  type Task,
  type InsertTask,
  type NumberUpload,
  type InsertNumberUpload
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: any;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  
  // Call operations
  getCallsByUser(userId: number): Promise<Call[]>;
  getCalls(userId?: number, category?: string): Promise<Call[]>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, call: Partial<InsertCall>): Promise<Call>;
  deleteCall(id: number): Promise<void>;
  deleteExpiredCalls(): Promise<void>;
  
  // Lead operations
  getLeadsByUser(userId: number): Promise<Lead[]>;
  getReceivedLeads(userId: number): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
  transferLead(id: number, transferredTo: number): Promise<Lead>;
  
  // Report operations
  getReportsByUser(userId: number): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: number): Promise<void>;
  
  // Task operations
  getTasksByUser(userId: number, date?: Date): Promise<Task[]>;
  getTodayTask(userId: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  resetDailyTasks(): Promise<void>;
  
  // Number upload operations
  getNumberUploads(): Promise<NumberUpload[]>;
  createNumberUpload(upload: InsertNumberUpload): Promise<NumberUpload>;
  deleteNumberUpload(id: number): Promise<void>;
  
  // Analytics
  getAnalytics(): Promise<{
    totalLeads: number;
    totalCalls: number;
    totalAccounts: number;
    totalTransferredLeads: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isActive, true)).orderBy(asc(users.name));
  }

  async deleteUser(id: number): Promise<void> {
    await db.update(users).set({ isActive: false }).where(eq(users.id, id));
  }

  async getCallsByUser(userId: number): Promise<Call[]> {
    return await db
      .select()
      .from(calls)
      .where(and(eq(calls.userId, userId), isNull(calls.deletedAt)))
      .orderBy(desc(calls.createdAt));
  }

  async getCalls(userId?: number, category?: string): Promise<Call[]> {
    let conditions = [isNull(calls.deletedAt)];
    
    if (userId) {
      conditions.push(eq(calls.userId, userId));
    }
    
    if (category) {
      conditions.push(eq(calls.category, category));
    }
    
    return await db.select().from(calls).where(and(...conditions)).orderBy(desc(calls.createdAt));
  }

  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db.insert(calls).values(call).returning();
    return newCall;
  }

  async updateCall(id: number, call: Partial<InsertCall>): Promise<Call> {
    const [updatedCall] = await db
      .update(calls)
      .set(call)
      .where(eq(calls.id, id))
      .returning();
    return updatedCall;
  }

  async deleteCall(id: number): Promise<void> {
    await db.delete(calls).where(eq(calls.id, id));
  }

  async deleteExpiredCalls(): Promise<void> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db
      .update(calls)
      .set({ deletedAt: new Date() })
      .where(
        and(
          sql`${calls.category} IS NOT NULL`,
          sql`${calls.category} != ''`,
          sql`${calls.createdAt} < ${twentyFourHoursAgo}`
        )
      );
  }

  async getLeadsByUser(userId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt));
  }

  async getReceivedLeads(userId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.transferredTo, userId))
      .orderBy(desc(leads.transferredAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }

  async updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set(lead)
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async transferLead(id: number, transferredTo: number): Promise<Lead> {
    const [transferredLead] = await db
      .update(leads)
      .set({
        isTransferred: true,
        transferredTo,
        transferredAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return transferredLead;
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.reportDate));
  }

  async getAllReports(): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .orderBy(desc(reports.reportDate));
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReport(id: number, report: Partial<InsertReport>): Promise<Report> {
    const [updatedReport] = await db
      .update(reports)
      .set(report)
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async getTasksByUser(userId: number, date?: Date): Promise<Task[]> {
    let conditions = [eq(tasks.userId, userId)];
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(
        sql`${tasks.taskDate} >= ${startOfDay}`,
        sql`${tasks.taskDate} <= ${endOfDay}`
      );
    }
    
    return await db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.taskDate));
  }

  async getTodayTask(userId: number): Promise<Task | undefined> {
    const today = new Date();
    const tasks = await this.getTasksByUser(userId, today);
    return tasks[0];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async resetDailyTasks(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create new tasks for all active users
    const activeUsers = await this.getAllUsers();
    
    for (const user of activeUsers) {
      if (user.role === 'CC Agent') {
        const existingTask = await this.getTodayTask(user.id);
        if (!existingTask) {
          await this.createTask({
            userId: user.id,
            addLeadCompleted: false,
            addLeadCount: 0,
            transferLeadCompleted: false,
            transferLeadCount: 0,
            reportSubmitted: false,
          });
        }
      }
    }
  }

  async getNumberUploads(): Promise<NumberUpload[]> {
    return await db
      .select()
      .from(numberUploads)
      .orderBy(desc(numberUploads.createdAt));
  }

  async createNumberUpload(upload: InsertNumberUpload): Promise<NumberUpload> {
    const [newUpload] = await db.insert(numberUploads).values(upload).returning();
    return newUpload;
  }

  async deleteNumberUpload(id: number): Promise<void> {
    await db.delete(numberUploads).where(eq(numberUploads.id, id));
  }

  async getAnalytics(): Promise<{
    totalLeads: number;
    totalCalls: number;
    totalAccounts: number;
    totalTransferredLeads: number;
  }> {
    const [leadsCount] = await db
      .select({ count: sql`count(*)` })
      .from(leads);
    
    const [callsCount] = await db
      .select({ count: sql`count(*)` })
      .from(calls)
      .where(isNull(calls.deletedAt));
    
    const [accountsCount] = await db
      .select({ count: sql`count(*)` })
      .from(users)
      .where(eq(users.isActive, true));
    
    const [transferredLeadsCount] = await db
      .select({ count: sql`count(*)` })
      .from(leads)
      .where(eq(leads.isTransferred, true));

    return {
      totalLeads: Number(leadsCount.count) || 0,
      totalCalls: Number(callsCount.count) || 0,
      totalAccounts: Number(accountsCount.count) || 0,
      totalTransferredLeads: Number(transferredLeadsCount.count) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
