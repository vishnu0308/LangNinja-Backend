const express = require('express');
const { isAuth } = require("../middlewares");
const {langController} = require('../controllers')

const router = express.Router();

router.post('/get-random-questions-csv', langController.genRandomLanguageQuestions );

router.post('/upload-questions-csv', langController.uploadQuestionsCsv );

router.post('/unlock-language', isAuth, langController.unlockLanguage );

router.post('/get-user-languages', isAuth, langController.getUserLanguages );

router.post('/get-all-languages', langController.getAllLanguages );

module.exports = router;