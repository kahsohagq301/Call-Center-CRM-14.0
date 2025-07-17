import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Auth middleware
function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Analytics endpoint
  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Call routes
  app.get("/api/calls", requireAuth, requireRole(["CC Agent", "Super Admin"]), async (req, res) => {
    try {
      const { category } = req.query;
      const userId = req.user.role === "CC Agent" ? req.user.id : undefined;
      const calls = await storage.getCalls(userId, category as string);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calls" });
    }
  });

  app.post("/api/calls", requireAuth, requireRole(["CC Agent", "Super Admin"]), async (req, res) => {
    try {
      const callData = {
        userId: req.user.id,
        customerNumber: req.body.customerNumber,
        category: req.body.category,
      };
      
      const call = await storage.createCall(callData);
      res.status(201).json(call);
    } catch (error) {
      res.status(500).json({ message: "Failed to create call" });
    }
  });

  app.patch("/api/calls/:id", requireAuth, requireRole(["CC Agent", "Super Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { category } = req.body;
      
      const call = await storage.updateCall(parseInt(id), { category });
      res.json(call);
    } catch (error) {
      res.status(500).json({ message: "Failed to update call" });
    }
  });

  // Lead routes
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const leads = await storage.getLeadsByUser(req.user.id);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/received", requireAuth, requireRole(["CRO Agent"]), async (req, res) => {
    try {
      const leads = await storage.getReceivedLeads(req.user.id);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch received leads" });
    }
  });

  app.post("/api/leads", requireAuth, requireRole(["CC Agent"]), upload.single('biodataFile'), async (req, res) => {
    try {
      const leadData = {
        userId: req.user.id,
        customerName: req.body.customerName,
        customerNumber: req.body.customerNumber,
        biodataFile: req.file ? req.file.path : undefined,
        description: req.body.description,
      };
      
      const lead = await storage.createLead(leadData);
      
      // Update task progress
      const task = await storage.getTodayTask(req.user.id);
      if (task) {
        const newCount = task.addLeadCount + 1;
        await storage.updateTask(task.id, {
          addLeadCount: newCount,
          addLeadCompleted: newCount >= 5,
        });
      }
      
      res.status(201).json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id/transfer", requireAuth, requireRole(["CC Agent"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { transferredTo } = req.body;
      
      const lead = await storage.transferLead(parseInt(id), transferredTo);
      
      // Update task progress
      const task = await storage.getTodayTask(req.user.id);
      if (task) {
        const newCount = task.transferLeadCount + 1;
        await storage.updateTask(task.id, {
          transferLeadCount: newCount,
          transferLeadCompleted: newCount >= 3,
        });
      }
      
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to transfer lead" });
    }
  });

  app.patch("/api/leads/:id", requireAuth, requireRole(["CC Agent"]), async (req, res) => {
    try {
      const { id } = req.params;
      const lead = await storage.updateLead(parseInt(id), req.body);
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", requireAuth, requireRole(["CC Agent"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLead(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Report routes
  app.get("/api/reports", requireAuth, async (req, res) => {
    try {
      const reports = req.user.role === "Super Admin" 
        ? await storage.getAllReports()
        : await storage.getReportsByUser(req.user.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", requireAuth, requireRole(["CC Agent"]), async (req, res) => {
    try {
      const reportData = {
        userId: req.user.id,
        onlineCall: req.body.onlineCall,
        offlineCall: req.body.offlineCall,
        totalLeads: req.body.totalLeads,
      };
      
      const report = await storage.createReport(reportData);
      
      // Update task progress
      const task = await storage.getTodayTask(req.user.id);
      if (task) {
        await storage.updateTask(task.id, {
          reportSubmitted: true,
        });
      }
      
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  // Task routes
  app.get("/api/tasks/today", requireAuth, async (req, res) => {
    try {
      const task = await storage.getTodayTask(req.user.id);
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's task" });
    }
  });

  // User management routes
  app.get("/api/users", requireAuth, requireRole(["Super Admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/cc-agents", requireAuth, requireRole(["Super Admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const ccAgents = users.filter(user => user.role === "CC Agent");
      res.json(ccAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CC agents" });
    }
  });

  app.get("/api/users/cro-agents", requireAuth, requireRole(["CC Agent"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const croAgents = users.filter(user => user.role === "CRO Agent");
      res.json(croAgents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch CRO agents" });
    }
  });

  app.post("/api/users", requireAuth, requireRole(["Super Admin"]), upload.single('profilePicture'), async (req, res) => {
    try {
      const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password, // This should be hashed
        role: req.body.role,
        officialNumber: req.body.officialNumber,
        profilePicture: req.file ? req.file.path : undefined,
      };
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      
      // Users can only update their own profile unless they're Super Admin
      if (req.user.role !== "Super Admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const user = await storage.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole(["Super Admin"]), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Number upload routes
  app.post("/api/number-uploads", requireAuth, requireRole(["Super Admin"]), upload.single('file'), async (req, res) => {
    try {
      const { assignedTo } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }
      
      // TODO: Parse Excel file and extract numbers
      const numbers = []; // This should be populated from Excel parsing
      
      const upload = await storage.createNumberUpload({
        uploadedBy: req.user.id,
        assignedTo: parseInt(assignedTo),
        fileName: req.file.originalname,
        numbers,
      });
      
      res.status(201).json(upload);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload numbers" });
    }
  });

  // Set up cron job for daily task reset and call cleanup
  const cron = (await import('node-cron')).default;
  
  // Reset tasks daily at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      await storage.resetDailyTasks();
      await storage.deleteExpiredCalls();
    } catch (error) {
      console.error('Failed to reset daily tasks:', error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
