const HTTPError = require("http-errors")
const { API_SECRET } = require("../../config/vars")
// const User = require("../models/user")

exports.public = (req, res, next) => {
  if (req.isAuthenticated() || req.user) return next()
  //Authorization check
  if (req.headers["authorization"] == API_SECRET) {
    req.user = {}

    req.user.permission = "public"
    return next()
  }

  return next(HTTPError(401, "unauthorized"))
}

exports.authorize = (
  userallow = ["public", "user", "admin", "superuser", "dev"]
) => (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return next(HTTPError(401, "unauthorized"))
  }

  let userpermission = req.user.permission
  if (!userallow.includes(userpermission)) {
    return next(HTTPError(403, "Forbidden"))
  }

  return next()
}
