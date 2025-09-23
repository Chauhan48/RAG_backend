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
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    const hashedPassword = await common.hashPassword(userData.password);
    userData.password = hashedPassword;
    
    const user = await dbServices.insert(userModel, userData);
    const token = common.generateToken({ userId: user._id });
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });
    
    return res.status(200).json({ message: 'Signup successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

userController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await dbServices.findOne(userModel, { email });

    if (userData === null) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const comparePass = await common.comparePassword(password, userData.password);
    
    if (!comparePass) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = common.generateToken({ userId: userData._id });
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: 'Login successfully' });

  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }

}

userController.logout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('auth_token');
    
    return res.status(200).json({ message: 'Logout successfully' })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = userController;