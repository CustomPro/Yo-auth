'use strict';

const login = require('connect-ensure-login');
const passport = require('passport');
const validate = require('./validators');
const db = require('../db');
const config = require('config');
const log = require('../log')(module);

/**
 * Render the index.ejs or index-with-code.js depending on if query param has code or not
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.examples = (req, res) => {
    if (!req.query.code) {
        res.render('pages/auth-examples');
    } else {
        res.render('pages/auth-examples-with-code');
    }
};

/**
 * Render the login.ejs
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.loginForm = (req, res) => {
    res.render('pages/login');
};

exports.signupForm = (req, res) => {
    res.render('pages/signup');
};

exports.signup = (req, res, next) => {
    const userModel = req.body;

    if (req.user) {
        return res.render('pages/signup', { error: "Log out before user registration."});
    }

    // validates and returns the user object on success
    const validationResult = validate.user(userModel, {
        // return an error if body has an unrecognised property
        allowUnknown: false,
        // return all errors a payload contains, not just the first one Joi finds
        abortEarly: false
    });

    if (validationResult.error) {
        return validate.toResponse(validationResult, res, 'pages/signup');
    } else {
        db.users.isUserExists(userModel.name, userModel.email).then((isExists) => {
            if (isExists) {
                res.status(400);

                return res.render('pages/signup', { error: "User already exists."});
            }

            db.users.create(userModel).then((user) => {
                return res.render('pages/login', { success: "Account created."});
            });
        }).catch((error) => {
            next(error);
        })
    }
};

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.login = handleLogin('local');

exports.facebook = passport.authenticate('facebook');
exports.facebookCallback = handleLogin('facebook');

exports.twitter = passport.authenticate('twitter');
exports.twitterCallback = handleLogin('twitter');

exports.linkedin = passport.authenticate('linkedin');
exports.linkedinCallback = handleLogin('linkedin');

exports.google = passport.authenticate('google');
exports.googleCallback = handleLogin('google');

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie(config.session.key);
        res.render('pages/login', { logout: "You have been logged out." });
    });
};

/**
 * Render account.ejs but ensure the user is logged in before rendering
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.account = [
    login.ensureLoggedIn(),
    (req, res) => {
        res.render('pages/account', {user: req.user});
    },
];

function handleLogin(provider) {
   // log.debug(provider);
    return (req, res, next) => passport.authenticate(provider, (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.render('pages/login', {error: 'Invalid credentials'});
        }

        return req.logIn(user, function (err) {
            if (err) {
                return next(err);
            
            // If a redirect after login was added to session beforehand redirect now 
            // => e.g.redirect url may request the new token or redirect to the last page the user tried to access
            } else if (req.session && req.session.returnTo) {
                console.log(req.session);
                return res.redirect(req.session.returnTo);
            
            } else { // redirect to default url after an successfull login e.g standard app or dashboard
               console.log(config.app.url);
                return res.status(301).redirect(config.app.url);
            }
        });
    })(req, res, next);
}
