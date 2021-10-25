
const Joi = require('joi')

const createTodoSchema = Joi.object({
    name: Joi.string().min(5).required(),
    description: Joi.string().min(5).required(),
    accomplished: Joi.string().required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().required()
});

module.exports = createTodoSchema;