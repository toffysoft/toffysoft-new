const express = require("express")
const userRoutes = require("./user.route")
const authRoutes = require("./auth.route")
const blogcategoryRoutes = require("./blogcategory.route")
const blogRoutes = require("./blog.route")
const imagesRoutes = require("./images.route")
const router = express.Router()

/**
 * GET /
 */
router.get("/", (req, res) => {
  // console.log(req.get("User-Agent"))
  return res
    .status(200)
    .json({ message: "Welcome to API" })
    .end()
})

router.use("/users", userRoutes)
router.use("/auth", authRoutes)
router.use("/blogcategory", blogcategoryRoutes)
router.use("/blogs", blogRoutes)
router.use("/images", imagesRoutes)

module.exports = router
