import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Application name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    problemItSolves: {
      type: String,
      required: [true, "What problem it solves is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ name: "text", description: "text", problemItSolves: "text", category: "text" });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
