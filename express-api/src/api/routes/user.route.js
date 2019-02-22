const express = require("express")
const router = express.Router()
const Usercontroller = require("../controllers/user.controller")
const { authorize } = require("../middlewares/auth")
const {
  listuserValidate,
  adduserValidate,
  updateuserValidate,
  deleteuserValidate
} = require("../validations/user.validation")

/* GET ALL User */
router
  .route("/")
  // /**
  //  * @api {get} json/users List Users
  //  * @apiDescription Get a list of users
  //  * @apiVersion 1.0.0
  //  * @apiName ListUsers
  //  * @apiGroup User
  //  * @apiPermission admin
  //  *
  //  * @apiHeader {String} Authorization   User's access token
  //  *
  //  * @apiParam  {Number{1-}}         [page=1]     List page
  //  * @apiParam  {Number{1-100}}      [perPage=1]  Users per page
  //  * @apiParam  {String}             [name]       User's name
  //  * @apiParam  {String}             [email]      User's email
  //  * @apiParam  {String=user,admin}  [role]       User's role
  //  *
  //  * @apiSuccess {Object[]} users List of users.
  //  *
  //  * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
  //  * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
  //  */
  .get(
    authorize(["superuser", "admin", "dev"]),
    listuserValidate,
    Usercontroller.list
  )
  // /**
  //  * @api {post} v1/users Create User
  //  * @apiDescription Create a new user
  //  * @apiVersion 1.0.0
  //  * @apiName CreateUser
  //  * @apiGroup User
  //  * @apiPermission admin
  //  *
  //  * @apiHeader {String} Authorization   User's access token
  //  *
  //  * @apiParam  {String}             email     User's email
  //  * @apiParam  {String{6..128}}     password  User's password
  //  * @apiParam  {String{..128}}      [name]    User's name
  //  * @apiParam  {String=user,admin}  [role]    User's role
  //  *
  //  * @apiSuccess (Created 201) {String}  id         User's id
  //  * @apiSuccess (Created 201) {String}  name       User's name
  //  * @apiSuccess (Created 201) {String}  email      User's email
  //  * @apiSuccess (Created 201) {String}  role       User's role
  //  * @apiSuccess (Created 201) {Date}    createdAt  Timestamp
  //  *
  //  * @apiError (Bad Request 400)   ValidationError  Some parameters may contain invalid values
  //  * @apiError (Unauthorized 401)  Unauthorized     Only authenticated users can create the data
  //  * @apiError (Forbidden 403)     Forbidden        Only admins can create the data
  //  */
  .post(authorize(["admin", "dev"]), adduserValidate, Usercontroller.add)
  // /**
  //  * @api {put} v1/users/:id Replace User
  //  * @apiDescription Replace the whole user document with a new one
  //  * @apiVersion 1.0.0
  //  * @apiName ReplaceUser
  //  * @apiGroup User
  //  * @apiPermission user
  //  *
  //  * @apiHeader {String} Authorization   User's access token
  //  *
  //  * @apiParam  {String}             email     User's email
  //  * @apiParam  {String{6..128}}     password  User's password
  //  * @apiParam  {String{..128}}      [name]    User's name
  //  * @apiParam  {String=user,admin}  [role]    User's role
  //  * (You must be an admin to change the user's role)
  //  *
  //  * @apiSuccess {String}  id         User's id
  //  * @apiSuccess {String}  name       User's name
  //  * @apiSuccess {String}  email      User's email
  //  * @apiSuccess {String}  role       User's role
  //  * @apiSuccess {Date}    createdAt  Timestamp
  //  *
  //  * @apiError (Bad Request 400)  ValidationError  Some parameters may contain invalid values
  //  * @apiError (Unauthorized 401) Unauthorized Only authenticated users can modify the data
  //  * @apiError (Forbidden 403)    Forbidden    Only user with same id or admins can modify the data
  //  * @apiError (Not Found 404)    NotFound     User does not exist
  //  */
  .put(authorize(["admin", "dev"]), updateuserValidate, Usercontroller.update)
  // /**
  //  * @api {delete} v1/users/:id Delete User
  //  * @apiDescription Delete a user
  //  * @apiVersion 1.0.0
  //  * @apiName DeleteUser
  //  * @apiGroup User
  //  * @apiPermission user
  //  *
  //  * @apiHeader {String} Authorization   User's access token
  //  *
  //  * @apiSuccess (No Content 204)  Successfully deleted
  //  *
  //  * @apiError (Unauthorized 401) Unauthorized  Only authenticated users can delete the data
  //  * @apiError (Forbidden 403)    Forbidden     Only user with same id or admins can delete the data
  //  * @apiError (Not Found 404)    NotFound      User does not exist
  //  */
  .delete(authorize(["dev"]), deleteuserValidate, Usercontroller.delete)

module.exports = router
