const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User'
    },
    language: {
        type: String,
        required: true,
    },
    questions_list:[{
        question_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        option_choosed: {
            type: Number
        }
    }]
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
