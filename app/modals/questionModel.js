const { Schema, model } = require('mongoose');

const questionSchema = new Schema({
    questionText: {
        type: String,
        required: true
    },
    vector: {
        type: [Number],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    options: {
        type: [{
            text: String,
            isCorrect: Boolean
        }],
        required: true
    },
    hint: {
        type: String
    },
    rationale: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const questionModel = model('Question', questionSchema);

module.exports = questionModel;