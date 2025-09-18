import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const user = new User({
      name: 'Test Student',
      email: 'test@example.com',
      passwordHash,
      role: 'student',
      ecoPoints: 100,
      badges: []
    });
    
    await user.save();
    console.log('✅ Test user created: test@example.com / password123');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

createUser();
