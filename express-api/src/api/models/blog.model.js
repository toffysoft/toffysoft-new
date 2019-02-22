const mongoose = require("mongoose")
const _ = require("lodash")
const httpStatus = require("http-status")
const APIError = require("../utils/APIError")

const Schema = mongoose.Schema

const blogSchema = new Schema({
  title: { type: String, index: true, unique: true },
  cover: { type: String },
  description: { type: String },
  meta: { type: String },
  content: { type: String },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "BlogCategory",
    index: true
  },
  category_name: {
    type: String,
    ref: "BlogCategory",
    index: true
  },
  images: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Images",
    required: true
  },
  published: { type: Boolean, default: false, index: true },
  created: {
    type: Date,
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
  updated: {
    type: Date,
    index: true
  },
  updator: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  updator_name: {
    type: String,
    required: true,
    index: true
  },
  views: { type: Number, default: 1, index: true }
})

blogSchema.pre("save", function(next) {
  const utc = new Date()
  const now = utc.setHours(utc.getHours() + 7) // Set Time to Bangkok time

  this.updated = now

  if (!this.created) {
    this.created = now
  }

  next()
})

blogSchema.method({
  transform() {
    const transformed = {}
    const fields = [
      "id",
      "title",
      "cover",
      "meta",
      "description",
      "content",
      "category",
      "images",
      "published",
      "created",
      "creator",
      "updated",
      "updator",
      "views"
    ]

    fields.forEach(field => {
      transformed[field] = this[field] || ""
    })

    return transformed
  }
})

blogSchema.statics = {
  list({
    page = 1,
    perpage = 5,
    sort = { id: "created", desc: true },
    id,
    title,
    category_name,
    published,
    creator_name,
    updator_name
  }) {
    page = parseInt(page)
    perpage = parseInt(perpage)

    if (!_.isNil(title)) {
      title = new RegExp(title, "i")
    }
    if (!_.isNil(category_name)) {
      category_name = new RegExp(category_name, "i")
    }

    if (!_.isNil(updator_name)) {
      updator_name = new RegExp(updator_name, "i")
    }

    if (!_.isNil(creator_name)) {
      creator_name = new RegExp(creator_name, "i")
    }

    const options = _.omitBy(
      { _id: id, title, category_name, published, updator_name, creator_name },
      _.isNil
    )
    let sortOption = {}
    sortOption[sort["id"]] = JSON.parse(sort["desc"]) === true ? -1 : 1

    return this.find(options)
      .populate([
        { path: "images", model: "Images", select: "urls id" },
        { path: "category", model: "BlogCategory", select: "name id" },
        { path: "creator", model: "User", select: "-passwordhash -salt -__v" },
        { path: "updator", model: "User", select: "-passwordhash -salt -__v" }
      ])
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
  totaldatacount({
    id,
    title,
    category_name,
    published,
    creator_name,
    updator_name
  }) {
    if (!_.isNil(title)) {
      title = new RegExp(title, "i")
    }

    if (!_.isNil(updator_name)) {
      updator_name = new RegExp(updator_name, "i")
    }

    if (!_.isNil(creator_name)) {
      creator_name = new RegExp(creator_name, "i")
    }

    const options = _.omitBy(
      { _id: id, title, category_name, published, updator_name, creator_name },
      _.isNil
    )

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
  checkDuplicateBlogTitle(error) {
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

module.exports = mongoose.model("Blog", blogSchema)
