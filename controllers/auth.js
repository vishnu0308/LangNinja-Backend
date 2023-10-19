const { passportGoogle, sessionManager } = require("../services"); 
const catchAsync = require('../utilities/catch-async');
const {throwError, sendResponse } = require("../utilities/responses")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {generateToken, verifyToken} = require("../utilities/jwt");
const randomStringGen = require("../utilities/random-string-gen");

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
      },
});


exports.googleSigninRequest = passportGoogle.authenticate('google', { scope: ['profile', 'email'] });

exports.redirectUriLogic = async (req, res) => {
    const frontendURL = process.env.REACT_APP_FRONTEND_URL;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const session = await sessionManager.createSession(
        req.user.user._id,
        ip.trim(),
        req.headers["user-agent"].trim()
    );
    // Generate a JWT token for the user
    const token = generateToken({ session: session._id.toString() });
    res.redirect(`${frontendURL}/login-success?token=${token}`);
}

exports.signOut = catchAsync( async (req, res) => {
    const userId = req.auth.user.id;
    await sessionManager.deleteSessionsByUserId(userId);
    sendResponse(res,{});
});


exports.signUp = catchAsync( async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body)

    // Check if the email already exists in the Users collection
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      throwError("User with email already exists","CONFLICT",409);
    }
    // Generate random string for verification
    const randomString = randomStringGen(32);
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user and save it
    const newUser = new User({
      provider: "email",
      name : name.trim(),
      email : email.trim().toLowerCase(),
      password: hashedPassword,
      verified: false,
      verificationString: randomString,
    });
    await newUser.save();
    // send verification email
    const newUserId = newUser._id;
    console.log("Verify email : newUserId : ",newUserId);
    console.log("Input to gen token : (adding random 32 chars)",newUser._id.toString().concat(randomString));
    const verificationToken = generateToken({"ID" : newUser._id.toString().concat(randomString)});
    const url = `${process.env.REACT_APP_FRONTEND_URL}/verifyemail?verificationtoken=${verificationToken}`
    transporter.sendMail({
      to: email.trim().toLowerCase(),
      subject: 'Verify your account at LangNinja',
      html: `Click <a href = '${url}'>here</a> to confirm your email.`
    })

    // // Create a session object
    // const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    // const session = await sessionManager.createSession(
    //   newUser._id,
    //   ip,
    //   req.headers["user-agent"]
    // );
    // // Generate a JWT token for the user
    // const token = generateToken({ session: session._id });
    sendResponse(res,{"message" : "Verification link has been sent to the registered mail id"});
});

exports.signIn = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email : email.trim().toLowerCase() });
    if (!user) {
      throwError("No such user","UNAUTHORIZED",401);
      return;
    }
    // Check if user account has been validated
    if (!user.verified){
      throwError("Email not verified","FORBIDDEN",403);
      return;
    }
    //Check if the signIn type is with oauth google
    if(user.provider != "email"){
      throwError("Please use sign in with google","CONFILCT",409);
      return;
    }
    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throwError("Password didn't match","UNAUTHORIZED",401);
      return;
    }
    // Create a session object
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const session = await sessionManager.createSession(
      user._id,
      ip,
      req.headers["user-agent"]
    );
    // Generate a JWT token for the user
    const token = generateToken({ session: session._id });
    // Send the JWT token as a response
    sendResponse(res,{token});
});

exports.verifyMail = catchAsync( async (req,res) => {
  const { id } = req.params;
  console.log("Verify Mail id : ",id);
  if(!id){
    throwError("Missing Token","UNAUTHORIZED",401);
    return;
  }
  const payload = verifyToken(id);
  if(!payload){
    throwError("Invalid Token","UNAUTHORIZED",401);
    return;
  }
  console.log("verify: payload.ID : ",payload.ID);
  console.log("payload.id.slice (rem last 32) : ",payload.ID.slice(0,-64));
  const user = await User.findOne({ _id: payload.ID.slice(0,-64) });
  if (!user) {
      throwError("User doesn't exist","NOT_FOUND",404);
      return;
  }
  if(payload.ID.slice(-64) != user.verificationString){
      throwError("Invalid Token provided","UNAUTHORIZED",401);
      return;
  }
  user.verified = true;
  await user.save();
  // Create a session object
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const session = await sessionManager.createSession(
    user._id,
    ip,
    req.headers["user-agent"]
  );
  // Generate a JWT token for the user
  const token = generateToken({ session: session._id });
  sendResponse(res,{token})
});

exports.forgotPassword = catchAsync( async(req,res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({email : email});
  if(!user){
    throwError("User with this email doesn't exist","NOT_FOUND",404);
    return;
  }
  if(user.provider != "email"){
    throwError("Please use sign in with google","CONFILCT",409);
    return;
  }
  const verificationToken = generateToken({"ID" : user._id.toString().concat(user.verificationString)});
  const url = `${process.env.REACT_APP_FRONTEND_URL}/resetuserpassword/?verificationtoken=${verificationToken}`
  transporter.sendMail({
    to: email.trim().toLowerCase(),
    subject: 'Change password',
    html: `Click <a href = '${url}'>here</a> to change your password.`
  })
  await sessionManager.deleteSessionsByUserId(user._id);
  sendResponse(res,{"message" : "Password Change link has been sent to the registered mail id"});
});

exports.changePassword = catchAsync( async (req,res) => {
  const { id } = req.params;
  if(!id){
    throwError("Missing Token","UNAUTHORIZED",401);
    return;
  }
  const payload = verifyToken(id);
  if(!payload){
    throwError("Invalid Token","UNAUTHORIZED",401);
    return;
  }
  const user = await User.findOne({ _id: payload.ID.slice(0,-64) });
  if (!user) {
      throwError("User doesn't exist","NOT_FOUND",404);
      return;
  }
  if(payload.ID.slice(-64) != user.verificationString){
      throwError("Invalid Token provided","UNAUTHORIZED",401);
      return;
  }
  const newPassword = req.body.password.trim();
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  sendResponse(res,{"message" : "Password Change Successful"});
});

exports.changePasswordWithOldPassword = catchAsync (async (req,res)=>{ 
  const user_id = req.auth.user.id;
  const oldPassword = req.body.oldPassword.trim();
  const newPassword = req.body.newPassword.trim();
  const user = await User.findOne({_id : user_id});
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordMatch) {
    throwError("Old Password didn't match","UNAUTHORIZED",401);
    return;
  }
  if (newPassword === oldPassword){
    throwError("New password can't be same as the old password","BAD_REQUEST",400);
    return;
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  await sessionManager.deleteSessionsByUserId(user_id);
  sendResponse(res,{"message" : "Password Change Successful"});
});
