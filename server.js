const path = require('path'),
    express = require("express"),
    helmet = require("helmet"),
    utils = require('./utils'),
    config = require('./config')
    logger = require('./logger');

const app = express();

app.use(helmet());
app.use(express.static('public'));

app.use((req, res, next) => {
    logger.info(`[${new Date().getTime()}] | IP: ${req.connection.remoteAddress} | UserAgent: ${req.headers['user-agent']}`);
    next();
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/api/v1/host', [utils.enableCors], (req, res) => {
    logger.info(`[GET] API /host`);
});

app.get('/api/v1/host/:host', [utils.enableCors], (req, res) => {
    logger.info(`[GET] API /host/${req.params.host}`);
});

app.listen(config.port, () => {
    logger.info('status.osweekends.com running on port', config.port);
});