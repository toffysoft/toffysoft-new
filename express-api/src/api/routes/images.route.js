const express = require("express")
const mongoose = require("mongoose")
const { authorize } = require("../middlewares/auth")
const Images = require("../controllers/images.controller")
const ImagesModel = require("../models/images.model")
const moment = require("moment")
const _ = require("lodash")
const path = require("path")
const HTTPError = require("http-errors")

const {
  // listimagesValidate,
  deleteimagesValidate
} = require("../validations/images.validation")

const router = express.Router()

const multer = require("multer")

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "../images") //Destination folder
  },
  filename: function(req, file, cb) {
    const utc = new Date()
    const now = utc.setHours(utc.getHours() + 7) // Set Time to Bangkok time
    const time = moment(now)
      .subtract(7, "hours")
      .format("MMDDYYkkmmss")

    const filename = file.originalname.split(".")[0]

    const fileObj = {
      "image/png": ".png",
      "image/jpeg": ".jpeg",
      "image/jpg": ".jpg",
      "image/gif": ".gif",
      "image/svg+xml": ".svg"
    }
    cb(null, `${filename}-${time}${fileObj[file.mimetype]}`) //File name after saving
  }
})

const upload = multer({
  storage: storage,
  fileFilter: async function(req, file, callback) {
    if (_.isNil(req.body.id) || !mongoose.Types.ObjectId.isValid(req.body.id)) {
      return callback(new HTTPError.BadRequest("Bad ID Parameter Request"))
    }
    try {
      let find_id = req.body.id

      const images = await ImagesModel.findOne({ _id: find_id })

      if (!images) {
        return callback(HTTPError(404, "Images ID Not Found."))
      }
      let ext = path.extname(file.originalname)
      if (
        ext !== ".png" &&
        ext !== ".jpg" &&
        ext !== ".gif" &&
        ext !== ".jpeg" &&
        ext !== ".svg"
      ) {
        return callback(new HTTPError(422, "This file is not images"))
      }
      callback(null, true)
    } catch (error) {
      return callback(error)
    }
  }
})

const Upload = upload.fields([{ name: "file", maxCount: 1 }])

router
  .route("/")
  // .get(authorize(["dev"]), listimagesValidate, Images.list)
  .put(authorize(["superuser", "admin", "dev"]), Upload, Images.update)
  .delete(authorize(["admin", "dev"]), deleteimagesValidate, Images.delete)

module.exports = router
