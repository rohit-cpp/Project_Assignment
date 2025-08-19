import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Exam } from "../models/Exam.js";
import { Question } from "../models/Question.js";

async function seed() {
  await connectDB();

  console.log("Clearing old data...");
  await Exam.deleteMany({});
  await Question.deleteMany({});

  console.log("Creating exam template...");
  const exam = await Exam.create({
    title: "General MCQ",
    durationSeconds: 1800,
    totalQuestions: 20,
    isActive: true,
  });

  console.log("Creating questions...");
  const sampleQuestions = [];
  for (let i = 1; i <= 50; i++) {
    const options = [
      `Option A ${i}`,
      `Option B ${i}`,
      `Option C ${i}`,
      `Option D ${i}`,
    ];
    const correctIndex = Math.floor(Math.random() * options.length);
    sampleQuestions.push({
      text: `Sample question #${i}: What is the correct option?`,
      options,
      correctIndex,
      difficulty: i % 3 === 0 ? "hard" : i % 2 === 0 ? "medium" : "easy",
      isActive: true,
    });
  }

  await Question.insertMany(sampleQuestions);

  console.log("Seed complete.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
