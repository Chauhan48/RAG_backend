const userRoutes = require('express').Router();
const upload = require('../services/fileUploadService');
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');

userRoutes.post('/signup', userController.signup);

userRoutes.post('/login', userController.login);

userRoutes.post('/upload', authMiddleware, upload.single('testFile'), (req, res) => {
    if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded: ${req.file.filename}`);
})

module.exports = userRoutes;