const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
    },
    expiryDate : Date,
});

sessionSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });
const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
