const Joi = require('joi');

const createSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    website: Joi.string().uri().optional(),
    established: Joi.date().optional(),
    admin: Joi.string().required(), 
});

const updateSchema = Joi.object({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().uri().optional(),
    established: Joi.date().optional(),
    admin: Joi.string().optional(), 
});

module.exports = {
    create: createSchema,
    update: updateSchema,
};