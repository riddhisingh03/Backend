import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    points: { type: Number, default: 10 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    category: { type: String },
    
    // School-specific fields
    schoolId: { type: String, required: true }, // Which school created this challenge
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // School user who created it
    
    // Time management
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // Optional time limit
    isActive: { type: Boolean, default: true },
    
    // Visibility and participation
    targetStudents: { type: String, enum: ["all", "grade-specific"], default: "all" },
    targetGrades: [{ type: String }], // If grade-specific, which grades
    
    // Participation tracking
    totalParticipants: { type: Number, default: 0 },
    completedCount: { type: Number, default: 0 },
    participants: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { type: String, enum: ["enrolled", "in-progress", "completed"], default: "enrolled" },
      enrolledAt: { type: Date, default: Date.now },
      completedAt: { type: Date },
      pointsEarned: { type: Number, default: 0 }
    }],
    
    // Legacy status field for backward compatibility
    status: { type: String, enum: ["pending", "in-progress", "completed", "active"], default: "active" }
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);
export default Challenge;