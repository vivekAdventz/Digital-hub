import mongoose from "mongoose";

const entitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Entity name is required"],
      trim: true,
      unique: true,
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

const Entity = mongoose.model("Entity", entitySchema);
export default Entity;
