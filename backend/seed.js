import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Application from "./models/Application.js";
import Entity from "./models/Entity.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Application.deleteMany({}),
      Entity.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    // Create admin user with password for /admin/login
    const admin = await User.create({
      name: "Admin User",
      email: "admin@adventz.com",
      password: "admin@1234",
      role: "admin",
      department: "IT",
      designation: "System Administrator",
    });
    console.log("Admin created: admin@adventz.com / admin@1234");

    // Create entities
    const entities = await Entity.insertMany([
      { name: "HR Department", isActive: true, createdBy: admin._id },
      { name: "PMO", isActive: true, createdBy: admin._id },
      { name: "Finance Team", isActive: true, createdBy: admin._id },
      { name: "Engineering", isActive: true, createdBy: admin._id },
      { name: "DevOps Team", isActive: true, createdBy: admin._id },
    ]);
    console.log(`${entities.length} entities created`);

    // Create applications (mapped to entities via dropdown)
    const apps = await Application.insertMany([
      {
        name: "HRMS Portal",
        description: "Human Resource Management System for managing employee lifecycle",
        problemItSolves: "Automates HR processes like attendance, leaves, payroll and performance reviews",
        category: "HR",
        url: "https://hrms.digitalhub.com",
        entity: entities[0]._id,
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Project Tracker",
        description: "Track project milestones, tasks, and team productivity",
        problemItSolves: "Provides real-time visibility into project progress and resource allocation",
        category: "Project Management",
        url: "https://tracker.digitalhub.com",
        entity: entities[1]._id,
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Expense Manager",
        description: "Digital expense submission and approval workflow",
        problemItSolves: "Eliminates paper-based expense claims and speeds up reimbursement process",
        category: "Finance",
        url: "https://expense.digitalhub.com",
        entity: entities[2]._id,
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Knowledge Base",
        description: "Centralized wiki for company documentation and SOPs",
        problemItSolves: "Reduces repeated questions and makes organizational knowledge easily searchable",
        category: "Documentation",
        url: "https://wiki.digitalhub.com",
        entity: entities[3]._id,
        isActive: false,
        createdBy: admin._id,
      },
      {
        name: "CI/CD Pipeline Dashboard",
        description: "Unified view of all build and deployment pipelines",
        problemItSolves: "Gives developers instant feedback on build failures and deployment status",
        category: "DevOps",
        url: "https://cicd.digitalhub.com",
        entity: entities[4]._id,
        isActive: true,
        createdBy: admin._id,
      },
    ]);
    console.log(`${apps.length} applications created`);

    console.log("\n--- Seed Complete ---");
    console.log("Note: Login is via Microsoft SSO. Set ADMIN_EMAILS in .env for admin access.");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
