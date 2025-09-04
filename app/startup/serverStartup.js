const serverStartup = async (app) => {
    app.use(require('express').json);
    app.get('/', (req, res) => {
        return res.send('hi');
    })
}

module.exports = serverStartup;