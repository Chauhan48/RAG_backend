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


module.exports = questionsController;