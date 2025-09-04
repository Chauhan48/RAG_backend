const { Schema, model } = require('mongoose');

const questionSchema = new Schema({
    question: String,
    options: [String],
    answer: Number,
    difficulty: String
});

const questionModel = model('question', questionSchema);

module.exports = questionModel;