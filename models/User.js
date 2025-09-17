import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student','school','ngo','admin'], default: 'student' },
  ecoPoints: { type: Number, default: 0 },
  badges: { type: [String], default: [] }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
