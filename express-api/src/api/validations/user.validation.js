const Joi = require("joi")
const HTTPError = require("http-errors")
const User = require("../models/user.model")
Joi.objectId = require("joi-objectid")(Joi)

module.exports = {
  // GET /json/users
  listuserValidate: (req, res, next) => {
    const data = req.query

    // define the validation schema
    const schema = Joi.object().keys({
      page: Joi.number().min(1),
      perpage: Joi.number()
        .min(1)
        .max(100),
      id: Joi.objectId(),
      username: Joi.string(),
      fullname: Joi.string(),
      email: Joi.string()
    })

    // validate the request data against the schema
    Joi.validate(data, schema, (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        return next(HTTPError(422, "Invalid request data"))
      } else {
        next()
      }
    })
  },

  // POST  /json/users
  adduserValidate: (req, res, next) => {
    const data = req.body

    // define the validation schema
    const schema = Joi.object().keys({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(128)
        .required()
        .label("username must only contain alpha-numeric characters"),
      fullname: Joi.string()
        .min(8)
        .required()
        .label("fullname  must be least 8 characters"),
      password: Joi.string()
        .regex(
          /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}/
        )
        .required()
        .label(
          "password must be least 8 chars and must be lower case chars and upper case chars and digit"
        ),
      // verifypassword: Joi.string()
      //   .valid(Joi.ref("password"))
      //   .required()
      //   .label("password and verifypassword not same "),
      email: Joi.string()
        .email()
        .required()
        .label("email invalid or email format mistake"),
      permission: Joi.string()
        // .valid(User.permissions)
        .valid(["admin", "superuser", "user"])
        // .required()
        .label("permission invalid or permission format mistake")
    })

    // validate the request data against the schema
    Joi.validate(data, schema, (err, value) => {
      if (err) {
        // send a 422 error response if validation fails
        if (err.details[0].context.key) {
          return next(HTTPError(422, err.details[0].context.key))
        }

        return next(HTTPError(422, "Invalid request data"))
      } else {
        next()
      }
    })
  },

  // PUT  /json/users
  updateuserValidate: (req, res, next) => {
    const data = req.body

    // define the validation schema
    const schema = Joi.object().keys({
      id: Joi.objectId()
        .required()
        .label("Invalid ID or mistake"),
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(128)
        .label("username must only contain alpha-numeric characters"),
      fullname: Joi.string()
        .min(8)
        .label("fullname  must be least 8 characters"),
      changepassword: Joi.boolean().label("Invalid changepassword"),
      password: Joi.string().when("changepassword", {
        is: true,
        then: Joi.string()
          .regex(
            /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}/
          )
          .required()
          .label(
            "password must be least 8 chars and must be lower case chars and upper case chars and digit"
          )
      }),
      // verifypassword: Joi.string()
      //   .valid(Joi.ref("password"))
      //   .label("password and verifypassword not same "),
      permission: Joi.string()
        // .valid(User.permissions)
        .valid(["admin", "superuser", "user"])
        .label("permission invalid or permission format mistake")
    })

    // validate the request data against the schema
    Joi.validate(data, schema, (err, value) => {
      if (err) {
        // send a 422 error response if validation fails

        if (err.details[0].context.label) {
          return next(HTTPError(422, err.details[0].context.label))
        }

        return next(HTTPError(422, "Invalid request data"))
      } else {
        next()
      }
    })
  },

  // DELETE  /json/users
  deleteuserValidate: (req, res, next) => {
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
        // send a 422 error response if validation fails
        return next(HTTPError(422, "Invalid request data"))
      } else {
        next()
      }
    })
  }
}
