const Joi = require('joi');
const { school } = require('../../_common/schema.models');

const createSchema = Joi.object({
    name: Joi.string().required(),
    school: Joi.string().required(),
    capacity: Joi.number().integer().required(),
    resources: Joi.array().items(Joi.string()).optional(),
});

const updateSchema = Joi.object({
    name: Joi.string().optional(),
    school: Joi.string().optional(),
    capacity: Joi.number().integer().optional(),
    resources: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
    create: createSchema,
    update: updateSchema,
};