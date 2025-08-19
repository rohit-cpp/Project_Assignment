import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

// Must be 24 characters.
// Must only use 0-9 and a-f (letters can be lowercase or uppercase).

export const startExamSchema = {
  body: z.object({
    examId: objectId,
  }),
};

export const submitExamSchema = {
  body: z.object({
    submissionId: objectId,
    answers: z
      .array(
        z.object({
          questionId: objectId,
          selectedIndex: z.number().int().min(0),
        })
      )
      .default([]),
  }),
};

export const submissionIdParamSchema = {
  params: z.object({
    id: objectId,
  }),
};
