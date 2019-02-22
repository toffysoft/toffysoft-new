const { port, env, isDev } = require("./config/vars")
const app = require("./config/express")
const cluster = require("cluster")
const http = require("http")
const numCPUs = require("os").cpus().length

let Logger

if (isDev) {
  Logger = console
} else {
  const setlogger = require("./config/logger")
  Logger = setlogger("Main")
}

if (isDev) {
  if (cluster.isMaster) {
    Logger.info(`Master ${process.pid} is running`)

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }

    cluster.on("exit", (worker, code, signal) => {
      Logger.info(`worker ${worker.process.pid} died`)
    })
  } else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    // Starting both http & https servers
    http.createServer(app).listen(port, () => {
      Logger.info(`HTTP  Server running on port ${port} (${env})`)
      Logger.info(`Worker ${process.pid} started`)
    })
  }
} else {
  http.createServer(app).listen(port, () => {
    Logger.info(`HTTP  Server running on port ${port} (${env})`)
  })
}

/**
 * Exports express
 * @public
 */
// module.exports = app
