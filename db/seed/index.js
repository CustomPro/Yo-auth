const log = require('../../log')(module);
const bcrypt = require('bcrypt');
const db = require('../');

const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

module.exports = () => Promise.resolve([
    seedClients(),
    seedUsers(),
    cleanAccessTokens(),
    cleanAuthCodes(),
    cleanRefreshTokens()
]).catch(err => {
    log.err(err);
    process.exit(1);
});

function seedClients() {
    log.debug('Seeding clients');

    const clients = require('./clients');
    clients.map((client) => client.clientSecret = createHash(client.clientSecret));

    return db.clients.remove({})
        .then(() => db.clients.insertMany(clients))
        .then(() => {
            log.debug('Clients seed completed');
            return Promise.resolve(true);
        });
}

function seedUsers() {
    log.debug('Seeding users');

    const users = require('./users');
    users.map((user) => user.password = createHash(user.password));

    return db.users.remove({})
        .then(() => db.users.insertMany(users))
        .then(() => {
            log.debug('Users seed completed');
            return Promise.resolve(true);
        });
}

function cleanAccessTokens() {
    log.debug('Clean up access tokens');
    return db.accessTokens.removeAll();
}

function cleanAuthCodes() {
    log.debug('Clean up auth codes');
    return db.authorizationCodes.removeAll();
}

function cleanRefreshTokens() {
    log.debug('Clean up refresh tokens');
    return db.refreshTokens.removeAll();
}
