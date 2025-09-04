const express = require('express');
const userRoutes = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

// signup routes
userRoutes.get('', (_, res) => { 
  res.render('signup', { errorMsg: null, successMsg: null });
});
userRoutes.post('/signup', userController.signup);

// login routes
userRoutes.get('/login', (_, res) => {
    res.render('login', { errorMsg: null, successMsg: null })
})
userRoutes.post('/login', userController.login);

// dashboard route
userRoutes.get('/dashboard', authMiddleware, (_, res) => {
  res.render('dashboard');
});

// get progress data for a user
userRoutes.get('/:userId', userController.getProgress);

userRoutes.post('/:userId', userController.updateProgress);

module.exports = userRoutes;