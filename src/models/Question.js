import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length >= 2 && v.length <= 10,
    },
    correctIndex: { type: Number, required: true, min: 0 },
    tags: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
