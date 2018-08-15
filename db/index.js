'use strict';

const mongoose = require('mongoose');
const config = require('config');
const logger = require('../log')(module);

mongoose.Promise = global.Promise;
mongoose.connect(config.db.mongoConnection, { useMongoClient: true }, (err, connection) => {
    if (err) {
        logger.error(err);
        process.exit(1);
    }

    logger.debug('Mongo connected');

    if (process.env.SEED_DB === true || process.env.SEED_DB === 'true') {
        require('./seed')();
    }
});

exports.accessTokens       = require('./accesstokens');
exports.authorizationCodes = require('./authorizationcodes');
exports.clients            = require('./clients');
exports.refreshTokens      = require('./refreshtokens');
exports.users              = require('./users');
