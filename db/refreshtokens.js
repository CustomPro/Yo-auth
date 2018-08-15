'use strict';

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');

// The refresh tokens.
// You will use these to get access tokens to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Tokens mongo-db data structure which stores all of the refresh tokens
 */
const refreshTokensSchema = new Schema({

    token: {type: String, unique: true, required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', default: null},
    clientId: {type: Schema.Types.ObjectId, required: true, ref: 'Client'},
    expirationDate: {type: Date},
    scope: {type: Schema.Types.Mixed},
    /**
     * Removes expired access tokens. It does this by looping through them all and then removing the
     * expired ones it finds.
     * */
    expireAt: {type: Date, default: Date.now, expires: config.refreshToken.expiresIn }

}, {timestamps: true});

refreshTokensSchema.statics.removeToken = (token) => {
    token = jwt.decode(this.token).jti;
    return tokens.remove({token});
};

refreshTokensSchema.statics.addToken = (model) => {
    const token = model.token;
    model.token = jwt.decode(model.token).jti;

    return tokens.remove({token: model.token})
        .then((result) => tokens.create(model))
        .then((result) => Promise.resolve(token));
};

/**
 * Returns a refresh token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 * @returns {Promise} resolved with the token
 */
refreshTokensSchema.statics.findToken = (token) => tokens.findOne({token: jwt.decode(token).jti});


/**
 * Removes all access tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
refreshTokensSchema.statics.removeAll = () => tokens.remove({});

const tokens = module.exports = mongoose.model('RefreshToken', refreshTokensSchema);
