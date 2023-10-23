const catchAsync = require('../utilities/catch-async');
const {throwError, sendResponse } = require("../utilities/responses")
const Question = require('../models/question');
const User = require("../models/user");
const Progress = require("../models/progress");
const Quiz = require("../models/quiz");
const mongoose = require("mongoose");


const generateQuestionsBasedOnLevel = async (language, level) => {
    try{
        const total_questions = 10;
        const base_level = parseInt(level);
        console.log("base level : ",base_level);
        const sub_level = (level%1)*2; //specifies the fraction of questions that needs to be of level (base+1)
        console.log("sub level : ",sub_level);
        const num_questions_next_level = parseInt(sub_level*total_questions);
        console.log("num_questions_next_level : ",num_questions_next_level);
        const num_questions_base_level = total_questions - num_questions_next_level;
        let randomQuestions = await Question.aggregate([
            {
                $match: {
                    language,
                    marks:base_level,
                },
            },
            {
                $sample: { size: num_questions_base_level }, 
            },
        ]);
        if(num_questions_next_level>0){
            const randomQuestions1 = await Question.aggregate([
                {
                    $match: {
                        language,
                        marks:base_level+1,
                    },
                },
                {
                    $sample: { size: num_questions_next_level }, 
                },
            ]);
            randomQuestions = randomQuestions.concat(randomQuestions1);
        }
        // Remove answer from each document in the randomQuestions array
        const filteredQuestions = randomQuestions.map(question => {
            const filteredQuestion = { ...question };
            delete filteredQuestion.__v;
            delete filteredQuestion.answer;
            return filteredQuestion;
        });
        return filteredQuestions;
    }catch (err){
        console.error(err," : Quiz questions generation failed");
    }
};


exports.getQuizQuestions = catchAsync(async(req,res)=>{
    const language = req.body.language.trim().toLowerCase();
    // returning if any active quiz session is present
    const quiz = await Quiz.findOne({"user_id" : req.auth.user.id,language})
    .populate({
        path: 'questions_list.question_id',
        model: 'Question',
        select: '-__v -answer',
    })
    .exec();
    if(quiz){
        sendResponse(res,{questions:quiz.questions_list});
        return;
    }
    const progress = await Progress.findOne({user_id:req.auth.user.id,language});
    if(!progress){
        throwError("Enroll this language before taking the test","UNAUTHORIZED",401);
        return;
    }
    const level = progress.level;
    const questions_generated = await generateQuestionsBasedOnLevel(language,level);
    const questions_list = questions_generated.map(question => ( 
            {
                question_id: question._id, 
                option_choosed: -1
            }
    ));
    const questions_list_complete = questions_generated.map(question => ( 
            {
                question_id:question, 
                option_choosed: -1
            }
    ));
    
    const newQuiz = new Quiz({
        user_id:req.auth.user.id,
        language,
        questions_list
    })
    await newQuiz.save();
    sendResponse(res,{questions: questions_list_complete});
});

exports.saveAnswer = catchAsync(async(req,res)=>{
    console.log(req.body);
    const user_id = req.auth.user.id;
    const language = req.body.language.trim().toLowerCase();
    const question_id = new mongoose.Types.ObjectId(req.body.question_id.trim());
    const option_choosed = parseInt(req.body.option_choosed);
    const filter = { user_id, language, 'questions_list.question_id': question_id };
    const update = {
        'questions_list.$.option_choosed': option_choosed
    }
    const updatedQuiz = await Quiz.findOneAndUpdate(filter, update, { new: true });
    if (!updatedQuiz) {
        throwError('Quiz not found or question not present.',"INTERNAL_SERVER_ERROR",500);
        return;
    }
    sendResponse(res,{});
});

exports.quitQuiz = catchAsync(async(req,res)=>{
    const user_id = req.auth.user.id;
    const language = req.body.language.trim().toLowerCase();
    await Quiz.deleteOne({user_id,language});
    sendResponse(res,{});
});

const newLevel = (oldLevel,percentage) => {
    if(percentage < 70 ) return oldLevel;
    return ((oldLevel+0.1)%1==0.5)?(parseInt(oldLevel)+1):oldLevel+0.1;
}

exports.submitQuiz = catchAsync(async(req,res)=>{
    const user_id = req.auth.user.id;
    const language = req.body.language.trim().toLowerCase();
    const quiz = await Quiz.findOne({user_id,language})
    .populate({
        path: 'questions_list.question_id',
        model: 'Question',
        select: '-__v',
    })
    .exec();
    if(!quiz){
        throwError("Quiz doesn't exist","UNAUTHORIZED",401);
        return;
    }
    const scores = quiz.questions_list.map((question) => (
        (question.question_id.answer == question.option_choosed+1)?question.question_id.marks:0
    ));
    const actual_answers = quiz.questions_list.map((question) => (
        question.question_id.answer-1
    ));
    const user_answers = quiz.questions_list.map((question) => (
        question.option_choosed
    ));
    const total_score = scores.reduce((acc, number) => acc + number, 0);
    const max_total = quiz.questions_list.reduce((acc, obj) => acc + obj.question_id.marks, 0);
    const percentage = (total_score/max_total)*100;
    const progress = await Progress.findOne({user_id,language});
    const filter = { user_id, language };
    const update = {
      $push: {
        excercise_history: { level: newLevel(progress.level,percentage), score:percentage },
      },
      $set: {
        level: newLevel(progress.level,percentage),
      }
    };
    const result = await Progress.updateOne(filter, update);
    console.log(result);
    await Quiz.deleteOne({user_id,language});
    sendResponse(res,{scores,total_score,percentage,actual_answers,user_answers});
})