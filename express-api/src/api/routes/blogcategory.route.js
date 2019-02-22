const express = require("express")
const router = express.Router()
const { authorize } = require("../middlewares/auth")
const BlogCategory = require("../controllers/blogcategory.controller")
const {
  listblogcategoryValidate,
  addblogcategoryValidate,
  deleteblogcategoryValidate
} = require("../validations/blogcategory.validation")

router
  .route("/")
  .get(
    authorize(["superuser", "admin", "dev"]),
    listblogcategoryValidate,
    BlogCategory.list
  )
  .post(authorize(["admin", "dev"]), addblogcategoryValidate, BlogCategory.add)
  .delete(
    authorize(["admin", "dev"]),
    deleteblogcategoryValidate,
    BlogCategory.delete
  )

module.exports = router
