import Challenge from "../models/Challenge.js";
import Quiz from "../models/Quiz.js";

export const completeChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ msg: "Challenge not found" });

    challenge.status = "completed";
    await challenge.save();

    res.json({ msg: "Challenge completed", challenge });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: "Quiz not found" });

    const { answers } = req.body;
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === quiz.answers[i]) score += quiz.points;
    });

    res.json({ msg: "Quiz submitted", score });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};