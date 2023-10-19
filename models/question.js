const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    language: {
        type: String,
        required: true,
    },
    question:{
        type: String,
        required:true,
    },
    marks:{
        type: Number,
        required: true,
    },
    options:{
        type: [String],
        required:true
    },
    answer:{
        type:Number,
        required: true,
    }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
