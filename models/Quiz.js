import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of correct option
  explanation: { type: String }
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    
    // Updated question structure for multiple choice
    questions: [questionSchema],
    
    // Legacy fields for backward compatibility
    answers: [{ type: String }],
    
    // Points and grading
    points: { type: Number, default: 10 },
    passingScore: { type: Number, default: 60 }, // Percentage needed to pass
    
    // School-specific fields
    schoolId: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Time management
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    duration: { type: Number }, // Time limit in minutes
    isActive: { type: Boolean, default: true },
    
    // Visibility and participation
    targetStudents: { type: String, enum: ["all", "grade-specific"], default: "all" },
    targetGrades: [{ type: String }],
    
    // Participation tracking
    totalParticipants: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    submissions: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      answers: [{ type: Number }], // Array of selected option indices
      score: { type: Number },
      percentage: { type: Number },
      timeTaken: { type: Number }, // Minutes taken to complete
      submittedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;