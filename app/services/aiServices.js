const { GoogleGenAI } = require('@google/genai');
const { API_KEY } = require('../../config/config');
const fs = require('fs').promises;
const pdf = require('pdf-parse');
const path = require('path');

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const aiServices = {};

aiServices.generateQuestions = async (fileName) => {
    try {
        const filePath = path.join(__dirname, '../../uploads/', fileName);
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        const pdfText = pdfData.text;

        const prompt = `Analyze the provided PDF document. Based on its content, generate 5 multiple-choice questions.

For each question, the output must be a JSON object that strictly adheres to the following Mongoose schema. Do not include any text outside of the JSON.

**Mongoose Schema:**

{
  "questionText": "string",
  "vector": "array of numbers",
  "difficulty": "string (Easy, Medium, or Hard)",
  "topic": "string",
  "options": [{ "text": "string", "isCorrect": "boolean" }],
  "hint": "string",
  "rationale": "string",
  "createdAt": "date"
}

**Instructions:**
1.  **Strictly follow the JSON format** provided above.
2.  For the \`questionText\`, generate a relevant question.
3.  For the \`vector\` field, **generate a placeholder array of 6 numbers**. My application will replace this with the actual vector later.
4.  Determine the \`difficulty\` (Easy, Medium, or Hard) and \`topic\` based on the content.
5.  Generate four plausible \`options\` for each question. One option's \`isCorrect\` field must be \`true\`, and the others must be \`false\`.
6. The topic for all the 5 questions should be same.
7.  Provide a helpful \`hint\` and a detailed \`rationale\` for each question.
8.  For the \`createdAt\` field, use the current date and time in ISO format as a placeholder. My application will override this value.

Return a single JSON array containing all 5 question objects.

**PDF Content:**
${pdfText}
`;

        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error("No response text from AI model");
            return [];
        }

        const cleanedText = text.replace(/```json\s*|```\s*$/g, '');
        try {
            const questions = JSON.parse(cleanedText);
            return Array.isArray(questions) ? questions : [];
        } catch (jsonError) {
            console.error("Failed to parse AI response as JSON:", jsonError.message);
            console.error("Raw text from AI:", text);
            return []; // Return an empty array on parsing failure
        }
    } catch (error) {
        console.error("Error generating questions:", error);
        return []; // Always return an array, never a string
    }
}

// Add the missing generateVector function
aiServices.generateVector = async (text) => {
    try {
        // Using Google's text embedding model to generate vectors
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);

        // Return the embedding vector
        return result.embedding.values || [];
    } catch (error) {
        console.error("Error generating vector:", error);
        // Return a placeholder vector if embedding fails
        return Array(768).fill(0).map(() => Math.random());
    }
}

aiServices.generateUrlQuestions = async (url) => {
    try {

        const prompt = `Based on the content of the following Youtube video url generate 5 multiple-choice questions.

**Youtube Vidoe Url:**
${url}

For each question, the output must be a JSON object that strictly adheres to the following Mongoose schema. Do not include any text outside of the JSON.

**Mongoose Schema:**

{
  "questionText": "string",
  "vector": "array of numbers",
  "difficulty": "string (Easy, Medium, or Hard)",
  "topic": "string",
  "options": [{ "text": "string", "isCorrect": "boolean" }],
  "hint": "string",
  "rationale": "string",
  "createdAt": "date"
}

**Instructions:**
1.  **Strictly follow the JSON format** provided above.
2.  For the \`questionText\`, generate a relevant question.
3.  For the \`vector\` field, **generate a placeholder array of 6 numbers**. My application will replace this with the actual vector later.
4.  Determine the \`difficulty\` (Easy, Medium, or Hard) and \`topic\` based on the content.
5.  Generate four plausible \`options\` for each question. One option's \`isCorrect\` field must be \`true\`, and the others must be \`false\`.
6. The topic for all the 5 questions should be same.
7.  Provide a helpful \`hint\` and a detailed \`rationale\` for each question.
8.  For the \`createdAt\` field, use the current date and time in ISO format as a placeholder. My application will override this value.

Return a single JSON array containing all 5 question objects.
`;

        const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error("No response text from AI model");
            return [];
        }

        const cleanedText = text.replace(/```json\s*|```\s*$/g, '');
        const questions = JSON.parse(cleanedText);
        return Array.isArray(questions) ? questions : [];
    } catch (err) {
        console.error("Error generating questions:", err);
        return [];
    }
}

module.exports = aiServices;