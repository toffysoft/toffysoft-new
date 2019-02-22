const mongoose = require("mongoose")
const Images = require("../models/images.model")
const _ = require("lodash")
const HTTPError = require("http-errors")
const fs = require("fs")
const { base_url, port, env } = require("../../config/vars")

const setlogger = require("../../config/logger")
let Logger = setlogger("controllers.images")

// exports.list = async (req, res, next) => {
//   if (_.isNil(req.query.id) || !mongoose.Types.ObjectId.isValid(req.query.id)) {
//     return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
//   }

//   try {
//     let result = {}
//     let currentPage = 1
//     let find_id = req.query.id

//     const imagesList = await Images.list({ id: find_id })

//     if (imagesList.length === 0) {
//       return next(HTTPError(404, "No images Found."))
//     }
//     const imagesListTransform = imagesList.map(images => images.transform())
//     result.referencedata = imagesListTransform

//     result.currentpage = currentPage

//     const totalimages = 1
//     result.totaldata = totalimages

//     return res.json(result)
//   } catch (error) {
//     Logger.error(error)
//     next(error)
//   }
// }

exports.add = async (req, res, next) => {
  try {
    const newImages = new Images()
    newImages.urls = []

    const referimages = await newImages.save()
    res.locals.referimages = referimages
    return next()
  } catch (error) {
    Logger.error(error)

    return next(HTTPError(500, "Can not create new images"))
  }
}

/**
 * Update Images
 * @private
 * authorized only superuser admin
 */
exports.update = async (req, res, next) => {
  if (_.isNil(req.body.id) || !mongoose.Types.ObjectId.isValid(req.body.id)) {
    return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
  }

  try {
    let find_id = req.body.id

    const images = await Images.findOne({ _id: find_id })

    if (!images) {
      return next(HTTPError(404, "Images ID Not Found."))
    }

    let filename = req.files.file[0].filename
    let fullpath = `/images/${filename}`
    let urls = images.urls

    urls.push(fullpath)

    images.urls = urls

    const updatedImages = await images.save()

    let returnLink = ""

    if (env === "development") {
      returnLink = `${base_url}${":" + port}${fullpath}`
    } else {
      returnLink = base_url + fullpath
    }

    res.json({
      success: true,
      message: `upload {image : ${filename}} success`,
      data: { link: returnLink }
    })
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}

exports.delete = async (req, res, next) => {
  if (_.isNil(req.body.id) || !mongoose.Types.ObjectId.isValid(req.body.id)) {
    return next(new HTTPError.BadRequest("Bad ID Parameter Request"))
  }
  try {
    let find_id = req.body.id
    let image = req.body.image

    const images = await Images.findOne({ _id: find_id })

    if (!images) {
      return next(HTTPError(404, "Images Not Found."))
    }

    let urls = images.urls

    if (!urls.includes(image))
      return next(HTTPError(404, "Image parameter not found in urls."))

    if (!fs.existsSync(`..${image}`))
      return next(HTTPError(404, `${image} not exists!!`))

    fs.unlinkSync(`..${image}`)
    Logger.info(`${image} was deleted!`)

    let newUrls = urls.filter(url => url !== image)
    images.urls = newUrls

    const referImages = await images.save()

    res.json({
      success: true,
      message: "delete images success"
      // referencedata: referImages.transform()
    })
  } catch (error) {
    Logger.error(error)
    next(error)
  }
}
