import mongoose from "mongoose";
import Challenge from "../models/Challenge.js";
import Quiz from "../models/Quiz.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

// Badge awarding system
const checkAndAwardBadges = async (user) => {
  const badges = [];
  
  // Points-based badges
  if (user.ecoPoints >= 100 && !user.badges.some(b => b.id === 'first-steps')) {
    badges.push({
      id: 'first-steps',
      name: 'First Steps',
      description: 'Earned your first 100 eco-points',
      icon: '🌱'
    });
  }
  
  if (user.ecoPoints >= 500 && !user.badges.some(b => b.id === 'eco-warrior')) {
    badges.push({
      id: 'eco-warrior',
      name: 'Eco Warrior',
      description: 'Reached 500 eco-points',
      icon: '🛡️'
    });
  }
  
  if (user.ecoPoints >= 1000 && !user.badges.some(b => b.id === 'green-champion')) {
    badges.push({
      id: 'green-champion',
      name: 'Green Champion',
      description: 'Achieved 1000 eco-points',
      icon: '🏆'
    });
  }
  
  if (user.ecoPoints >= 2500 && !user.badges.some(b => b.id === 'environmental-leader')) {
    badges.push({
      id: 'environmental-leader',
      name: 'Environmental Leader',
      description: 'Reached 2500 eco-points milestone',
      icon: '👑'
    });
  }
  
  // Challenge-based badges
  if (user.challengesCompleted >= 5 && !user.badges.some(b => b.id === 'challenge-starter')) {
    badges.push({
      id: 'challenge-starter',
      name: 'Challenge Starter',
      description: 'Completed 5 challenges',
      icon: '🎯'
    });
  }
  
  if (user.challengesCompleted >= 10 && !user.badges.some(b => b.id === 'challenge-master')) {
    badges.push({
      id: 'challenge-master',
      name: 'Challenge Master',
      description: 'Completed 10 challenges',
      icon: '🏅'
    });
  }
  
  // Quiz-based badges
  if (user.quizzesTaken >= 5 && !user.badges.some(b => b.id === 'knowledge-seeker')) {
    badges.push({
      id: 'knowledge-seeker',
      name: 'Knowledge Seeker',
      description: 'Completed 5 quizzes',
      icon: '📚'
    });
  }
  
  if (user.quizzesTaken >= 10 && !user.badges.some(b => b.id === 'quiz-master')) {
    badges.push({
      id: 'quiz-master',
      name: 'Quiz Master',
      description: 'Completed 10 quizzes',
      icon: '🧠'
    });
  }
  
  // Add new badges to user
  if (badges.length > 0) {
    user.badges.push(...badges);
  }
  
  return badges;
};

export const completeChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const studentId = req.user.id;
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) return res.status(404).json({ msg: "Challenge not found" });

    // Check if challenge is active and not expired
    if (!challenge.isActive) {
      return res.status(400).json({ msg: "Challenge is no longer active" });
    }
    
    if (challenge.endDate && new Date() > challenge.endDate) {
      return res.status(400).json({ msg: "Challenge has expired" });
    }

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if student belongs to the school that created this challenge
    if (user.studentId !== challenge.schoolId) {
      return res.status(403).json({ msg: "You cannot participate in this challenge" });
    }

    // Check if student already completed this challenge
    const existingParticipation = challenge.participants.find(p => p.studentId.toString() === studentId);
    if (existingParticipation && existingParticipation.status === 'completed') {
      return res.status(400).json({ msg: "You have already completed this challenge" });
    }

    // Award points to the user
    user.ecoPoints += challenge.points || 0;
    user.challengesCompleted += 1;
    
    // Check for badge eligibility
    const newBadges = await checkAndAwardBadges(user);
    await user.save();

    // Update challenge participation
    if (existingParticipation) {
      // Update existing participation
      existingParticipation.status = 'completed';
      existingParticipation.completedAt = new Date();
      existingParticipation.pointsEarned = challenge.points || 0;
    } else {
      // Add new participation
      challenge.participants.push({
        studentId: studentId,
        status: 'completed',
        enrolledAt: new Date(),
        completedAt: new Date(),
        pointsEarned: challenge.points || 0
      });
    }

    // Update challenge statistics
    challenge.completedCount = challenge.participants.filter(p => p.status === 'completed').length;
    await challenge.save();

    // Log the activity
    const activityLog = new ActivityLog({
      userId: user._id,
      activityType: 'challenge',
      activityId: challenge._id,
      title: challenge.title,
      description: challenge.description,
      pointsEarned: challenge.points || 0,
      metadata: {
        difficulty: challenge.difficulty,
        category: challenge.category,
        schoolId: challenge.schoolId
      }
    });
    await activityLog.save();

    // Log any new badges earned
    for (const badge of newBadges) {
      const badgeLog = new ActivityLog({
        userId: user._id,
        activityType: 'badge',
        activityId: new mongoose.Types.ObjectId(),
        title: `Badge Earned: ${badge.name}`,
        description: badge.description,
        pointsEarned: 0,
        metadata: {
          badgeId: badge.id,
          badgeName: badge.name
        }
      });
      await badgeLog.save();
    }

    res.json({ 
      msg: "Challenge completed successfully!", 
      challenge: {
        id: challenge._id,
        title: challenge.title,
        points: challenge.points
      },
      pointsEarned: challenge.points || 0,
      totalPoints: user.ecoPoints,
      challengesCompleted: user.challengesCompleted,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const studentId = req.user.id;
    const { answers, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ msg: "Quiz not found" });

    // Check if quiz is active and not expired
    if (!quiz.isActive) {
      return res.status(400).json({ msg: "Quiz is no longer active" });
    }
    
    if (quiz.endDate && new Date() > quiz.endDate) {
      return res.status(400).json({ msg: "Quiz has expired" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ msg: "Valid answers array is required" });
    }

    const user = await User.findById(studentId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Check if student belongs to the school that created this quiz
    if (user.studentId !== quiz.schoolId) {
      return res.status(403).json({ msg: "You cannot participate in this quiz" });
    }

    // Check if student already submitted this quiz
    const existingSubmission = quiz.submissions.find(s => s.studentId.toString() === studentId);
    if (existingSubmission) {
      return res.status(400).json({ msg: "You have already submitted this quiz" });
    }

    // Calculate score based on correct answers (new question format)
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;
    
    quiz.questions.forEach((question, i) => {
      if (i < answers.length && answers[i] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    // Calculate points and percentage
    const pointsPerQuestion = quiz.points / totalQuestions;
    const pointsEarned = Math.round(correctAnswers * pointsPerQuestion);
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    // Award points to the user
    user.ecoPoints += pointsEarned;
    user.quizzesTaken += 1;
    
    // Check for badge eligibility
    const newBadges = await checkAndAwardBadges(user);
    await user.save();

    // Add submission to quiz
    quiz.submissions.push({
      studentId: studentId,
      answers: answers,
      score: pointsEarned,
      percentage: percentage,
      timeTaken: timeTaken || 0,
      submittedAt: new Date()
    });

    // Update quiz statistics
    quiz.completedCount = quiz.submissions.length;
    if (quiz.submissions.length > 0) {
      quiz.averageScore = Math.round(
        quiz.submissions.reduce((sum, s) => sum + s.score, 0) / quiz.submissions.length
      );
    }
    await quiz.save();

    // Log the activity
    const activityLog = new ActivityLog({
      userId: user._id,
      activityType: 'quiz',
      activityId: quiz._id,
      title: quiz.title,
      description: `Quiz completed with ${percentage}% score`,
      pointsEarned: pointsEarned,
      metadata: {
        score: pointsEarned,
        percentage: percentage,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        schoolId: quiz.schoolId,
        timeTaken: timeTaken || 0
      }
    });
    await activityLog.save();

    // Log any new badges earned
    for (const badge of newBadges) {
      const badgeLog = new ActivityLog({
        userId: user._id,
        activityType: 'badge',
        activityId: new mongoose.Types.ObjectId(),
        title: `Badge Earned: ${badge.name}`,
        description: badge.description,
        pointsEarned: 0,
        metadata: {
          badgeId: badge.id,
          badgeName: badge.name
        }
      });
      await badgeLog.save();
    }

    res.json({ 
      msg: "Quiz submitted successfully!", 
      quiz: {
        id: quiz._id,
        title: quiz.title,
        totalQuestions: totalQuestions
      },
      results: {
        score: pointsEarned,
        totalQuestions,
        correctAnswers,
        percentage,
        passed: percentage >= quiz.passingScore,
        timeTaken: timeTaken || 0
      },
      pointsEarned,
      totalPoints: user.ecoPoints,
      quizzesTaken: user.quizzesTaken,
      newBadges: newBadges.length > 0 ? newBadges : undefined
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get leaderboard data
export const getLeaderboard = async (req, res) => {
  try {
    const { type = 'global', limit = 10 } = req.query; // type: 'global' or 'school'
    
    // Get current student's info to determine their school
    const currentStudent = await User.findById(req.user.id);
    if (!currentStudent) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Build query based on leaderboard type
    let query = { role: 'student' };
    if (type === 'school' && currentStudent.studentId) {
      // Show only students from the same school
      query.studentId = currentStudent.studentId;
    }

    // Get top students by ecoPoints
    const students = await User.find(query)
      .select('_id name ecoPoints challengesCompleted quizzesTaken badges')
      .sort({ ecoPoints: -1, challengesCompleted: -1 }) // Sort by points, then by challenges
      .limit(parseInt(limit));

    // Add rank to each student
    const leaderboard = students.map((student, index) => ({
      userId: student._id,
      name: student.name,
      ecoPoints: student.ecoPoints,
      challengesCompleted: student.challengesCompleted,
      quizzesTaken: student.quizzesTaken,
      badges: student.badges.length,
      rank: index + 1
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get student's current rank
export const getStudentRank = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { type = 'global' } = req.query; // type: 'global' or 'school'

    // Get current student's info
    const currentStudent = await User.findById(studentId);
    if (!currentStudent) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Build query based on rank type
    let query = { role: 'student' };
    if (type === 'school' && currentStudent.studentId) {
      // Rank within the same school
      query.studentId = currentStudent.studentId;
    }

    // Count how many students have more points than current student
    const higherRankedCount = await User.countDocuments({
      ...query,
      $or: [
        { ecoPoints: { $gt: currentStudent.ecoPoints } },
        { 
          ecoPoints: currentStudent.ecoPoints,
          challengesCompleted: { $gt: currentStudent.challengesCompleted }
        }
      ]
    });

    const rank = higherRankedCount + 1;
    const totalStudents = await User.countDocuments(query);

    res.json({
      rank,
      totalStudents,
      ecoPoints: currentStudent.ecoPoints,
      challengesCompleted: currentStudent.challengesCompleted,
      quizzesTaken: currentStudent.quizzesTaken,
      leaderboardType: type
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get student profile with real statistics
export const getStudentProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id)
      .select('-passwordHash'); // Exclude password
    
    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Get rank information
    let query = { role: 'student' };
    if (student.studentId) {
      query.studentId = student.studentId; // School-based ranking
    }

    const higherRankedCount = await User.countDocuments({
      ...query,
      $or: [
        { ecoPoints: { $gt: student.ecoPoints } },
        { 
          ecoPoints: student.ecoPoints,
          challengesCompleted: { $gt: student.challengesCompleted }
        }
      ]
    });

    const rank = higherRankedCount + 1;
    const totalStudents = await User.countDocuments(query);

    res.json({
      profile: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        ecoPoints: student.ecoPoints,
        badges: student.badges,
        challengesCompleted: student.challengesCompleted,
        quizzesTaken: student.quizzesTaken,
        studentId: student.studentId,
        studentIdNumber: student.studentIdNumber,
        grade: student.grade,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      },
      ranking: {
        rank,
        totalStudents,
        percentile: Math.round(((totalStudents - rank) / totalStudents) * 100)
      }
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get challenges available to student (from their school)
export const getStudentChallenges = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);
    
    if (!student || !student.studentId) {
      return res.status(400).json({ msg: "Student not properly enrolled in a school" });
    }

    // Get active challenges for this student's school
    let query = {
      schoolId: student.studentId,
      isActive: true,
      $or: [
        { endDate: null }, // No end date
        { endDate: { $gt: new Date() } } // Not expired
      ]
    };

    // Filter by grade if challenge is grade-specific
    const challenges = await Challenge.find(query);
    const availableChallenges = challenges.filter(challenge => {
      if (challenge.targetStudents === 'grade-specific') {
        return challenge.targetGrades.includes(student.grade);
      }
      return true; // Available to all students
    });

    // Add participation status for each challenge
    const challengesWithStatus = availableChallenges.map(challenge => {
      const participation = challenge.participants.find(p => p.studentId.toString() === studentId);
      return {
        ...challenge.toObject(),
        userStatus: participation ? participation.status : 'available',
        userEnrolledAt: participation?.enrolledAt,
        userCompletedAt: participation?.completedAt,
        userPointsEarned: participation?.pointsEarned || 0,
        isExpired: challenge.endDate && new Date() > challenge.endDate,
        daysLeft: challenge.endDate ? Math.ceil((challenge.endDate - new Date()) / (1000 * 60 * 60 * 24)) : null
      };
    });

    res.json({
      challenges: challengesWithStatus,
      totalCount: challengesWithStatus.length
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get quizzes available to student (from their school)
export const getStudentQuizzes = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);
    
    if (!student || !student.studentId) {
      return res.status(400).json({ msg: "Student not properly enrolled in a school" });
    }

    // Get active quizzes for this student's school
    let query = {
      schoolId: student.studentId,
      isActive: true,
      $or: [
        { endDate: null }, // No end date
        { endDate: { $gt: new Date() } } // Not expired
      ]
    };

    const quizzes = await Quiz.find(query).select('-questions.correctAnswer'); // Hide correct answers

    // Filter by grade if quiz is grade-specific
    const availableQuizzes = quizzes.filter(quiz => {
      if (quiz.targetStudents === 'grade-specific') {
        return quiz.targetGrades.includes(student.grade);
      }
      return true;
    });

    // Add submission status for each quiz
    const quizzesWithStatus = availableQuizzes.map(quiz => {
      const submission = quiz.submissions.find(s => s.studentId.toString() === studentId);
      return {
        ...quiz.toObject(),
        questionsCount: quiz.questions.length,
        hasSubmitted: !!submission,
        userScore: submission?.score || 0,
        userPercentage: submission?.percentage || 0,
        userSubmittedAt: submission?.submittedAt,
        isExpired: quiz.endDate && new Date() > quiz.endDate,
        daysLeft: quiz.endDate ? Math.ceil((quiz.endDate - new Date()) / (1000 * 60 * 60 * 24)) : null,
        // Remove submissions array for privacy
        submissions: undefined
      };
    });

    res.json({
      quizzes: quizzesWithStatus,
      totalCount: quizzesWithStatus.length
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get student's recent activity history
export const getStudentActivity = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const studentId = req.user.id;

    // Get real logged activities for this user
    const activities = await ActivityLog.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('activityType title description pointsEarned metadata createdAt');

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      type: activity.activityType,
      title: activity.title,
      points: activity.pointsEarned,
      date: activity.createdAt,
      status: 'completed',
      // Add metadata based on activity type
      ...(activity.activityType === 'challenge' && {
        category: activity.metadata?.category,
        difficulty: activity.metadata?.difficulty
      }),
      ...(activity.activityType === 'quiz' && {
        score: activity.metadata?.percentage,
        correctAnswers: activity.metadata?.correctAnswers,
        totalQuestions: activity.metadata?.totalQuestions
      }),
      ...(activity.activityType === 'badge' && {
        badgeId: activity.metadata?.badgeId,
        badgeName: activity.metadata?.badgeName
      })
    }));

    res.json({
      activities: formattedActivities,
      totalCount: formattedActivities.length
    });

  } catch (err) {
    console.error('Error fetching activity history:', err);
    res.status(500).json({ msg: err.message });
  }
};