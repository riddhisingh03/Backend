import User from './models/User.js';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing test users
    await User.deleteMany({ email: { $in: ['student@example.com', 'school@example.com', 'ngo@example.com'] } });
    
    // First create a school
    const school = new User({
      name: 'Green Valley High School',
      email: 'school@example.com',
      passwordHash: await bcrypt.hash('demo123', await bcrypt.genSalt(10)),
      role: 'school'
    });
    await school.save();
    console.log(`✅ Created school: ${school.email}`);

    const testUsers = [
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'demo123',
        role: 'student',
        ecoPoints: 3200,
        challengesCompleted: 18,
        quizzesTaken: 12,
        grade: '11th',
        studentId: school._id.toString(),
        studentIdNumber: 'GVH2023001', // Personal student ID
        badges: [
          { id: '1', name: 'Eco Champion', description: 'Completed 15+ challenges', icon: '�' },
          { id: '2', name: 'Quiz Master', description: 'Scored 100% on 10 quizzes', icon: '🧠' },
          { id: '3', name: 'Green Leader', description: 'Top performer in school', icon: '🌟' }
        ]
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        password: 'demo123',
        role: 'student',
        ecoPoints: 2850,
        challengesCompleted: 15,
        quizzesTaken: 10,
        grade: '10th',
        studentId: school._id.toString(),
        studentIdNumber: 'GVH2023045', // Personal student ID
        badges: [
          { id: '1', name: 'Eco Warrior', description: 'Completed 10+ challenges', icon: '🌱' },
          { id: '2', name: 'Water Guardian', description: 'Water conservation expert', icon: '💧' }
        ]
      },
      {
        name: 'Demo Student',
        email: 'student@example.com',
        password: 'demo123',
        role: 'student',
        ecoPoints: 2450,
        challengesCompleted: 12,
        quizzesTaken: 8,
        grade: '10th',
        studentId: school._id.toString(),
        studentIdNumber: 'GVH2023089', // Personal student ID
        badges: [
          { id: '1', name: 'Eco Warrior', description: 'Completed 10 challenges', icon: '🌱' },
          { id: '2', name: 'Quiz Master', description: 'Scored 100% on 5 quizzes', icon: '🧠' }
        ]
      },
      {
        name: 'Maya Patel',
        email: 'maya@example.com',
        password: 'demo123',
        role: 'student',
        ecoPoints: 2200,
        challengesCompleted: 10,
        quizzesTaken: 7,
        grade: '9th',
        studentId: school._id.toString(),
        studentIdNumber: 'GVH2024012', // Personal student ID
        badges: [
          { id: '1', name: 'Green Starter', description: 'First 5 challenges completed', icon: '🌿' }
        ]
      },
      {
        name: 'Raj Kumar',
        email: 'raj@example.com',
        password: 'demo123',
        role: 'student',
        ecoPoints: 1980,
        challengesCompleted: 8,
        quizzesTaken: 6,
        grade: '11th',
        studentId: school._id.toString(),
        studentIdNumber: 'GVH2023156', // Personal student ID
        badges: []
      },
      {
        name: 'Demo NGO',
        email: 'ngo@example.com',
        password: 'demo123',
        role: 'ngo',
        ngoId: 'ngo-1'
      }
    ];

    for (const userData of testUsers) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        passwordHash
      });
      delete user.password;
      
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }
    
    console.log('🎉 Test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
