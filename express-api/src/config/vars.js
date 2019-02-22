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
  SCB_USER: process.env.SCB_USER,
  SCB_PW: process.env.SCB_PW,
  W8_TIME: process.env.W8_TIME,
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
  redis_con: {
    uri:
      process.env.NODE_ENV === "development"
        ? process.env.REDIS_URI_TESTS
        : process.env.REDIS_URI
  },
  smtp_fromname: process.env.SMTP_FROMNAME,
  smtp_email: process.env.SMTP_EMAIL,
  smtp_password: process.env.SMTP_PASSWORD,

  FACEBOOK_CLIENTID: process.env.FACEBOOK_CLIENTID,
  FACEBOOK_CLIENTSECRET: process.env.FACEBOOK_CLIENTSECRET,
  TWITTER_CONSUMERKEY: process.env.TWITTER_CONSUMERKEY,
  TWITTER_CONSUMERSECRET: process.env.TWITTER_CONSUMERSECRET,
  GOOGLE_CLIENTID: process.env.GOOGLE_CLIENTID,
  GOOGLE_CLIENTSECRET: process.env.GOOGLE_CLIENTSECRET,
  VKONTAKTE_CLIENTID: process.env.VKONTAKTE_CLIENTID,
  VKONTAKTE_CLIENTSECRET: process.env.VKONTAKTE_CLIENTSECRET,
  WEIBO_APPKEY: process.env.WEIBO_APPKEY,
  WEIBO_APPSECRET: process.env.WEIBO_APPSECRET,

  logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
  temp_path: process.env.TEMP_PATH,
  save_path: process.env.SAVE_PATH,
  template_path: process.env.TEMPLATE_PATH,
  download_zip_path: process.env.DOWNLOAD_ZIP_PATH,
  machine_pic_path: process.env.MACHINE_PIC_PATH,

  kiosk_splash_screen_video_path: process.env.KIOSK_SPLASH_SCREEN_VIDEO_PATH,

  DELETE_REMAIN_DISKSIZE: process.env.DELETE_REMAIN_DISKSIZE
}
