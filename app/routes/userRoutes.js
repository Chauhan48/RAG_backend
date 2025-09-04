const express = require('express');
const userRoutes = express.Router();
const userController = require('../controller/userController');

userRoutes.get('', (req, res) => { 
  res.render('signup', { errorMsg: null, successMsg: null });
});
userRoutes.post('/signup', userController.signup);

userRoutes.get('/dashboard', (req, res) => {
  res.render('dashboard');
});


module.exports = userRoutes;