'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

/**
 * This is the configuration of the users that are allowed to connected to your authorization
 * server. These represent users of different client applications that can connect to the
 * authorization server. At a minimum you need the required properties of
 */

const userSchema = new Schema({

    role: {type: String, trim: true, default: 'user'},

    email: {
        type: String,
        required: true,
        unique: `User with ${this.email} email is already exists`
    },

    name: {
        type: String,
        required: true,
        unique: `User ${this.name} is already exists`
    },

    facebookId: { type: String },
    facebook: { type: Schema.Types.Mixed },

    googleId: { type: String },
    google: { type: Schema.Types.Mixed },

    twitterId: { type: String },
    twitter: { type: Schema.Types.Mixed },

    linkedinId: { type: String },
    linkedin: { type: Schema.Types.Mixed },

    password: {type: String, default: ''},
    hasPassword: {type: Boolean, default: false},

    isEnabled: {type: Boolean, default: true},
    isVerified: {type: Boolean, default: false},

    verifyToken: {type: String, default: null},
    verifyShortToken: {type: String, default: null},
    verifyExpires: {type: Date}, // or a long integer
    verifyChanges: {type: Schema.Types.Mixed, default: {}},
    resetToken: {type: String, default: null},
    resetExpires: {type: Date}, // or a long integer

}, {timestamps: true});

userSchema.pre('save', function (next) {
    const model = this;
    if (model.isNew) {
        model.password = bcrypt.hashSync(model.password, bcrypt.genSaltSync(10), null);
    }
    next();
});

userSchema.statics.findByUsername = (username) => users.findOne({name:username});
userSchema.statics.isUserExists = (username, email) => users.find({  $or: [
    { name: username},
    { email: email}
]}).limit(1).then((result) => result.length > 0 ? true : false);



const users = module.exports = mongoose.model('User', userSchema);
