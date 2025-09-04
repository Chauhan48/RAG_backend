const questionModel = require("../modals/questionModel");
const questionBank = require("../utils/questionBank");

async function migration() {
    try{
        const count = await questionModel.countDocuments();
    
        if(count == 0){
            console.log('Applying migrations to add question to database');
            await questionModel.insertMany(questionBank);
        }else{
            console.log(`Question bank already initiated with ${count} questions`);
        }
    }catch(err){
        console.log('Migration Error', err);
    }
}

module.exports = migration;