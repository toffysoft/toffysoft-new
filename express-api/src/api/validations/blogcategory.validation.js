const Joi = require("joi")
const HTTPError = require("http-errors")
const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.blogcategoryvalidate")
Joi.objectId = require("joi-objectid")(Joi)

module.exports = {
  //GET   /api/blogcategory
  listblogcategoryValidate: (req, res, next) => {
    const data = req.query

    // define the validation schema
    const schema = Joi.object().keys({
      page: Joi.number().min(1),
      perpage: Joi.number()
        .min(1)
        .max(100),
      id: Joi.objectId(),
      name: Joi.string(),
      creator_name: Joi.string(),
      sort: Joi.object().keys({
        id: Joi.string().valid(["name", "creator_name", "created"]),
        desc: Joi.boolean()
      })
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
  },

  //POST    /api/blogcategory
  addblogcategoryValidate: (req, res, next) => {
    const data = req.body
    // define the validation schema
    const schema = Joi.object().keys({
      name: Joi.string().required()
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
  },

  //DELETE    /api/blogcategory
  deleteblogcategoryValidate: (req, res, next) => {
    const data = req.body
    // define the validation schema
    const schema = Joi.object().keys({
      id: Joi.alternatives([
        Joi.objectId(),
        Joi.array().items(Joi.objectId())
      ]).required()
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
