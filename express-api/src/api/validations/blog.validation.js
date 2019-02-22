const Joi = require("joi")
const HTTPError = require("http-errors")

const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.blogvalidate")

Joi.objectId = require("joi-objectid")(Joi)

module.exports = {
  //GET   /api/blogs
  listblogValidate: (req, res, next) => {
    const data = req.query

    // define the validation schema
    const schema = Joi.object().keys({
      page: Joi.number().min(1),
      perpage: Joi.number()
        .min(1)
        .max(100),
      id: Joi.objectId(),
      title: Joi.string(),
      creator_name: Joi.string(),
      category_name: Joi.string(),
      updator_name: Joi.string(),
      published: Joi.boolean(),
      sort: Joi.object().keys({
        id: Joi.string().valid([
          "title",
          "category_name",
          "created",
          "creator_name",
          "updated",
          "updator_name",
          "published",
          "views"
        ]),
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
  //POST   /api/blogs
  addblogValidate: (req, res, next) => {
    const data = req.body

    // define the validation schema
    const schema = Joi.object().keys({})

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

  //PUT    /api/blogs
  updateblogValidate: (req, res, next) => {
    const data = req.body
    // define the validation schema
    const schema = Joi.object().keys({
      id: Joi.objectId().required(),
      title: Joi.string(),
      cover: Joi.string(),
      description: Joi.string().allow(""),
      meta: Joi.string().allow(""),
      content: Joi.string().allow(""),
      published: Joi.boolean(),
      category: Joi.objectId()
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
