import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({stacked: true}),
    winston.format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
    winston.format.label({label: `Label🏷️`}),
    winston.format.printf(info => `${info.level}: ${info.label}: ${[`[${info.timestamp}]`]}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({dirname: "log", filename: "info.log", level: "info"})
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
      format: winston.format.simple()
  }));
}

export default logger;