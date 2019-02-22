const mongoose = require("mongoose")
const User = require("../models/user.model")
const _ = require("lodash")
const HTTPError = require("http-errors")

const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.user")

/**
 * Get User list
 * @public
 */

exports.list = async (req, res, next) => {
  try {
    let result = {}
    let currentPage = req.query.page || 1

    const users = await User.list(req.query)

    if (users.length === 0) {
      return next(HTTPError(404, "No user Found."))
    }
    const usersTransform = users.map(user => user.transform())
    result.referencedata = usersTransform

    result.currentpage = currentPage

    const totalusers = await User.totaldatacount(req.query)
    result.totaldata = totalusers

    return res.json(result)
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}

/**
 * Create User
 * @private
 * authorized only admin
 */
exports.add = async (req, res, next) => {
  // if (!(req.body.password === req.body.verifypassword)) {
  //   return next(HTTPError(422, "Passwords do not match"))
  // }

  try {
    const newUser = new User()
    newUser.username = req.body.username
    newUser.fullname = req.body.fullname
    newUser.email = req.body.email.toLowerCase()
    newUser.setPassword(req.body.password)
    newUser.permission = req.body.permission ? req.body.permission : "user"

    const referuser = await newUser.save()

    res.status(201).json({
      success: true,
      message: "create user success",
      referencedata: referuser.transform()
    })
  } catch (error) {
    Logger.error(error)

    // if (error.name === "MongoError" && error.code === 11000) {
    //   next(HTTPError(422, "username or email have been already existing"))
    // } else {
    //   next(error)
    // }
    return next(User.checkDuplicateEmailOrUserName(error))
  }
}

/**
 * Update User
 * @private
 * authorized only admin
 */
exports.update = async (req, res, next) => {
  if (_.isNil(req.body.id) || !mongoose.Types.ObjectId.isValid(req.body.id)) {
    return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
  }

  try {
    let find_id = req.body.id
    const user = await User.findOne({ _id: find_id })

    if (!user) {
      return next(HTTPError(404, "User Not Found."))
    }

    if (req.body.changepassword === true) {
      if (req.body.password === req.body.verifypassword) {
        user.setPassword(req.body.password)
      } else {
        return next(HTTPError(422, "Passwords do not match"))
      }
    }

    if (!_.isNil(req.body.username)) {
      user.username = req.body.username
    }
    if (!_.isNil(req.body.fullname)) {
      user.fullname = req.body.fullname
    }

    user.permission = req.body.permission

    const referuser = await user.save()

    res.json({
      success: true,
      message: "update user success",
      referencedata: referuser.transform()
    })
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}

/**
 * Delete player
 * @private
 * authorized only admin
 */
exports.delete = async (req, res, next) => {
  if (_.isArray(req.body.id)) {
    req.body.id.forEach(objcheck => {
      if (!mongoose.Types.ObjectId.isValid(objcheck)) {
        return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
      }
    })
  } else {
    if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
      return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
    }
  }

  let value = req.body.id
  if (value instanceof Array) {
    try {
      const users = await User.deleteMulti(value)
      if (users.n === 0) {
        return next(new HTTPError.NotFound("No user Found."))
      }
      res.json({
        success: true,
        message: "delete user success"
      })
    } catch (error) {
      Logger.error(error)
      next(error)
    }
  } else {
    try {
      const users = await User.deleteOne(value)
      if (!users) {
        return next(new HTTPError.NotFound("No user Found."))
      }
      res.json({
        success: true,
        message: "delete user success"
      })
    } catch (error) {
      Logger.error(error)
      next(error)
    }
  }
}
