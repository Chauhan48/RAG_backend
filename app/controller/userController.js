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

    await dbServices.insert(userModel, userData);

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

    return res.redirect('/user/dashboard')
  } catch (err) {
    return res.status(401).render('login', { errorMsg: err.message, successMsg: null });
  }

}

userController.getDashboard = async (req, res) => {
  try {
    const progress = await progressModel.findOne({ userId: req.user._id });
    if (!progress) {
      res.render('dashboard', {
        level: progress ? progress.level : 'Beginner',
        weakAreas: progress && Array.isArray(progress.weakAreas) ? progress.weakAreas : [],
        scoreHistory: progress ? progress.scoreHistory : []
      });

    }

    res.render('dashboard', {
      level: progress ? progress.level : 'Beginner',
      weakAreas: Array.isArray(progress?.weakAreas) ? progress.weakAreas : [],
      scoreHistory: progress ? progress.scoreHistory : []
    });

  } catch (err) {
    res.status(500).send('Server error');
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

userController.updateProgress = async (req, res) => {
  try {
    const { level, score, weakAreas } = req.body;

    const userId = common.convertToMongoDbObjectId(req.params.userId);
    const progress = await dbServices.findOne(progressModel, { userId });

    if (!progress) {
      await dbServices.insert(progressModel, { userId })
    }

    if (level) progress.level = level;

    if (score !== undefined) {
      progress.scoreHistory.push({ score, date: new Date() });
    }

    if (Array.isArray(weakAreas)) {
      progress.weakAreas = weakAreas;
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = userController;