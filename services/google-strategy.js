require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
     async (accessToken, refreshToken, profile, done) => 
      {
        try{
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = new User({
              provider: "google",
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              verified: true,
            });
            await user.save();
          }
          return done(null, { user });
        }catch{
          console.error("Error during Google OAuth:", error);
          return done(error); 
        }
      }
  )
);

module.exports = passport;