const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    provider: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    googleId:{
      type: String
    },
    verified: {
      type: Boolean,
    },
    verificationString: {
      type : String,
    }
});


const User = mongoose.model('User', userSchema);

module.exports = User;
