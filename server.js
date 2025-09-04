const express = require('express');
const mongoose = require('mongoose');
const {PORT} = require('./config/config');

const app = express();

const startNodeServer = async () => {
    await require('./app/startup/databaseStartup')(mongoose);
    await require('./app/startup/serverStartup')(app);
}

startNodeServer();

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})