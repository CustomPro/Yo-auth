'use strict';

const log = require('./log')(module);
log.debug('Required');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require(`./config/${process.env.NODE_ENV}.js`);
const express = require('express');
const expressSession = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const path = require('path');
const i18n = require("i18n-2");

const RedisStore = require('connect-redis')(expressSession);
const port = normalizePort(process.env.PORT || config.port);
const swagger = require('./swagger.json');

const registerControllers = require('./controllers');


// Express configuration
const app = express();

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(cookieParser());

// Session Configuration
app.use(expressSession({
    proxy: true,
    ephemeral: false,
    resave: false,
    saveUninitialized: true,
    secret: config.session.secret,
    store: new RedisStore(config.redis),
    key: config.session.key,
    cookie: config.session.cookies
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

i18n.expressBind(app, {

    locales:['en', 'de'],

    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.join(__dirname, '/locales'),

    defaultLocale: 'en',

    // sets a custom cookie name to parse locale settings from  - defaults to NULL
    cookie: 'lang'

});

// set up the middleware
app.use((req, res, next) => {
    req.i18n.setLocaleFromQuery();
    req.i18n.setLocaleFromCookie();
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
require('./auth');

registerControllers(app);

// static resources for stylesheets, images, javascript files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/docs', (req ,res) => res.json(swagger));

// Catch all for error messages.  Instead of a stack
// trace, this will log the json of the error message
// to the browser and pass along the status with it
app.use((err, req, res, next) => {
    if (err) {
        if (!err.status) {
            console.error('Internal unexpected error from:', err.stack);
            res.status(500);
            res.json(err);
        } else {
            res.status(err.status);
            res.json(err);
        }
    } else {
        next();
    }
});

app.use(function (req, res, next) {
    res.status(404).render('pages/404.ejs');
});

// TODO: Change these for your own certificates.  This was generated through the commands:
// openssl genrsa -out privatekey.pem 2048
// openssl req -new -key privatekey.pem -out certrequest.csr
// openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
// const fs      = require('fs');
// const https   = require('https');
// const options = {
// key  : fs.readFileSync(path.join(__dirname, 'certs/privatekey.pem')),
// cert : fs.readFileSync(path.join(__dirname, 'certs/certificate.pem')),
// };

// Create our HTTPS server listening.
// https.createServer(options, app).listen(port);
app.listen(port);
log.info('OAuth 2.0 Authorization Server started on port ' + port);

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
