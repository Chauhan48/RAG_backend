const userRoutes = require('../routes/userRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const serverStartup = async (app) => {
    app.use(require('express').json());
    app.use(cors(
        {
            origin: [
                'http://localhost:5173'
            ],
            credentials: true
        }
    ));
    app.use(cookieParser());
    app.use(require('express').urlencoded({ extended: true }));
    app.use(require('express').static('public'));
    app.use('/api', userRoutes);


}

module.exports = serverStartup;