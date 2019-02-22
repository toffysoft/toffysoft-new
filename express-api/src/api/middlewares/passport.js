// load all the things we need
const LocalStrategy = require("passport-local").Strategy
const HTTPError = require("http-errors")
const { isEmail } = require("../utils/validator")

// load up the user model
const User = require("../models/user.model")

const setlogger = require("../../config/logger")
let Logger = setlogger("middlewares.passport")

module.exports = passport => {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      return done(null, user)
    } catch (err) {
      Logger.error(err)
      return done(err)
    }
  })
  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use(
    new LocalStrategy(
      {
        // by default, local strategy uses username and password, we will override with email
        usernameField: "login",
        passwordField: "password",
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      },
      (req, username, password, done) => {
        let opt
        if (isEmail(username)) {
          opt = {
            email: username.toLowerCase() // Use lower-case e-mails to avoid case-sensitive e-mail matching
          }
        } else {
          opt = {
            username
          }
        }

        // asynchronous
        process.nextTick(function() {
          User.findOne(opt, function(err, user) {
            // if there are any errors, return the error
            if (err) {
              Logger.error(err)
              return done(err)
            }

            // if no user is found, return the message
            if (!user) return done(null, false)

            if (!user.validPassword(password)) {
              return done(
                HTTPError(401, "login fail : incorrect password"),
                false
              )

              // all is well, return user
            } else {
              let ip = (
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress
              ).split(",")[0]

              user.last_ip = ip

              user.save(function(err) {
                if (err) {
                  Logger.error(err)
                  return done(err)
                }
                // saved!
                return done(null, user)
              })
            }
          })
        })
      }
    )
  )
}
