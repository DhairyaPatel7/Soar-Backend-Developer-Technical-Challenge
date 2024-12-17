const Joi = require('joi');

const createSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid('superadmin', 'schooladmin', 'user').optional(),
    school: Joi.string().optional().allow(null), 
});

const updateSchema = Joi.object({
    username: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    role: Joi.string().valid('superadmin', 'schooladmin', 'user').optional(),
    school: Joi.string().optional().allow(null), 
});

module.exports = {
    create: createSchema,
    update: updateSchema,
};
