import mongoose from "mongoose";
import { Exam } from "../models/Exam.js";
import { Question } from "../models/Question.js";
import { Submission } from "../models/Submission.js";

function sanitizeQuestion(q) {
  return { _id: q._id, text: q.text, options: q.options };
}

export async function startExam(req, res) {
  const { examId } = req.validated.body;

  const exam = await Exam.findById(examId);
  if (!exam || !exam.isActive)
    return res.status(400).json({ error: { message: "Invalid exam" } });

  const questions = await Question.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: exam.totalQuestions } },
  ]);

  if (questions.length < exam.totalQuestions) {
    return res.status(400).json({
      error: { message: "Not enough active questions to start this exam" },
    });
  }

  const submission = await Submission.create({
    userId: req.userId,
    examId: exam._id,
    questionIds: questions.map((q) => q._id),
    answers: [],
    startedAt: new Date(),
    status: "started",
  });

  res.json({
    submissionId: submission._id,
    durationSeconds: exam.durationSeconds,
    questions: questions.map(sanitizeQuestion),
  });
}

export async function submitExam(req, res) {
  const { submissionId, answers } = req.validated.body;

  const submission = await Submission.findById(submissionId);
  if (!submission)
    return res.status(404).json({ error: { message: "Submission not found" } });
  if (submission.userId.toString() !== req.userId)
    return res.status(403).json({ error: { message: "Forbidden" } });
  if (submission.status !== "started")
    return res.status(400).json({ error: { message: "Already finalized" } });

  const exam = await Exam.findById(submission.examId);
  if (!exam)
    return res.status(400).json({ error: { message: "Exam not found" } });

  const endAt = new Date(
    submission.startedAt.getTime() + exam.durationSeconds * 1000
  );
  const now = new Date();
  const expired = now > endAt;

  const questionDocs = await Question.find({
    _id: { $in: submission.questionIds },
  }).select("_id correctIndex");
  const correctMap = new Map(
    questionDocs.map((q) => [q._id.toString(), q.correctIndex])
  );

  let score = 0;
  const normalizedAnswers = [];
  for (const a of answers) {
    const qid = a.questionId;
    const sel = Number.isInteger(a.selectedIndex) ? a.selectedIndex : -1;
    const correctIdx = correctMap.get(qid);
    if (typeof correctIdx === "number" && sel === correctIdx) score++;
    normalizedAnswers.push({
      questionId: new mongoose.Types.ObjectId(qid),
      selectedIndex: sel,
    });
  }

  submission.answers = normalizedAnswers;
  submission.score = score;
  submission.submittedAt = now;
  submission.status = expired ? "expired" : "submitted";
  await submission.save();

  res.json({
    submissionId: submission._id,
    score,
    total: submission.questionIds.length,
    status: submission.status,
    timeExpired: expired,
  });
}
