const config = require('../../config/config');

module.exports = async (mongoose) => {
    await mongoose.connect(config.DB_URI)
        .then(() => {
            console.log('Connected to database');
        })
        .catch((err) => {
            console.log('Error connecting to database', err);
        })
}