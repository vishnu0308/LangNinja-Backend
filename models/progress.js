const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User'
    },
    language: {
        type: String,
        required: true,
    },
    level: {
        type: Number,
    },
    excercise_history: [{
        level: Number,
        score: Number
    }],
});

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
