const mongoose = require("mongoose")
const Blog = require("../models/blog.model")
const _ = require("lodash")
const HTTPError = require("http-errors")
const namor = require("namor")
const { API_SECRET } = require("../../config/vars")

const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.blog")

exports.list = async (req, res, next) => {
  // Bug public datacount
  try {
    let isID = !_.isNil(req.query.id)
    let isPublic = req.user && req.user.permission === "public"

    if (isID && isPublic) {
      if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
        return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
      }

      let find_id = req.query.id

      const blog = await Blog.findOne({ _id: find_id })

      if (!blog) {
        return next(HTTPError(404, "Blog Not Found."))
      }

      if (!blog.published) {
        return next(HTTPError(404, "Blog Not Found."))
      }

      blog.views++

      const referblog = await blog.save()
    }

    let result = {}
    let currentPage = req.query.page || 1

    const blogs = await Blog.list(req.query)

    if (blogs.length === 0) {
      return next(HTTPError(404, "No blog Found."))
    }

    const blogsTransform = blogs.map(blog => blog.transform())

    result.referencedata = blogsTransform

    result.currentpage = currentPage

    const totalblogs = await Blog.totaldatacount(req.query)
    result.totaldata = totalblogs

    return res.json(result)
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}

exports.add = async (req, res, next) => {
  try {
    const newBlog = new Blog()

    newBlog.images = res.locals.referimages
    newBlog.title = `${namor.generate({
      words: 1,
      numbers: 2
    })} (Example Title)`
    newBlog.creator = req.user.id
    newBlog.creator_name = req.user.fullname
    newBlog.updator = req.user.id
    newBlog.updator_name = req.user.fullname

    const referblog = await newBlog.save()
    const result = await Blog.list({ id: referblog.id })

    // const resdata

    res.status(201).json({
      success: true,
      message: "create blog success",
      referencedata: result[0].transform()
    })
  } catch (error) {
    Logger.error(error)

    // if (error.name === "MongoError" && error.code === 11000) {
    //   next(HTTPError(422, "username or email have been already existing"))
    // } else {
    //   next(error)
    // }
    return next(Blog.checkDuplicateBlogTitle(error))
  }
}

/**
 * Update Blog
 * @private
 * authorized only admin
 */
exports.update = async (req, res, next) => {
  if (_.isNil(req.body.id) || !mongoose.Types.ObjectId.isValid(req.body.id)) {
    return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
  }

  try {
    let find_id = req.body.id
    const blog = await Blog.findOne({ _id: find_id })

    if (!blog) {
      return next(HTTPError(404, "Blog Not Found."))
    }

    blog.updator = req.user.id
    blog.updator_name = req.user.fullname

    if (!_.isNil(req.body.title)) {
      blog.title = req.body.title
    }

    if (!_.isNil(req.body.cover)) {
      blog.cover = req.body.cover
    }

    if (!_.isNil(req.body.description)) {
      blog.description = req.body.description
    }

    if (!_.isNil(req.body.meta)) {
      blog.meta = req.body.meta
    }

    if (!_.isNil(req.body.content)) {
      blog.content = req.body.content
    }

    if (
      !_.isNil(req.body.category) &&
      mongoose.Types.ObjectId.isValid(req.body.category)
    ) {
      blog.category = req.body.category
    }

    if (!_.isNil(req.body.published)) {
      blog.published = req.body.published
    }

    const referblog = await blog.save()

    res.json({
      success: true,
      message: "update blog success",
      referencedata: referblog.transform()
    })
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}
