'use strict';

//
// The configuration options of the server
//

exports.mode = 'production';
exports.port = 80;

/**
 * Configuration of access tokens.
 *
 * expiresIn               - The time in minutes before the access token expires. Default is 60
 *                           minutes
 * calculateExpirationDate - A simple function to calculate the absolute time that the token is
 *                           going to expire in.
 */
exports.token = {
    expiresIn: 60 * 60,
    calculateExpirationDate: () => new Date(Date.now() + (this.token.expiresIn * 1000)),
};

exports.redis = {
    host: "redis-server",
    port: 6379,
    db: 5,
    auth: ""
};

/**
 * Configuration of code token.
 * expiresIn - The time in minutes before the code token expires.  Default is 5 minutes.
 */
exports.codeToken = {
    expiresIn: 5 * 60,
};

/**
 * Configuration of refresh token.
 * expiresIn - The time in minutes before the code token expires.  Default is 100 years.  Most if
 *             all refresh tokens are expected to not expire.  However, I give it a very long shelf
 *             life instead.
 */
exports.refreshToken = {
    expiresIn: 52560000,
};

/**
 * Database configuration for access and refresh tokens.
 *
 * timeToCheckExpiredTokens - The time in seconds to check the database for expired access tokens.
 *                            For example, if it's set to 3600, then that's one hour to check for
 *                            expired access tokens.
 * mongoConnection - Connection string to mongodb server.
 */
exports.db = {
    timeToCheckExpiredTokens: 3600,
    mongoConnection: 'mongodb://mongodb:27017/yo-auth-dev'
};

/**
 * Session configuration
 *
 * maxAge - The maximum age in milliseconds of the session.  Use null for web browser session only.
 *          Use something else large like 3600000 * 24 * 7 * 52 for a year.
 * secret - The session secret that you should change to what you want
 */
exports.session = {
    cookie: {
        secure: true,
        path: "/",
        domain: "yo-auth",
        maxAge: 3600000 * 24 * 7 * 52,
    },
    key: 'yo-desk-authorization.id',
    secret: 'A Secret That Should Be Changed', // TODO: You need to change this secret to something that you choose for your secret
};

/**
 * Default Redirect URL to app after a successfull login 
 * (and if no redirectTo is provided in session e.g. if user directly enters auth-url in browser)
 *
 */
exports.app = {
    url: "https://env-hitradion1-app.multicast-media.com" // TODO: Change to Acounting Dashboard Url 
};

exports.oauth = {
    facebook: {
        name: "facebook",
        passReqToCallback: true,
        clientID: "233123290393150",
        clientSecret: "ffd71671fb01b5a7e698e1e53d542fe7",
        callbackURL: "https://env-hitradion1-auth.multicast-media.com/oauth/facebook/callback",
        scope: [
            "public_profile",
            "email"
        ],
        profileFields: [
            "id",
            "displayName",
            "first_name",
            "last_name",
            "email",
            "profileUrl",
            "birthday",
            "picture"
        ]
    },
    twitter: {
        name: "twitter",
        callbackURL: "https://env-hitradion1-auth.multicast-media.com/oauth/twitter/callback",
        consumerKey: "r92k54rAWn5FVww8sVSw3ind6",
        consumerSecret: "xj5mw5xMDq9vzsXnTo0D5MSQmjAkQXcnIq2bl2pntLWH8uYDLY",
        includeEmail: true,
        passReqToCallback: true
    },
    google: {
        name: "google",
        passReqToCallback: true,
        callbackURL: "https://env-hitradion1-auth.multicast-media.com/oauth/google/callback",
        clientID: "881173726325-fk68b4h9depaarmfe139b5od1vc7a470.apps.googleusercontent.com",
        clientSecret: "DKz32EUXQ1UjPus4PjPh6WB5",
        scope: [
            "profile",
            "email"
        ]
    },
    linkedin: {
        name: "linkedin",
        clientID: "77yg529z27cy8k",
        clientSecret: "YIR7RpFfeicKKA6X",
        passReqToCallback: true,
        callbackURL: "http://env-hitradion1-auth.multicast-media.com/oauth/linkedin/callback",
        "scope": [
            "r_emailaddress",
            "r_basicprofile"
        ]
    }
};
