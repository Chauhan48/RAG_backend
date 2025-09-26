const userRoutes = require('express').Router();
const upload = require('../services/fileUploadService');
const userController = require('../controller/userController');
const authMiddleware = require('../middleware/authMiddleware');
const questionsController = require('../controller/questionsController');

userRoutes.post('/signup', userController.signup);

userRoutes.post('/login', userController.login);

userRoutes.post('/upload', authMiddleware, upload.single('testFile'), questionsController.generatePdfQuestions)

userRoutes.post('/video-url', authMiddleware, questionsController.generateVideoQuestions);

userRoutes.get('/topics', authMiddleware, questionsController.fetchTopics);

userRoutes.get('/questions', authMiddleware, questionsController.fetchQuestions);

module.exports = userRoutes;