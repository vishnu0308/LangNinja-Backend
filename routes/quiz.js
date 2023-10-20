const express = require('express');
const { isAuth } = require("../middlewares");
const {quizController} = require('../controllers')

const router = express.Router();

router.post('/get-quiz-questions', isAuth, quizController.getQuizQuestions );

router.post('/save-answer', isAuth, quizController.saveAnswer );

router.post('/quit-quiz', isAuth, quizController.quitQuiz );

router.post('/submit-quiz', isAuth, quizController.submitQuiz );

module.exports = router;