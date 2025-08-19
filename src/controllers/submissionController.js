import { Submission } from "../models/Submission.js";

export async function getSubmission(req, res) {
  const { id } = req.validated.params;
  const sub = await Submission.findById(id).lean();
  if (!sub) return res.status(404).json({ error: { message: "Not found" } });
  if (sub.userId.toString() !== req.userId)
    return res.status(403).json({ error: { message: "Forbidden" } });

  res.json({
    submissionId: sub._id,
    score: sub.score,
    total: sub.questionIds.length,
    status: sub.status,
    startedAt: sub.startedAt,
    submittedAt: sub.submittedAt,
  });
}
