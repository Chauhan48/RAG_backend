const userRoutes = require('../routes/userRoutes');
const path = require('path');
const cookieParser = require('cookie-parser');

const serverStartup = async (app) => {
    app.use(require('express').json());
    app.use(require('express').urlencoded({ extended: true }));
    app.use(require('express').static('public'));
    app.use(cookieParser());
    app.use('/api', userRoutes);


}

module.exports = serverStartup;