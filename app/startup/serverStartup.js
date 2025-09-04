const userRoutes = require('../routes/userRoutes');
const path = require('path');

const serverStartup = async (app) => {
    app.use(require('express').json());
    app.use(require('express').urlencoded({ extended: true }));
    app.use(require('express').static('public'));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.use('/user',userRoutes);
    // user routes
    // app.get('/', require('../routes/userRoutes'));
}

module.exports = serverStartup;