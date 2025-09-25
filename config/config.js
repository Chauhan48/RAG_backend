require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_URI: process.env.DB_URL || '',
    TOKEN_SECRET: process.env.TOKEN_SECRET || '####',
    API_KEY: process.env.API_KEY
};