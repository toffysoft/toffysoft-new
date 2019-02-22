const moment = require("moment-timezone") //moment-timezone
const { createLogger, format, transports, Container } = require("winston")
const { combine, label, timestamp, printf } = format

const myFormat = printf(
  info => `${info.timestamp} [${info.level}]: ${info.label} - ${info.message}`
)
const appendTimestamp = format((info, opts) => {
  if (opts.tz)
    info.timestamp = moment()
      .tz(opts.tz)
      .format()
  return info
})

const DailyRotateFile = require("winston-daily-rotate-file")

function setlogger(labelname) {
  const transportsConfig = [
    new DailyRotateFile({
      filename: "./logs/webserver-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      handleExceptions: true,
      json: false,
      //zippedArchive: true,
      maxSize: "20m",
      maxFiles: "40d"
    }),
    new transports.Console({
      level: "debug",
      handleExceptions: true,
      json: false,
      colorize: true
    })
  ]

  let container = new Container()

  return container.add(labelname, {
    level: "info",
    format: combine(
      label({ label: labelname }),
      appendTimestamp({ tz: "Asia/Bangkok" }),
      myFormat
    ),
    transports: transportsConfig
  })
}

module.exports = setlogger
