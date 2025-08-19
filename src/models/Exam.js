import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationSeconds: { type: Number, required: true, min: 60 },
    totalQuestions: { type: Number, required: true, min: 1, max: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Exam = mongoose.model("Exam", examSchema);
