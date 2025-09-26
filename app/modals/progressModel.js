const { Schema, model } = require('mongoose');

const progressSchema = Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    scorePercentage:
    {
        type: Number,
    },
    incorrectQuestions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'question'
        }
    ],
    weakAreas: [String]
});

const progressModel = model('progress', progressSchema);
module.exports = progressModel;