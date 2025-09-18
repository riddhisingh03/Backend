import mongoose from 'mongoose';
import User from './models/User.js';
import Challenge from './models/Challenge.js';
import Quiz from './models/Quiz.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testEcoPointSystem = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');
    
    // Clean up existing test data
    await User.deleteMany({ email: { $regex: /^test.*@ecopoint\.test$/ } });
    await Challenge.deleteMany({ title: { $regex: /^Test Challenge/ } });
    await Quiz.deleteMany({ title: { $regex: /^Test Quiz/ } });
    
    console.log('🧹 Cleaned up existing test data\n');
    
    // Create test user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const user = new User({
      name: 'Test Student EcoPoint',
      email: 'testeco@ecopoint.test',
      passwordHash,
      role: 'student',
      ecoPoints: 0,
      challengesCompleted: 0,
      quizzesTaken: 0,
      badges: []
    });
    
    await user.save();
    console.log('👤 Created test user with 0 eco-points');
    
    // Create test challenges with different point values
    const challenges = [
      {
        title: 'Test Challenge - Easy Water Conservation',
        description: 'Save water for a day',
        points: 100,
        difficulty: 'easy',
        category: 'Water',
        status: 'pending'
      },
      {
        title: 'Test Challenge - Medium Energy Audit',
        description: 'Conduct home energy audit',
        points: 200,
        difficulty: 'medium',
        category: 'Energy',
        status: 'pending'
      },
      {
        title: 'Test Challenge - Hard Plastic Free Month',
        description: 'Go plastic free for a month',
        points: 300,
        difficulty: 'hard',
        category: 'Waste',
        status: 'pending'
      }
    ];
    
    const savedChallenges = await Challenge.insertMany(challenges);
    console.log('🎯 Created test challenges:', savedChallenges.map(c => `${c.title} (${c.points} pts)`));
    
    // Create test quizzes
    const quizzes = [
      {
        title: 'Test Quiz - Water Basics',
        questions: ['Q1: What is water?', 'Q2: Why save water?', 'Q3: How to conserve?'],
        answers: ['A liquid', 'It is precious', 'Turn off taps'],
        points: 120
      },
      {
        title: 'Test Quiz - Climate Change',
        questions: ['Q1: What causes climate change?', 'Q2: Effects of global warming?'],
        answers: ['Greenhouse gases', 'Rising temperatures'],
        points: 80
      }
    ];
    
    const savedQuizzes = await Quiz.insertMany(quizzes);
    console.log('🧠 Created test quizzes:', savedQuizzes.map(q => `${q.title} (${q.points} pts)`));
    
    console.log('\n=== TESTING CHALLENGE COMPLETION ===');
    
    // Test challenge completion - simulate the controller logic
    let currentUser = await User.findById(user._id);
    console.log(`Before challenges: ${currentUser.ecoPoints} points, ${currentUser.challengesCompleted} challenges`);
    
    for (const challenge of savedChallenges) {
      // Simulate completing challenge
      challenge.status = 'completed';
      await challenge.save();
      
      currentUser.ecoPoints += challenge.points;
      currentUser.challengesCompleted += 1;
      
      // Simple badge check (mimicking the controller function)
      if (currentUser.ecoPoints >= 100 && !currentUser.badges.some(b => b.id === 'first-steps')) {
        currentUser.badges.push({
          id: 'first-steps',
          name: 'First Steps',
          description: 'Earned your first 100 eco-points',
          icon: '🌱'
        });
        console.log('🏅 Earned badge: First Steps');
      }
      
      if (currentUser.ecoPoints >= 500 && !currentUser.badges.some(b => b.id === 'eco-warrior')) {
        currentUser.badges.push({
          id: 'eco-warrior',
          name: 'Eco Warrior',
          description: 'Reached 500 eco-points',
          icon: '🛡️'
        });
        console.log('🏅 Earned badge: Eco Warrior');
      }
      
      if (currentUser.challengesCompleted >= 3 && !currentUser.badges.some(b => b.id === 'challenge-starter')) {
        currentUser.badges.push({
          id: 'challenge-starter',
          name: 'Challenge Starter',
          description: 'Completed 3 challenges',
          icon: '🎯'
        });
        console.log('🏅 Earned badge: Challenge Starter');
      }
      
      await currentUser.save();
      console.log(`✅ Completed: ${challenge.title} (+${challenge.points} pts) | Total: ${currentUser.ecoPoints} pts`);
    }
    
    console.log('\n=== TESTING QUIZ COMPLETION ===');
    
    // Test quiz completion
    for (const quiz of savedQuizzes) {
      // Simulate quiz answers (assume 80% correct)
      const correctAnswers = Math.floor(quiz.questions.length * 0.8);
      const pointsPerQuestion = quiz.points / quiz.questions.length;
      const pointsEarned = Math.round(correctAnswers * pointsPerQuestion);
      
      currentUser.ecoPoints += pointsEarned;
      currentUser.quizzesTaken += 1;
      
      // Badge check for quizzes
      if (currentUser.quizzesTaken >= 2 && !currentUser.badges.some(b => b.id === 'knowledge-seeker')) {
        currentUser.badges.push({
          id: 'knowledge-seeker',
          name: 'Knowledge Seeker',
          description: 'Completed 2 quizzes',
          icon: '📚'
        });
        console.log('🏅 Earned badge: Knowledge Seeker');
      }
      
      await currentUser.save();
      console.log(`✅ Completed: ${quiz.title} (${correctAnswers}/${quiz.questions.length} correct, +${pointsEarned} pts) | Total: ${currentUser.ecoPoints} pts`);
    }
    
    // Final results
    const finalUser = await User.findById(user._id);
    console.log('\n=== FINAL RESULTS ===');
    console.log(`👤 User: ${finalUser.name}`);
    console.log(`🏆 Total Eco-Points: ${finalUser.ecoPoints}`);
    console.log(`🎯 Challenges Completed: ${finalUser.challengesCompleted}`);
    console.log(`🧠 Quizzes Taken: ${finalUser.quizzesTaken}`);
    console.log(`🏅 Badges Earned: ${finalUser.badges.length}`);
    
    if (finalUser.badges.length > 0) {
      console.log('   Badges:');
      finalUser.badges.forEach(badge => {
        console.log(`   - ${badge.icon} ${badge.name}: ${badge.description}`);
      });
    }
    
    console.log('\n✅ Eco-Point System Test Completed Successfully!');
    
    // Cleanup
    await User.deleteMany({ email: { $regex: /^test.*@ecopoint\.test$/ } });
    await Challenge.deleteMany({ title: { $regex: /^Test Challenge/ } });
    await Quiz.deleteMany({ title: { $regex: /^Test Quiz/ } });
    console.log('🧹 Cleaned up test data');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error testing eco-point system:', error);
    mongoose.disconnect();
  }
};

testEcoPointSystem();
