'use strict';

/**
 * This is the configuration of the clients that are allowed to connected to your authorization
 * server. These represent client applications that can connect. At a minimum you need the required
 * properties of
 *
 * _id:          A unique id of your client application
 * name:         The name of your client application
 * clientId:     A unique id of your client application
 * clientSecret: A unique password(ish) secret that is _best not_ shared with anyone but your
 *               client application and the authorization server.
 *
 * Optionally you can set these properties which are
 *
 * trustedClient: default if missing is false. If this is set to true then the client is regarded
 * as a trusted client and not a 3rd party application. That means that the user will not be
 * presented with a decision dialog with the trusted application and that the trusted application
 * gets full scope access without the user having to make a decision to allow or disallow the scope
 * access.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientsSchema = new Schema({

    name: {
      type: String, required: true,
      unique: `Client with ${this.email} name is already exists`
    },

    clientId: {
      type: String, required: true,
      unique: `Client with ${this.email} id is already exists`
    },

    clientSecret: { type: String, required: false, default: null },
    trustedClient: { type: Boolean, required: false, default: false}

}, {timestamps: true});

const clients = module.exports = mongoose.model('Client', clientsSchema);
