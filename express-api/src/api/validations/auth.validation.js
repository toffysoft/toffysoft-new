const Joi = require("joi")
const HTTPError = require("http-errors")
// const User = require("../models/user")
Joi.objectId = require("joi-objectid")(Joi)

module.exports = {
  // POST  /json/auth/login
  loginValidate: (req, res, next) => {
    const data = req.body

    // define the validation schema
    const schema = Joi.object().keys({
      login: Joi.string()
        .required()
        .label("login name invalid"),
      password: Joi.string()
        .required()
        .label("password invalid"),
      rememberme: Joi.boolean().label(
        "rememberme invalid or rememberme not boolean"
      )
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
  }

  //   // POST  /json/auth/forgot-password
  //   forgotPasswordValidate: (req, res, next) => {
  //     const data = req.body

  //     // define the validation schema
  //     const schema = Joi.object().keys({
  //       email: Joi.string()
  //         .email()
  //         .required()
  //         .label("email invalid or email format mistake")
  //     })

  //     // validate the request data against the schema
  //     Joi.validate(data, schema, (err, value) => {
  //       if (err) {
  //         // send a 422 error response if validation fails

  //         if (err.details[0].context.label) {
  //           return next(HTTPError(422, err.details[0].context.label))
  //         }

  //         return next(HTTPError(422, "Invalid request data"))
  //       } else {
  //         next()
  //       }
  //     })
  //   },

  //   // POST  /json/auth/reset-password
  //   resetPasswordValidate: (req, res, next) => {
  //     const data = req.body

  //     // define the validation schema
  //     const schema = Joi.object().keys({
  //       password: Joi.string()
  //         .regex(
  //           /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}/
  //         )
  //         .required()
  //         .label(
  //           "password must be least 8 chars and must be lower case chars and upper case chars and digit"
  //         ),
  //       verifypassword: Joi.string()
  //         .valid(Joi.ref("password"))
  //         .required()
  //         .label("password and verifypassword not same "),
  //       email: Joi.string()
  //         .email()
  //         .required()
  //         .label("email invalid or email format mistake"),
  //       resettoken: Joi.string()
  //         .required()
  //         .label("permission invalid or permission format mistake")
  //     })

  //     // validate the request data against the schema
  //     Joi.validate(data, schema, (err, value) => {
  //       if (err) {
  //         // send a 422 error response if validation fails

  //         if (err.details[0].context.label) {
  //           return next(HTTPError(422, err.details[0].context.label))
  //         }

  //         return next(HTTPError(422, "Invalid request data"))
  //       } else {
  //         next()
  //       }
  //     })
  //   },

  //   // POST  /json/auth/change-password
  //   changePasswordValidate: (req, res, next) => {
  //     const data = req.body

  //     // define the validation schema
  //     const schema = Joi.object().keys({
  //       password: Joi.string()
  //         .regex(
  //           /^(?:(?=.*[a-z])(?:(?=.*[A-Z])(?=.*[\d\W])|(?=.*\W)(?=.*\d))|(?=.*\W)(?=.*[A-Z])(?=.*\d)).{8,}/
  //         )
  //         .required()
  //         .label(
  //           "password must be least 8 chars and must be lower case chars and upper case chars and digit"
  //         ),
  //       verifypassword: Joi.string()
  //         .valid(Joi.ref("password"))
  //         .required()
  //         .label("password and verifypassword not same ")
  //     })

  //     // validate the request data against the schema
  //     Joi.validate(data, schema, (err, value) => {
  //       if (err) {
  //         // send a 422 error response if validation fails

  //         if (err.details[0].context.label) {
  //           return next(HTTPError(422, err.details[0].context.label))
  //         }

  //         return next(HTTPError(422, "Invalid request data"))
  //       } else {
  //         next()
  //       }
  //     })
  //   }
}
