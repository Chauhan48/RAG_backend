const progressModel = require('../modals/progressModel');
const userModel = require('../modals/userModal');
const dbServices = require('../services/databaseService');
const common = require('../utils/common');

const userController = {};

userController.signup = async (req, res) => {
  try {
    const userData = req.body;

    // Check for existing email
    const existingUsers = await dbServices.find(userModel, { email: userData.email });
    if (existingUsers.length > 0) {
      return res.status(409).render('signup', { errorMsg: 'User with this email already exists', successMsg: null });
    }

    const hashedPassword = await common.hashPassword(userData.password);
    userData.password = hashedPassword;

    const user = await dbServices.insert(userModel, userData);
    const token = common.generateToken({ userId: user._id });
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.redirect('/user/dashboard');
  } catch (error) {
    return res.status(500).render('signup', { errorMsg: 'Internal server error', successMsg: null });
  }
};

userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await dbServices.findOne(userModel, { email });

    if (userData === null) {
      throw new Error('Invalid email or password');
    }

    const comparePass = await common.comparePassword(password, userData.password);

    if (!comparePass) {
      throw new Error('Invalid email or password');
    }
    const token = common.generateToken({ userId: userData._id });
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.redirect('/user/dashboard')
  } catch (err) {
    return res.status(401).render('login', { errorMsg: err.message, successMsg: null });
  }

}

userController.getDashboard = async (req, res) => {
  try {
    const progress = await progressModel.findOne({ userId: req.user._id });
    
    // Get query parameters for success/error messages
    const testCompleted = req.query.testCompleted === 'true';
    const score = req.query.score;
    const error = req.query.error;
    
    return res.render('dashboard', {
      user: req.user,
      level: progress ? progress.level : 'Beginner',
      weakAreas: progress && Array.isArray(progress.weakAreas) ? progress.weakAreas : [],
      scoreHistory: progress ? progress.scoreHistory : [],
      testCompleted: testCompleted,
      lastScore: score,
      error: error
    });

  } catch (err) {
    return res.status(500).send('Server error');
  }
};


userController.getProgress = async (req, res) => {
  try {
    const userId = common.convertToMongoDbObjectId(req.params.userId);
    const progress = await dbServices.findOne(progressModel, { userId });
    if (!progress) return res.status(404).json({ message: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

userController.submitTest = async (req, res) => {
  try {
    const userId = req.user._id;
    const answers = req.body;
    
    // Get the questions that were answered (we need to get them from the session or pass them)
    // For now, let's assume we can get the difficulty from the referrer or session
    const referer = req.get('Referer') || '';
    const difficultyMatch = referer.match(/\/test\/(\w+)/);
    const difficulty = difficultyMatch ? difficultyMatch[1] : 'beginner';
    
    // Get questions for this difficulty level
    const questionModel = require('../modals/questionModel');
    const questions = await questionModel.find({ difficulty: new RegExp(`^${difficulty}$`, 'i') });
    
    // Calculate score
    let correctAnswers = 0;
    let totalQuestions = questions.length;
    
    questions.forEach((question, index) => {
      const userAnswer = answers[`question_${index}`];
      if (userAnswer && parseInt(userAnswer) === question.answer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Find or create progress record
    let progress = await progressModel.findOne({ userId });
    
    if (!progress) {
      progress = new progressModel({
        userId: userId,
        level: 'Beginner',
        scoreHistory: [],
        weakAreas: []
      });
    }
    
    // Add new score to history
    progress.scoreHistory.push({
      date: new Date(),
      score: score
    });
    
    // Update level based on average score
    const avgScore = progress.scoreHistory.reduce((sum, entry) => sum + entry.score, 0) / progress.scoreHistory.length;
    if (avgScore >= 80) {
      progress.level = 'Advanced';
    } else if (avgScore >= 60) {
      progress.level = 'Intermediate';
    } else {
      progress.level = 'Beginner';
    }
    
    // Save progress
    await progress.save();
    
    // Redirect to dashboard with success message
    return res.redirect('/user/dashboard?testCompleted=true&score=' + score);
    
  } catch (err) {
    console.error('Error submitting test:', err);
    return res.status(500).redirect('/user/dashboard?error=Test submission failed');
  }
};

userController.getProfile = async (req, res) => {
  try {
    return res.render('profile', {
      user: req.user,
      successMsg: null,
      errorMsg: null
    });
  } catch (err) {
    console.error('Error getting profile:', err);
    return res.status(500).render('profile', {
      user: req.user,
      successMsg: null,
      errorMsg: 'Error loading profile'
    });
  }
};

userController.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Verify current password
    const user = await userModel.findById(userId);
    const isCurrentPasswordValid = await common.comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.render('profile', {
        user: req.user,
        successMsg: null,
        errorMsg: 'Current password is incorrect'
      });
    }

    // Validate new password if provided
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        return res.render('profile', {
          user: req.user,
          successMsg: null,
          errorMsg: 'New passwords do not match'
        });
      }
      
      if (newPassword.length < 6) {
        return res.render('profile', {
          user: req.user,
          successMsg: null,
          errorMsg: 'New password must be at least 6 characters long'
        });
      }
    }

    // Update user data
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim()
    };

    if (newPassword) {
      updateData.password = await common.hashPassword(newPassword);
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    // Get updated user data
    const updatedUser = await userModel.findById(userId);

    return res.render('profile', {
      user: updatedUser,
      successMsg: 'Profile updated successfully!',
      errorMsg: null
    });

  } catch (err) {
    console.error('Error updating profile:', err);
    return res.render('profile', {
      user: req.user,
      successMsg: null,
      errorMsg: 'Error updating profile. Please try again.'
    });
  }
};

userController.logout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('auth_token');
    
    // Redirect to login page
    return res.redirect('/user/login');
  } catch (err) {
    console.error('Error during logout:', err);
    return res.redirect('/user/login');
  }
};

userController.updateProgress = async (req, res) => {
  try {
    console.log('Dashboard route, req.user:', req.user);

    const userId = req.user._id;
    const progress = await progressModel.findOne({ userId });

    console.log('Progress:', progress);

    return res.render('dashboard', {
      level: progress ? progress.level : 'Beginner',
      weakAreas: progress ? progress.weakAreas : [],
      scoreHistory: progress ? progress.scoreHistory : []
    });

  } catch (err) {
    console.error('Error in dashboard route:', err);

    if (!res.headersSent) {
      return res.status(500).send('Internal Server Error');
    }
  }
};



module.exports = userController;