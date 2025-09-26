const userRoutes = require('../routes/userRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const serverStartup = async (app) => {
    app.use(require('express').json());

    app.use(cors({
        origin: [
            'http://localhost:5173',
            'https://chauhan48.github.io'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(cookieParser());
    app.use(require('express').urlencoded({ extended: true }));
    app.use(require('express').static('public'));
    app.use('/api', userRoutes);


}

module.exports = serverStartup;