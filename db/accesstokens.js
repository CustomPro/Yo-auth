'use strict';

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');

// The access tokens.
// You will use these to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens db data structure which stores all of the access tokens
 */
const accessTokensSchema = new Schema({

    token: {type: String, unique: true, required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', default: null},
    clientId: {type: Schema.Types.ObjectId, required: true, ref: 'Client'},
    expirationDate: {type: Date},
    scope: {type: Schema.Types.Mixed},
    /**
     * Removes expired access tokens. It does this by looping through them all and then removing the
     * expired ones it finds.
     * */
    expireAt: {type: Date, default: Date.now, expires: config.db.timeToCheckExpiredTokens * 1000}

}, {timestamps: true});

accessTokensSchema.statics.removeToken = (token) => {
    token = jwt.decode(this.token).jti;
    return tokens.remove({token});
};

accessTokensSchema.statics.addToken = (model) => {
    const token = model.token;

    return tokens.remove({userId: model.userId, clientId: model.clientId})
        .then(() => {
            model.token = jwt.decode(model.token).jti;

            return tokens.create(model);
        })
        .then((result) => {
            return Promise.resolve(token);
        });
};

accessTokensSchema.statics.findToken = (token) => {
    const decoded = jwt.decode(token);

    if (!decoded) {
        return Promise.reject({message: 'Un Authorized.'});
    }
    return tokens.findOne({token: jwt.decode(token).jti});
};

/**
 * Removes all access tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
accessTokensSchema.statics.removeAll = () => tokens.remove({});

const tokens = module.exports = mongoose.model('AccessToken', accessTokensSchema);
