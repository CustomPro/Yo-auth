'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');

// The authorization codes.
// You will use these to get the access codes to get to the data in your endpoints as outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Authorization codes db data structure which stores all of the authorization codes
 */
const authorizationCodesSchema = new Schema({

    code: {type: String, unique: true, required: true},
    clientId: {type: Schema.Types.ObjectId, required: true},
    redirectURI: {type: String, required: true},
    userId: {type: Schema.Types.ObjectId, required: true, ref: 'User'},
    scope: {type: Schema.Types.Mixed},

}, {timestamps: true});

/**
 * Removes all authorization codes.
 * @returns {Promise} resolved with all removed authorization codes returned
 */
authorizationCodesSchema.statics.removeAll = () => codes.remove({});

/**
 * Removes all authorization codes.
 * @param   {String}  authorization code.
 * @returns {Promise} resolved with removed authorization code returned
 */
authorizationCodesSchema.statics.removeCode = (code) => {
    const query = {code: jwt.decode(code).jti};

    return codes.findOne(query).then((item) => {
        if (!item) {
            return Promise.resolve(undefined);
        }

        return new Promise((res, rej) => item.remove((err) => res(err ? undefined : item)));
    });
};

authorizationCodesSchema.statics.generateCode = (model) => codes.removeCode(model.code).then((result) => {
    model.code = jwt.decode(model.code).jti;
    return codes.create(model);
});


authorizationCodesSchema.statics.findCode = (code) => {
    code = jwt.decode(model.code).jti;
    return codes.findOne({code});
};


const codes = module.exports = mongoose.model('AuthorizationCode', authorizationCodesSchema);
