const express = require('express');
const mongoose = require('mongoose');
const {PORT} = require('./config/config');
const migrate = require('./app/services/migrations');

const app = express();

const startNodeServer = async () => {
    await require('./app/startup/databaseStartup')(mongoose);
    await migrate();
    await require('./app/startup/serverStartup')(app);
}

startNodeServer().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`);
    })
}).catch((err) => {
    console.log('Error running server', err);
})
