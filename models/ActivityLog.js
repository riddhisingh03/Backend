import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  activityType: { 
    type: String, 
    enum: ['challenge', 'quiz', 'badge'], 
    required: true 
  },
  activityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  pointsEarned: { 
    type: Number, 
    default: 0 
  },
  metadata: {
    // For challenges: difficulty, category
    // For quizzes: score, percentage, totalQuestions, correctAnswers
    // For badges: badgeId, badgeName
    difficulty: String,
    category: String,
    score: Number,
    percentage: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    badgeId: String,
    badgeName: String
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ userId: 1, activityType: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
