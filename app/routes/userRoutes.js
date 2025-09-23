const userRoutes = require('express').Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

userRoutes.post('/signup', userController.signup);

userRoutes.post('/login', userController.login);

module.exports = userRoutes;