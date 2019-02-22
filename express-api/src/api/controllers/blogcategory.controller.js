const mongoose = require("mongoose")
const BlogCategory = require("../models/blogcategory.model")
const _ = require("lodash")
const HTTPError = require("http-errors")

const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.blogcategory")

exports.list = async (req, res, next) => {
  try {
    let result = {}
    let currentPage = req.query.page || 1

    const blogcategories = await BlogCategory.list(req.query)

    if (blogcategories.length === 0) {
      return next(HTTPError(404, "No blogcategory Found."))
    }
    const blogcategoryTransform = blogcategories.map(user => user.transform())
    result.referencedata = blogcategoryTransform

    result.currentpage = currentPage

    const totalblogcategory = await BlogCategory.totaldatacount(req.query)
    result.totaldata = totalblogcategory

    return res.json(result)
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}

exports.add = async (req, res, next) => {
  try {
    const newBlogCategory = new BlogCategory()
    newBlogCategory.name = req.body.name
    newBlogCategory.creator = req.user.id
    newBlogCategory.creator_name = req.user.fullname

    const referblogcategory = await newBlogCategory.save()

    res.status(201).json({
      success: true,
      message: "create blogcategory success",
      referencedata: referblogcategory.transform()
    })
  } catch (error) {
    Logger.error(error)

    // if (error.name === "MongoError" && error.code === 11000) {
    //   next(HTTPError(422, "username or email have been already existing"))
    // } else {
    //   next(error)
    // }
    return next(BlogCategory.checkDuplicateBlogCategory(error))
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
      const blogcategory = await BlogCategory.deleteMulti(value)
      if (blogcategory.n === 0) {
        return next(new HTTPError.NotFound("No blogcategory Found."))
      }
      res.json({
        success: true,
        message: "delete blogcategory success"
      })
    } catch (error) {
      Logger.error(error)
      next(error)
    }
  } else {
    try {
      const blogcategory = await BlogCategory.deleteOne(value)
      if (!blogcategory) {
        return next(new HTTPError.NotFound("No blogcategory Found."))
      }
      res.json({
        success: true,
        message: "delete blogcategory success"
      })
    } catch (error) {
      Logger.error(error)
      next(error)
    }
  }
}
