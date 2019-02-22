const Joi = require("joi")

const HTTPError = require("http-errors")
const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.images")

Joi.objectId = require("joi-objectid")(Joi)

module.exports = {
  // listimagesValidate: (req, res, next) => {
  //   const data = req.query

  //   const schema = Joi.object().keys({
  //     id: Joi.objectId().required()
  //   })
  //   // validate the request data against the schema
  //   Joi.validate(data, schema, (err, value) => {
  //     if (err) {
  //       // send a 422 error response if validation fails
  //       return next(HTTPError(422, "Invalid request data"))
  //     } else {
  //       next()
  //     }
  //   })
  // },
  deleteimagesValidate: (req, res, next) => {
    const data = req.body

    const schema = Joi.object().keys({
      id: Joi.objectId().required(),
      image: Joi.string().required()
    })
    // validate the request data against the schema
    Joi.validate(data, schema, (err, value) => {
      if (err) {
        Logger.error(err)
        // send a 422 error response if validation fails
        return next(HTTPError(422, "Invalid request data"))
      } else {
        next()
      }
    })
  }
}
