const Session = require('../models/session'); 
const catchAsync = require('../utilities/catch-async');
const {throwError} = require('../utilities/responses')
const expiryDate = require("../utilities/date_calculator");

exports.createSession = async (user_id, ip, userAgent) => {
  try{
    const session = new Session({
      user_id,
      ip,
      userAgent,
      expiryDate : expiryDate(5*120), 
    });
    const existingSession = await Session.findOne({user_id,ip,userAgent});
    if(existingSession){
      await Session.deleteOne({_id : existingSession._id});
    }
    await session.save();
    return session;
  }catch{
    console.error("Session creation error")
  }
};


exports.verifySession =  async (sessionId, ip, userAgent) => {
    const session = await Session.findOne({_id : sessionId});
    console.log(sessionId)
    console.log(session)
    if (!session || session.ip !== ip ) {
      throwError("Session does not exist","FORBIDDEN","403")
      return null;
    }
    return session;
  
};


exports.deleteSessionsByUserId = catchAsync( async (userId) => {
    await Session.deleteMany({ user_id: userId });
});
