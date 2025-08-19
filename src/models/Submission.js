import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedIndex: { type: Number, required: true },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    questionIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    ],
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, default: null },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["started", "submitted", "expired"],
      default: "started",
      index: true,
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
