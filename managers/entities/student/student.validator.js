const Joi = require('joi');

const createSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    classroom: Joi.string().required(),
    age: Joi.number().integer().required(),
    address: Joi.string().required(),
});

const updateSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    classroom: Joi.string().optional(),
    age: Joi.number().integer().optional(),
    address: Joi.string().optional(),
});

module.exports = {
    create: createSchema,
    update: updateSchema,
};