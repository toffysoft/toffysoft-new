const mongoose = require("mongoose")
const _ = require("lodash")
const APIError = require("../utils/APIError")
const httpStatus = require("http-status")
const Schema = mongoose.Schema

const blogcategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true
  },
  creator: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  creator_name: {
    type: String,
    required: true,
    index: true
  },
  created: {
    type: Date,
    index: true
  }
})

blogcategorySchema.pre("save", function(next) {
  const utc = new Date()
  const now = utc.setHours(utc.getHours() + 7) // Set Time to Bangkok time

  this.updated = now

  if (!this.created) {
    this.created = now
  }

  next()
})

blogcategorySchema.method({
  transform() {
    const transformed = {}
    const fields = ["id", "name", "creator", "created"]

    fields.forEach(field => {
      transformed[field] = this[field] || ""
    })

    return transformed
  }
})

blogcategorySchema.statics = {
  list({
    page = 1,
    perpage = 5,
    sort = { id: "created", desc: true },
    id,
    name,
    creator_name
  }) {
    page = parseInt(page)
    perpage = parseInt(perpage)

    if (!_.isNil(name)) {
      name = new RegExp(name, "i")
    }
    if (!_.isNil(creator_name)) {
      creator_name = new RegExp(creator_name, "i")
    }

    const options = _.omitBy({ _id: id, name, creator_name }, _.isNil)
    let sortOption = {}
    sortOption[sort["id"]] = JSON.parse(sort["desc"]) === true ? -1 : 1

    return this.find(options)
      .populate([{ path: "creator", model: "User", select: "fullname id" }])
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
  totaldatacount({ id, name, creator_name }) {
    if (!_.isNil(name)) {
      name = new RegExp(name, "i")
    }
    if (!_.isNil(creator_name)) {
      creator_name = new RegExp(creator_name, "i")
    }

    const options = _.omitBy({ _id: id, name, creator_name }, _.isNil)

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
  checkDuplicateBlogCategory(error) {
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

module.exports = mongoose.model("BlogCategory", blogcategorySchema)
