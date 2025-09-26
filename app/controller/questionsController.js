const progressModel = require("../modals/progressModel");
const questionModel = require("../modals/questionModel");
const aiServices = require("../services/aiServices");
const dbServices = require("../services/databaseService");

const questionsController = {};

questionsController.generatePdfQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const questionsWithPlaceholders = await aiServices.generateQuestions(req.file.filename);
        if (!Array.isArray(questionsWithPlaceholders)) {
            throw new Error("AI service did not return a valid list of questions.");
        }
        const questionsWithVectors = await Promise.all(
            questionsWithPlaceholders.map(async (question) => {
                const vector = await aiServices.generateQuestions(question.questionText);
                return { ...question, vector };
            })
        );
        await dbServices.insert(questionModel, questionsWithVectors);
        return res.status(201).json({ 
            message: 'Questions generated and saved successfully.', 
            data: questionsWithVectors.length 
        });

    } catch (err) {
        return res.status(300).json({ message: err.message });
    }
}

questionsController.generateVideoQuestions = async(req, res) => {
    try{
        const videoUrl = req.body.url;
        const questions = await aiServices.generateUrlQuestions(videoUrl);
        await dbServices.insert(questionModel, questions);
        return res.status(201).json({ 
            message: 'Questions generated and saved successfully.'
        });

    }catch(err){
        return res.status(300).json({ message: err.message });
    }
}

questionsController.fetchTopics = async (req, res) => {
    try{
        const topics = await questionModel.distinct('topic');
        return res.status(200).json({ topics, count: topics.length });
    }catch(err){
        return res.status(300).json({ message: err.message });
    }
}

questionsController.fetchQuestions = async (req, res) => {
    try{
        const {topic} = req.query;
        const questions = await questionModel.find({topic});

        return res.status(200).json({ questions });

    }catch(err){
        return res.status(300).json({ message: err.message });
    }
}

questionsController.updateScore = async (req, res) => {
  try {
    const user = req.user;
    const { scorePercentage, incorrectQuestions } = req.body;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let progress = new progressModel({
        userId: user._id,
        scorePercentage,
        incorrectQuestions,
        weakAreas: [] 
      });

    await progress.save();

    res.status(200).json({ message: 'Progress saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

questionsController.getScore = async (req, res) => {
    try {
    // Fetch all progress documents for the user
    const user = req.user;
    const progressRecords = await progressModel.find({ userId: user._id }).select('scorePercentage incorrectQuestions weakAreas');

    // Extract scores as needed
    const scores = progressRecords.map(record => ({
      scorePercentage: record.scorePercentage,
      incorrectQuestions: record.incorrectQuestions,
      weakAreas: record.weakAreas,
      id: record._id
    }));

    return res.status(200).json({scores});
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = questionsController;