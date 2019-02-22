const express = require("express")
const { public, authorize } = require("../middlewares/auth")
const Images = require("../controllers/images.controller")
const Blog = require("../controllers/blog.controller")
const {
  listblogValidate,
  addblogValidate,
  updateblogValidate
} = require("../validations/blog.validation")

const router = express.Router()

router
  .route("/")
  .get(public, authorize(), listblogValidate, Blog.list)
  .post(
    authorize(["superuser", "admin", "dev"]),
    addblogValidate,
    Images.add,
    Blog.add
  )
  .put(
    authorize(["superuser", "admin", "dev"]),
    updateblogValidate,
    Blog.update
  )

module.exports = router
