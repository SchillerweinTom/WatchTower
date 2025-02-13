const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => {
        const now = new Date();
        return now.toLocaleString("en-GB", { 
          timeZone: "Europe/Zurich" 
        }).replace(/\//g, '-');
      }
    }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/server.log") })
  ]
});

module.exports = logger;