const catchAsync = require('../utilities/catch-async');
const {throwError, sendResponse } = require("../utilities/responses")
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const Question = require('../models/question');
const User = require("../models/user");
const Progress = require("../models/progress");
const path = require('path')

exports.genRandomLanguageQuestions = catchAsync( async (req,res) => {
    const language_name = req.body.language_name.trim().toLowerCase();
    const num_questions = req.body.num_questions;
    const data = [];
    const possibleMarks = [1, 2, 3, 4, 5];
    const possibleAns = [1,2,3,4];
    for(let i=0;i<num_questions;i++){
        const question = {
            'question': `${language_name} Question ${i}`,
            'marks'   : possibleMarks[Math.floor(Math.random() * possibleMarks.length)],
            'option1' : `${language_name} Question ${i} Option 1`,
            'option2' : `${language_name} Question ${i} Option 2`,
            'option3' : `${language_name} Question ${i} Option 3`,
            'option4' : `${language_name} Question ${i} Option 4`,
            'answer'  : possibleAns[Math.floor(Math.random() * possibleAns.length)],
        }
        data.push(question);
    }
    const filePath = 'sample.csv';
    const csvWriter = createCsvWriter({
        path: filePath,
        header: [
            { id: 'question', title: 'question' },
            { id: 'marks', title: 'marks' },
            { id: 'option1', title: 'option1' },
            { id: 'option2', title: 'option2' },
            { id: 'option3', title: 'option3' },
            { id: 'option4', title: 'option4' },
            { id: 'answer', title: 'answer' },
        ],
        
    });
    csvWriter
    .writeRecords(data)
    .then(() => {
      // Set response headers to indicate that it's a downloadable file
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sample.csv"');

      // Stream the CSV file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    })
    .catch((error) => {
      throwError('Error generating the CSV file.',"INTERNAL_SERVER_ERROR",500);
      return;
    });
});

exports.uploadQuestionsCsv = catchAsync(async (req,res) => {
    const file = req.files.file;
    const lang = req.body.language.trim().toLowerCase();
    console.log(req.files.file);
    if(!file){
        throwError("No file found","BAD_REQUEST",400);
        return;
    }
    await new Promise((res, rej) => {
        return file.mv(path.join(__dirname, `/uploads/${file.name}`), (err) => {
            if (err) return rej(err);
            else return res();
        })
    })

    fs.createReadStream(path.join(__dirname, `/uploads/${file.name}`))
    .pipe(csv())
    .on('data', (row) => {
        const newData = new Question({
            'language': lang,
            'question': row.question,
            'marks'   : parseInt(row.marks),
            'options' : [row.option1,row.option2,row.option3,row.option4],
            'answer'  : parseInt(row.answer)
        });
        newData.save();
    })
    .on('end', () => {
        fs.unlinkSync(path.join(__dirname, `/uploads/${file.name}`));
        sendResponse(res,{message:'CSV data uploaded to the database.'});
    });
});

exports.unlockLanguage = catchAsync(async (req,res) => {
    const language = req.body.language.trim().toLowerCase();
    console.log(req.auth.user);
    if(req.auth.user.languages.includes(language)){
        throwError("Language already added","CONFLICT",409);
        return;
    }
    const result = await User.updateOne(
        {_id: req.auth.user.id},
        {$push : {languages : language} }
    );
    if (result.nModified === 0) {
      throwError("User details not modified","INTERNAL_SERVER_ERROR",500);
      return;
    }
    const progress = new Progress({
        user_id: req.auth.user.id,
        language: language,
        level: 1,
        excercise_history:[]
    });
    await progress.save();
    sendResponse(res,{});
});

exports.getUserLanguages = catchAsync(async(req,res)=>{
    const user_id = req.auth.user.id;
    const progresses = await Progress.find({user_id});
    const response_list = progresses.map((progress)=>(
        {
            language: progress.language,
            level : progress.level
        }
    ))
    sendResponse(res,{languages:response_list});
});

exports.getAllLanguages = catchAsync(async(req,res)=>{
    const languages = await Question.distinct('language');
    sendResponse(res,{languages});
});