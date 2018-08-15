const Joi = require('joi');

const usernameValidator =  Joi.string().alphanum().min(3).max(15).required();
const nameValidator = Joi.string().alphanum().min(3).max(30).required();
const passwordValidator = Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required();
const emailValidator = Joi.string().email().max(100).required();

module.exports = (model, options) => Joi.validate(model, Joi.object({
        firstName: nameValidator,
        lastName: nameValidator,
        name: usernameValidator,
        password: passwordValidator,
        passwordConfirm: passwordValidator,
        email: emailValidator
    }),

    options || {}
);
