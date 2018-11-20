const path = require('path'),
    express = require("express"),
    helmet = require("helmet"),
    api = require('./api'),
    utils = require('./utils'),
    config = require('./config'),
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
    api.allHosts()
        .then(data => res.status(200).json(data))
        .catch(err => {
            res.status(500).send();
            logger.error(JSON.parse(err));
        });
});

app.get('/api/v1/host/:host', [utils.enableCors], (req, res) => {
    api.hostDetails(req.params.host)
        .then(data => res.status(200).json(data))
        .catch(err => {
            res.status(500).send();
            logger.error(JSON.parse(err));
        });
});

app.get('/api/v1/group', [utils.enableCors], (req, res) => {
    api.allGroups()
        .then(data => res.status(200).json(data))
        .catch(err => {
            res.status(500).send();
            logger.error(JSON.parse(err));
        });
});

app.listen(config.port, () => {
    logger.info('status.osweekends.com running on port', config.port);
});