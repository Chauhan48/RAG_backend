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

    return res.redirect('/dashboard');
  } catch (error) {
    return res.status(500).render('signup', { errorMsg: 'Internal server error', successMsg: null });
  }
};


module.exports = userController;