const path = require("path")

// import .env variables
require("dotenv-safe").load({
  path: path.join(__dirname, "../../.env"),
  sample: path.join(__dirname, "../../.env.example")
})

module.exports = {
  isDev: process.env.NODE_ENV === "development",
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  base_url: process.env.BASE_URL,

  SESSION_SECRET: process.env.SESSION_SECRET,
  API_SECRET: process.env.API_SECRET,
  mongo: {
    uri:
      process.env.NODE_ENV === "development"
        ? process.env.MONGO_URI
        : process.env.MONGO_URI_PROD
  },
  dev: {
    email: process.env.DEV_EMAIL,
    username: process.env.DEV_USERNAME,
    password: process.env.DEV_PASSWORD,
    fullname: process.env.DEV_FULLNAME
  },

  logs: process.env.NODE_ENV === "production" ? "combined" : "dev"
}
