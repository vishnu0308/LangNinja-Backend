const catchAsync = require('../utilities/catch-async');
const {throwError, sendResponse } = require("../utilities/responses")
const Question = require('../models/question');
const User = require("../models/user");
const Progress = require("../models/progress");
const Quiz = require("../models/quiz");
const mongoose = require("mongoose");

exports.getMyStats = catchAsync(async(req,res)=>{
    const user_id = req.auth.user.id; 
    const progresses = await Progress.find({user_id});
    if(progresses.length==0){
        sendResponse(res,[]);
        return;
    }
    const statistics = progresses.map((progress)=>(
        {
            language: progress.language,
            total_excercises : progress.excercise_history.length,
            current_level : progress.level,
            avg_score : (progress.excercise_history.reduce((acc,exc_res)=> acc + exc_res.score ,0))/progress.excercise_history.length,
            max_score : (progress.excercise_history.reduce((acc,exc_res)=> Math.max(acc, exc_res.score) ,-1)),
            min_score : (progress.excercise_history.reduce((acc,exc_res)=> Math.min(acc,exc_res.score) ,200))
        }
    ))
    sendResponse(res,statistics);
});

exports.getLeaderboard = catchAsync(async(req,res)=>{
    const language = req.body.language.trim().toLowerCase();
    const leaderboard = await Progress.aggregate([
      { $match: { language } },
      {
        $addFields: {
          average_score: {
            $avg: '$excercise_history.score',
          },
        },
      },
      { $sort: { level: -1, average_score: -1 } },
      {
        $lookup: {
          from: 'users', // Name of the users collection
          localField: 'user_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          excercise_history: 0,
          language: 0,
          __v: 0,
          'user.language': 0,
          'user.__v': 0,
          'user._id':0,
          'user.email':0,
          'user.password':0,
          'user.verified':0,
          'user.verificationString':0,
          'user.languages':0,
          'user.provider':0,
          'user_id':0
        },
      },
    ]);
    sendResponse(res,leaderboard);
})

exports.resetProgress = catchAsync(async(req,res)=>{
    const user_id = req.auth.user.id;
    const language = req.body.language.trim().toLowerCase();
    const filter = {user_id,language};
    const query = {$set : {'level':1,'excercise_history':[]}};
    const result = await Progress.updateOne(filter,query);
    console.log(result);
    await Quiz.deleteOne({user_id,language});
    sendResponse(res,{});
});