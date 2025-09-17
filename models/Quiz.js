import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [{ type: String, required: true }],
    answers: [{ type: String, required: true }],
    points: { type: Number, default: 10 }
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;