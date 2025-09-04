const express = require('express');
const userRoutes = express.Router();
const userController = require('../controller/userController');

userRoutes.get('', (_, res) => { 
  res.render('signup', { errorMsg: null, successMsg: null });
});
userRoutes.post('/signup', userController.signup);

userRoutes.get('/login', (_, res) => {
    res.render('login', { errorMsg: null, successMsg: null })
})
userRoutes.post('/login', userController.login);

userRoutes.get('/dashboard', (_, res) => {
  res.render('dashboard');
});


module.exports = userRoutes;