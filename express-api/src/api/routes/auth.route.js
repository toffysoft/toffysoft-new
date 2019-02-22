const express = require("express")
const router = express.Router()
const passport = require("passport")
const HTTPError = require("http-errors")
const httpStatus = require("http-status")
// const {
//   forgot_password,
//   reset_password,
//   change_password
// } = require('../controllers/password');
const {
  loginValidate
  // forgotPasswordValidate,
  // resetPasswordValidate,
  // changePasswordValidate
} = require("../validations/auth.validation")
const APIError = require("../utils/APIError")
const setlogger = require("../../config/logger")

let Logger = setlogger("routes.auth")

router.route("/login").post(loginValidate, (req, res, next) => {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      Logger.error(err)
      return next(err)
    }
    if (!user) {
      //login fail  email or password mistake
      return next(HTTPError(404, "login fail : not found"))
    }

    req.login(user, function(err) {
      if (err) {
        Logger.error(err)
        return next(err)
      }

      if (req.body.rememberme) {
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000 // 365*24*60*60*1000 Rememeber 'me' for 365 days
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000 //  24*60*60*1000  for 1 days
      }

      let referencedata = {
        id: req.user._id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        permission: user.permission,
        last_ip: user.last_ip,
        updated: user.updated,
        created: user.created
      }

      //login success
      return res.json({
        success: true,
        message: "login success",
        referencedata
      })
    })
  })(req, res, next)
})

router.route("/logout").get((req, res) => {
  req.logout()
  res.status(200).json({
    success: true,
    message: "logout success"
  })
})

// router
//   .route('/forgot-password')
//   .post(forgotPasswordValidate, forgot_password)

// router
//   .route('/reset-password')
//   .post(resetPasswordValidate, reset_password)

// router
//   .route('/change-password')
//   .post(isLoggedIn, changePasswordValidate, change_password)

router.route("/profile").get(isLoggedIn, (req, res) => {
  let referencedata = {
    id: req.user._id,
    username: req.user.username,
    fullname: req.user.fullname,
    email: req.user.email,
    permission: req.user.permission,
    last_ip: req.user.last_ip,
    updated: req.user.updated,
    created: req.user.created
  }
  res.status(200).json(referencedata)
})

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  const apiError = new APIError({
    message: "Unauthorized",
    status: httpStatus.UNAUTHORIZED,
    stack: undefined
  })

  if (req.isAuthenticated()) return next()

  return next(apiError)
}

module.exports = router
