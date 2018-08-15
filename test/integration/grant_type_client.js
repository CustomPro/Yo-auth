'use strict';

const helper   = require('./common').helper;
const validate = require('./common').validate;

/**
 * Tests for the Grant Type of Client.
 */
describe('Grant Type Client', () => {
  it('should work with asking for an access token', () =>
    helper.postOAuthClient({})
    .then(([response, body]) => {
      validate.accessToken(response, body);
      return JSON.parse(body);
    })
    .then(tokens => helper.getClientInfo(tokens.access_token))
    .then(([response, body]) => validate.clientJson(response, body)));

  it('should work with a scope of undefined', () =>
    helper.postOAuthClient(undefined)
    .then(([response, body]) => {
      validate.accessToken(response, body);
      return JSON.parse(body);
    })
    .then(tokens => helper.getClientInfo(tokens.access_token))
    .then(([response, body]) => validate.clientJson(response, body)));
});
