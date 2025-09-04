const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  scoreHistory: [
    {
      date: { type: Date, default: Date.now },
      score: Number, // e.g., percentage or points
    }
  ],
  weakAreas: [String] // Array of topic names or skill identifiers
});

module.exports = mongoose.model('Progress', progressSchema);
