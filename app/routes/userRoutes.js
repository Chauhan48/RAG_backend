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
userRoutes.get('/dashboard', authMiddleware, userController.getDashboard);
// userRoutes.get('/dashboard', authMiddleware, (_, res) => {
//   res.render('dashboard');
// });

// handle test submission and progress update
userRoutes.post('/progress', authMiddleware, userController.submitTest);

// profile management routes
userRoutes.get('/profile', authMiddleware, userController.getProfile);
userRoutes.post('/profile', authMiddleware, userController.updateProfile);
userRoutes.post('/logout', authMiddleware, userController.logout);

// get progress data for a user
userRoutes.get('/:userId', authMiddleware, userController.getProgress);

userRoutes.post('/:userId', authMiddleware, userController.updateProgress);

module.exports = userRoutes;