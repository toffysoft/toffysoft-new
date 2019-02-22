const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const passport = require("passport")
const expressSanitizer = require("express-sanitizer")
const compress = require("compression")
const methodOverride = require("method-override")
const cors = require("cors")
const helmet = require("helmet")
const favicon = require("express-favicon")
const fs = require("fs")

// monogodb connection
const MongoConnection = require("./db")
const MongoStore = require("connect-mongo")(session)

// pass passport for configuration
require("../api/middlewares/passport")(passport)

const routes = require("../api/routes")
const { logs, SESSION_SECRET, isDev } = require("./vars")

const error = require("../api/middlewares/error")

/**
 * Express instance
 * @public
 */
const app = express()

var corsOptions = {
  origin: [
    /^http?:\/\/localhost/,
    /\.toffysoft\.com$/
    // "*"
  ],
  //Array - set origin to an array of valid origins. Each origin can be a String or a RegExp.
  //For example ["http://example1.com", /\.example2\.com$/]
  //will accept any request from "http://example1.com" or from a subdomain of "example2.com".
  methods: "GET,PUT,POST,DELETE",
  credentials: true // enable set cookie
}

let Logger

if (isDev) {
  Logger = console
} else {
  const setlogger = require("./logger")
  Logger = setlogger("Main")
}

Logger.info("Web Server Starting ..... ")

app.use(morgan(logs))

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// gzip compression
app.use(compress())

// lets you use HTTP verbs such as PUT or DELETE
// in places where the client doesn't support it
app.use(methodOverride())

// secure apps by setting various HTTP headers
app.use(helmet())
//disable cache
app.use(helmet.noCache())
app.disable("x-powered-by")

// Mount express-sanitizer here
app.use(expressSanitizer()) // this line follows bodyParser() instantiations

// enable CORS - Cross Origin Resource Sharing
app.use(cors(corsOptions))

// CookieParser should be above session
app.use(cookieParser())

// trust first proxy
app.set("trust proxy", 1)

app.use(
  session({
    name: "user_sid",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      mongooseConnection: MongoConnection,
      autoRemove: "native" // Default
    })
  })
)

//enable authentication
app.use(passport.initialize())
// persistent login sessions
app.use(passport.session())

//serve-favicon
app.use(favicon("./public/favicon.ico"))

// mount api routes
app.use("/api", routes)

if (!fs.existsSync("../images")) {
  fs.mkdirSync("../images")
  Logger.info("mk images dir......")
}

//mount static images routes
if (isDev) {
  app.use("/images", express.static("../images"))
}

// if error is not an instanceOf APIError, convert it.
app.use(error.converter)

// catch 404 and forward to error handler
app.use(error.notFound)

// error handler, send stacktrace only during development
app.use(error.handler)

module.exports = app
