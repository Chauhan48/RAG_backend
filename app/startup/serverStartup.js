const userRoutes = require('../routes/userRoutes');
const path = require('path');
const cookieParser = require('cookie-parser');
const questionModel = require('../modals/questionModel');

const serverStartup = async (app) => {
    app.use(require('express').json());
    app.use(require('express').urlencoded({ extended: true }));
    app.use(require('express').static('public'));
    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use('/user', userRoutes);

    app.get('/test/:difficulty', async (req, res) => {
        const difficulty = req.params.difficulty;

        const questions = await questionModel.find({ difficulty: new RegExp(`^${difficulty}$`, 'i') });

        res.render('test', {
            difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            questions
        });
    });


}

module.exports = serverStartup;