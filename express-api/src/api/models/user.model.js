const mongoose = require("mongoose")
const crypto = require("crypto")
const { isEmail } = require("../utils/validator")
const _ = require("lodash")
const Schema = mongoose.Schema
const APIError = require("../utils/APIError")
const httpStatus = require("http-status")

const permissions = ["dev", "admin", "superuser", "user"]

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  fullname: {
    type: String,
    trim: true,
    required: true,
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true,
    validate: {
      validator: value => {
        return isEmail(value)
      },
      message: "This is not a valid email"
    }
  },
  passwordhash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  permission: {
    type: String,
    enum: permissions,
    default: "user",
    required: true
  },
  last_ip: String,
  created: {
    type: Date,
    index: true
  },
  updated: {
    type: Date,
    index: true
  }
})

userSchema.pre("save", function(next) {
  const utc = new Date()
  const now = utc.setHours(utc.getHours() + 7) // Set Time to Bangkok time

  this.updated = now

  if (!this.created) {
    this.created = now
  }

  next()
})

userSchema.method({
  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString("hex")
    this.passwordhash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex")
  },

  validPassword(password) {
    let passwordhash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex")
    return this.passwordhash === passwordhash
  },

  transform() {
    const transformed = {}
    const fields = [
      "id",
      "username",
      "fullname",
      "email",
      "permission",
      "last_ip",
      "created",
      "updated"
    ]

    fields.forEach(field => {
      transformed[field] = this[field] || ""
    })

    return transformed
  }
})

userSchema.statics = {
  permissions,

  list({
    page = 1,
    perpage = 32,
    sort = { id: "created", desc: true },
    id,
    username,
    fullname,
    email
  }) {
    page = parseInt(page)
    perpage = parseInt(perpage)

    if (!_.isNil(username)) {
      username = new RegExp(username, "i")
    }

    if (!_.isNil(fullname)) {
      fullname = new RegExp(fullname, "i")
    }

    if (!_.isNil(email)) {
      email = new RegExp(email, "i")
    }

    const options = _.omitBy({ _id: id, username, fullname, email }, _.isNil)

    let sortOption = {}
    sortOption[sort["id"]] = JSON.parse(sort["desc"]) === true ? -1 : 1

    return this.find(options)
      .sort(sortOption)
      .skip(perpage * (page - 1))
      .limit(perpage)
      .exec()
  },
  deleteOne(id) {
    return this.findOneAndDelete({ _id: id })
  },
  deleteMulti(id_Array) {
    return this.deleteMany({ _id: { $in: id_Array } })
  },
  totaldatacount({ id, username, fullname, email }) {
    if (!_.isNil(username)) {
      username = new RegExp(username, "i")
    }

    if (!_.isNil(fullname)) {
      fullname = new RegExp(fullname, "i")
    }

    if (!_.isNil(email)) {
      email = new RegExp(email, "i")
    }

    const options = _.omitBy({ _id: id, username, fullname, email }, _.isNil)

    return this.find(options)
      .countDocuments()
      .exec()
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmailOrUserName(error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return new APIError({
        message: `Duplicate Error`,
        errors: {
          field: `${error.errmsg.split("index: ")[1].split("_1 ")[0]}`,
          location: "body",
          messages: `${
            error.errmsg.split("{ :")[1].split(" }")[0]
          } already exists`
        },
        status: httpStatus.UNPROCESSABLE_ENTITY,
        isPublic: true,
        stack: error.stack
      })
    }
    return error
  }
}

module.exports = mongoose.model("User", userSchema)
