import mongoose from 'mongoose';
import User from './models/User.js';
import Challenge from './models/Challenge.js';
import Quiz from './models/Quiz.js';
import ActivityLog from './models/ActivityLog.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createTestActivityData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    // Clean up existing test data
    await User.deleteMany({ email: { $regex: /^.*@activitytest\.com$/ } });
    await Challenge.deleteMany({ title: { $regex: /^Activity Test/ } });
    await Quiz.deleteMany({ title: { $regex: /^Activity Test/ } });
    await ActivityLog.deleteMany({});
    
    console.log('🧹 Cleaned up existing test data\n');
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const user = new User({
      name: 'Activity Test Student',
      email: 'student@activitytest.com',
      passwordHash,
      role: 'student',
      ecoPoints: 0,
      challengesCompleted: 0,
      quizzesTaken: 0,
      badges: [],
      studentId: 'SCHOOL001',
      studentIdNumber: 'ST2025001',
      grade: '10th'
    });
    
    await user.save();
    console.log('👤 Created test user');
    
    // Create test challenges
    const challenges = [
      {
        title: 'Activity Test - Water Conservation Challenge',
        description: 'Save water at home for a week',
        points: 150,
        difficulty: 'medium',
        category: 'Water',
        status: 'completed'
      },
      {
        title: 'Activity Test - Plastic-Free Day',
        description: 'Go plastic-free for one day',
        points: 100,
        difficulty: 'easy',
        category: 'Waste',
        status: 'completed'
      },
      {
        title: 'Activity Test - Energy Audit',
        description: 'Conduct home energy audit',
        points: 200,
        difficulty: 'hard',
        category: 'Energy',
        status: 'completed'
      }
    ];
    
    const savedChallenges = await Challenge.insertMany(challenges);
    console.log('🎯 Created test challenges');
    
    // Create test quizzes
    const quizzes = [
      {
        title: 'Activity Test - Climate Change Basics',
        questions: ['What causes climate change?', 'Effects of global warming?', 'Solutions for climate change?'],
        answers: ['Greenhouse gases', 'Rising temperatures', 'Renewable energy'],
        points: 120
      },
      {
        title: 'Activity Test - Water Conservation Quiz',
        questions: ['Why save water?', 'How to conserve water?'],
        answers: ['It is precious', 'Turn off taps'],
        points: 100
      }
    ];
    
    const savedQuizzes = await Quiz.insertMany(quizzes);
    console.log('🧠 Created test quizzes');
    
    // Create realistic activity logs with different dates
    const now = new Date();
    const activities = [];
    
    // Log challenge completions over the past 10 days
    for (let i = 0; i < savedChallenges.length; i++) {
      const challenge = savedChallenges[i];
      const activityDate = new Date(now.getTime() - (i + 1) * 2 * 24 * 60 * 60 * 1000);
      
      // Update user points
      user.ecoPoints += challenge.points;
      user.challengesCompleted += 1;
      
      // Check for badges
      if (user.ecoPoints >= 100 && !user.badges.some(b => b.id === 'first-steps')) {
        user.badges.push({
          id: 'first-steps',
          name: 'First Steps',
          description: 'Earned your first 100 eco-points',
          icon: '🌱'
        });
        
        // Log badge activity
        activities.push({
          userId: user._id,
          activityType: 'badge',
          activityId: new mongoose.Types.ObjectId(),
          title: 'Badge Earned: First Steps',
          description: 'Earned your first 100 eco-points',
          pointsEarned: 0,
          metadata: {
            badgeId: 'first-steps',
            badgeName: 'First Steps'
          },
          createdAt: activityDate
        });
      }
      
      // Log challenge activity
      activities.push({
        userId: user._id,
        activityType: 'challenge',
        activityId: challenge._id,
        title: challenge.title,
        description: challenge.description,
        pointsEarned: challenge.points,
        metadata: {
          difficulty: challenge.difficulty,
          category: challenge.category
        },
        createdAt: activityDate
      });
    }
    
    // Log quiz completions
    for (let i = 0; i < savedQuizzes.length; i++) {
      const quiz = savedQuizzes[i];
      const activityDate = new Date(now.getTime() - (i + 2) * 1.5 * 24 * 60 * 60 * 1000);
      const percentage = 75 + Math.floor(Math.random() * 25); // 75-100% score
      const pointsEarned = Math.floor((quiz.points * percentage) / 100);
      
      user.ecoPoints += pointsEarned;
      user.quizzesTaken += 1;
      
      // Log quiz activity
      activities.push({
        userId: user._id,
        activityType: 'quiz',
        activityId: quiz._id,
        title: quiz.title,
        description: `Quiz completed with ${percentage}% score`,
        pointsEarned: pointsEarned,
        metadata: {
          score: pointsEarned,
          percentage: percentage,
          totalQuestions: quiz.questions.length,
          correctAnswers: Math.floor((quiz.questions.length * percentage) / 100)
        },
        createdAt: activityDate
      });
    }
    
    // Save all activities
    await ActivityLog.insertMany(activities);
    await user.save();
    
    console.log('\n=== ACTIVITY LOG CREATED ===');
    console.log(`📊 Total Activities Logged: ${activities.length}`);
    console.log(`🏆 User Final Points: ${user.ecoPoints}`);
    console.log(`🎯 Challenges Completed: ${user.challengesCompleted}`);
    console.log(`🧠 Quizzes Taken: ${user.quizzesTaken}`);
    console.log(`🏅 Badges Earned: ${user.badges.length}`);
    
    // Display recent activities
    const recentActivities = await ActivityLog.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('\n📝 Recent Activities:');
    recentActivities.forEach((activity, index) => {
      const date = activity.createdAt.toLocaleDateString();
      const icon = activity.activityType === 'challenge' ? '🎯' : 
                   activity.activityType === 'quiz' ? '🧠' : '🏅';
      console.log(`${index + 1}. ${icon} ${activity.title} (+${activity.pointsEarned} pts) - ${date}`);
    });
    
    console.log('\n✅ Test activity data created successfully!');
    console.log(`👤 Test User: ${user.email} / password123`);
    console.log(`🔗 User ID: ${user._id}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating test activity data:', error);
    mongoose.disconnect();
  }
};

createTestActivityData();
