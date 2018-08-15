'use strict';

const db = require('./db');
const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const {BasicStrategy} = require('passport-http');
const {Strategy: ClientPasswordStrategy} = require('passport-oauth2-client-password');
const {Strategy: BearerStrategy} = require('passport-http-bearer');
const validate = require('./validate');
const {Strategy: FacebookStrategy} = require('passport-facebook');
const {Strategy: TwitterStrategy} = require('passport-twitter');
const {Strategy: LinkedinStrategy} = require('passport-linkedin-oauth2');
const {Strategy: GoogleStrategy} = require('passport-google-oauth2');

const config = require('config');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy((username, password, done) => {
    db.users.findByUsername(username)
        .then(user => validate.user(user, password))
        .then(user => done(null, user))
        .catch(() => done(null, false));
}));

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
passport.use(new BasicStrategy((clientId, clientSecret, done) => {
    db.clients.findOne({clientId})
        .then(client => validate.client(client, clientSecret))
        .then(client => done(null, client))
        .catch(() => done(null, false));
}));

/**
 * Client Password strategy
 *
 * The OAuth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */
passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
    db.clients.findOne({clientId})
        .then(client => validate.client(client, clientSecret))
        .then(client => done(null, client))
        .catch(() => done(null, false));
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 *
 * To keep this example simple, restricted scopes are not implemented, and this is just for
 * illustrative purposes
 */
passport.use(new BearerStrategy((accessToken, done) => {
    db.accessTokens.findToken(accessToken)
        .then(token => validate.token(token, accessToken))
        .then(token => done(null, token, {scope: '*'}))
        .catch(() => done(null, false));
}));

passport.use(new FacebookStrategy(config.oauth.facebook, emailFirstOuathVerifier));
passport.use(new TwitterStrategy(config.oauth.twitter, emailFirstOuathVerifier));
passport.use(new LinkedinStrategy(config.oauth.linkedin, emailFirstOuathVerifier));
passport.use(new GoogleStrategy(config.oauth.google, emailFirstOuathVerifier));

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.users.findOne({_id: id})
        .then(user => done(null, user))
        .catch(err => done(err));
});

function emailFirstOuathVerifier(req, accessToken, refreshToken, profile, done) {
    const self = this;

    const emails = profile.emails.map(emailObj => emailObj.value);
    const query = {
        $or: [
            {[self.name + 'Id']: profile.id},
            {'email': {$in: emails}}
        ]
    };
    const data = {profile, accessToken, refreshToken};
    let existing;
    // Check request object for an existing entity
    if (req && req.user) {
        existing = req.user;
    }

    // If there is already an entity on the request object (ie. they are
    // already authenticated) attach the profile to the existing entity
    // because they are likely "linking" social accounts/profiles.
    if (existing) {
        return db.users.findOne({[self.name + 'Id']: profile.id, _id: {$ne: existing.id}})
            .then((user) => {
                if (user) {
                    throw new Error(`${self.name} account already linked.`);
                }

                return updateUser.bind(self)(existing, profile);
            })
            .then(entity => {
                req.logout();
                done(null, entity);
            })
            .catch(error => error ? req.res.render('pages/login', {error: error.message}) : done(null, error));
    }

    // Find or create the user since they could have signed up via facebook.
    db.users
        .find(query).limit(1)
        .then((results) => Promise.resolve(results.length > 0 ? results[0] : null))
        .then(entity => {
            if (entity) {
                return updateUser.bind(self)(entity, data);
            } else {
                const newUser = {
                    email: emails[0],
                    name: self.name + profile.id,
                    [self.name + 'Id']: profile.id,
                    [self.name]: profile,
                    isVerified: true
                };
                return db.users.create(newUser)
            }
        })
        .then(entity => {
            req.logout();
            done(null, entity);
        })
        .catch(error => error ? done(error) : done(null, error));

    function updateUser(user, profile) {
        return db.users.update({_id: user.id}, {[this.name + 'Id']: profile.id, [this.name]: profile})
            .then(() => db.users.findOne({_id: user.id}));
    }
}
