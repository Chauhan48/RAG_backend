const { Schema, model } = require('mongoose');

const progressSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    scoreHistory: [
        {
            date: { type: Date, default: Date.now },
            score: Number,
        }
    ],
    weakAreas: [String]
});

const progressModel = model('progress', progressSchema);
module.exports = progressModel;