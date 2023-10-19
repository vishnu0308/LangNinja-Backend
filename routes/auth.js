const express = require('express');
const {passportGoogle} = require('../services'); 
const { isAuth } = require("../middlewares");
const {authController} = require('../controllers')

const router = express.Router();

router.get('/google', authController.googleSigninRequest );

router.get('/google/callback',
    passportGoogle.authenticate('google', { session: false }),
    authController.redirectUriLogic
);

router.post('/signout', isAuth, authController.signOut );

router.post('/signup',authController.signUp);

router.post('/signin', authController.signIn);

router.post('/verify-mail/:id',authController.verifyMail);

router.post('/forgot-password',authController.forgotPassword);

router.post('/change-password/:id',authController.changePassword);

router.post('/change-password-with-old-password',isAuth, authController.changePasswordWithOldPassword);

module.exports = router;
