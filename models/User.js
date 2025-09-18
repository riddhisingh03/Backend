import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student','school','ngo','admin'], default: 'student' },
  ecoPoints: { type: Number, default: 0 },
  badges: { type: [badgeSchema], default: [] },
  challengesCompleted: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  // Additional fields for different roles
  studentId: { type: String }, // For student role: which school they belong to
  studentIdNumber: { type: String }, // For student role: their personal student ID/roll number
  ngoId: { type: String }, // For ngo role
  grade: { type: String }, // For student role
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
