'use strict';

const fs   = require('fs');
const path = require('path');
const uuid = require('uuid/v4');
const jwt  = require('jsonwebtoken');
const bCrypt = require('bcrypt');

/** Private certificate used for signing JSON WebTokens */
const privateKey = fs.readFileSync(path.join(__dirname, 'certs/privatekey.pem'));

/** Public certificate used for verification.  Note: you could also use the private key */
const publicKey = fs.readFileSync(path.join(__dirname, 'certs/certificate.pem'));

/**
 * Creates a signed JSON WebToken and returns it.  Utilizes the private certificate to create
 * the signed JWT.  For more options and other things you can change this to, please see:
 * https://github.com/auth0/node-jsonwebtoken
 *
 * @param  {Number} exp - The number of seconds for this token to expire.  By default it will be 60
 *                        minutes (3600 seconds) if nothing is passed in.
 * @param  {String} sub - The subject or identity of the token.
 * @return {String} The JWT Token
 */
exports.createToken = ({ exp = 3600, sub = '' } = {}) => {
  const token = jwt.sign({
    jti : uuid(),
    sub,
    exp : Math.floor(Date.now() / 1000) + exp,
  }, privateKey, {
    algorithm: 'RS256',
  });

  return token;
};

/**
 * Verifies the token through the jwt library using the public certificate.
 * @param   {String} token - The token to verify
 * @throws  {Error} Error if the token could not be verified
 * @returns {Object} The token decoded and verified
 */
exports.verifyToken = token => jwt.verify(token, publicKey);

/**
 * Generates hash using bCrypt.
 * @param   {String} str - String to be hashed
 * @returns {Promise} Promise with Hashed value
 */
exports.createHash = (str) => {
    return bCrypt.hash(str, bCrypt.genSaltSync(10));
};

/**
 * Generates hash using bCrypt.
 * @param   {String} str - String to be hashed and compared
 * @param   {String} hash - Hashed string to be compared
 * @returns {Boolean} Comparison result
 */
exports.compareStringWithHash = (str, hash) => {
  return bCrypt.compareSync(str, hash);
};
