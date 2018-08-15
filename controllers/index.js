
const oauth2         = require('./oauth2');
const site           = require('./site');
const token          = require('./token');
const user           = require('./user');
const client         = require('./client');
const url            = require('url'); 

module.exports = function (app) {

        app.get('/', (req, res, next) => {
                res.redirect(url.format({
                        pathname: "/login",
                        query: req.query,
                }));
        });
        
        app.get('/login', site.loginForm);
        app.post('/login', site.login);
        app.get('/signup', site.signupForm);
        app.post('/signup', site.signup);
        app.get('/logout', site.logout);
        app.get('/oauth/facebook', site.facebook);
        app.get('/oauth/facebook/callback', site.facebookCallback);
        app.get('/oauth/twitter', site.twitter);
        app.get('/oauth/twitter/callback', site.twitterCallback);
        app.get('/oauth/linkedin', site.linkedin);
        app.get('/oauth/linkedin/callback', site.linkedinCallback);
        app.get('/oauth/google', site.google);
        app.get('/oauth/google/callback', site.googleCallback);
        app.get('/account', site.account);

        app.get('/dialog/authorize', oauth2.authorization);
        app.post('/dialog/authorize/decision', oauth2.decision);
        app.post('/oauth/token', oauth2.token);

        app.get('/api/userinfo', user.info);
        app.get('/api/clientinfo', client.info);

        // Mimicking google's token info endpoint from
        // https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
        app.get('/api/tokeninfo', token.info);

        // Mimicking google's token revoke endpoint from
        // https://developers.google.com/identity/protocols/OAuth2WebServer
        app.get('/api/revoke', token.revoke);
};
