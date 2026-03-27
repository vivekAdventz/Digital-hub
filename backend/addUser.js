import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const addUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "amit.rungta@adventz.com";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`User already exists: ${email} (role: ${existing.role})`);
      process.exit(0);
    }

    const user = await User.create({
      name: "Amit Rungta",
      email,
      password: "Welcome@123",
      role: "employee",
      department: "Management",
      designation: "Director",
    });

    console.log(`User created successfully:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: Welcome@123`);
    console.log(`  Role: ${user.role}`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

addUser();
