const Joi = require('joi')
const { StatusCodes } = require('http-status-codes');
//* Include all validators
const Validators = require('../validators')

module.exports = function(validator) {
    if(!Validators.hasOwnProperty(validator))
        throw new Error(`'${validator}' validator is not exist`)

    return async function(req, res, next) {
        const validated = await Validators[validator].validateAsync(req.body)
        req.body = validated
        next()
    }
}