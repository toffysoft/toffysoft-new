const mongoose = require("mongoose")
const { mongo, env, dev, isDev } = require("./vars")

const User = require("../api/models/user.model")
const cluster = require("cluster")

let Logger

if (isDev) {
  Logger = console
} else {
  const setlogger = require("./logger")
  Logger = setlogger("config.db")
}

let gracefulShutdown
const dbURI = mongo.uri

const options = {
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useCreateIndex: true
}

if (isDev) {
  mongoose.set("debug", true)
}

mongoose
  .connect(dbURI, options)
  .then(connection => {
    //Init Dev User

    if (!isDev || cluster.isMaster) {
      User.findOne({ username: dev.username }, (err, user) => {
        if (err) {
          console.log("Can not findOne", err)
        }

        if (!user) {
          const newuser = new User()
          newuser.username = dev.username
          newuser.fullname = dev.fullname
          newuser.email = dev.email
          newuser.setPassword(dev.password)
          newuser.permission = "dev"

          newuser.save((err, user) => {
            if (err) {
              console.log("Can not init dev user", err)
            } else {
              console.log("Init dev user", user)
            }
          })
        } else {
          console.info("Start DEV...")
        }
      })
    }

    Logger.info("mongoose connected")
  })
  .catch(err => {
    Logger.error("Error creating a mongoose connection", err)

    if (!isDev) {
      process.exit(0)
    } else {
      process.kill(process.pid, "SIGUSR2")
    }
  })

mongoose.connection.on("reconnected", function() {
  Logger.info("Mongoose reconnected")
})

mongoose.connection.on("error", function(err) {
  Logger.error("Mongoose connection error: " + err)
})

mongoose.connection.on("disconnected", function() {
  Logger.info("Mongoose disconnected")
})

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    Logger.info("Mongoose disconnected through  " + msg)

    callback()
  })
}
// For nodemon restarts
process.once("SIGUSR2", function() {
  gracefulShutdown("nodemon restart", function() {
    process.kill(process.pid, "SIGUSR2")
  })
})
// For app termination
process.on("SIGINT", function() {
  gracefulShutdown("app termination", function() {
    process.exit(0)
  })
})
// For Heroku app termination
process.on("SIGTERM", function() {
  gracefulShutdown("Heroku app termination", function() {
    process.exit(0)
  })
})

module.exports = mongoose.connection
