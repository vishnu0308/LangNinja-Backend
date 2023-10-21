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
        get: v => parseFloat(v.toFixed(2)), 
        set: v => parseFloat(v.toFixed(2))
    },
    excercise_history: [{
        level: {
            type: Number,
            get: v => parseFloat(v.toFixed(2)), 
            set: v => parseFloat(v.toFixed(2))
        },
        score: {
            type: Number,
            get: v => parseFloat(v.toFixed(2)), 
            set: v => parseFloat(v.toFixed(2))
        }
    }],
});

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
