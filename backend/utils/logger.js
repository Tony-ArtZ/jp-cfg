import winston from "winston";
import LokiTransport from "winston-loki";

const { combine, timestamp, errors, json, printf } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
  }`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: {
    service: "jp-cfg-backend",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    new winston.transports.Console({
      format: combine(winston.format.colorize(), consoleFormat),
    }),

    new winston.transports.File({
      filename: "/tmp/error.log",
      level: "error",
      format: combine(timestamp(), json()),
    }),

    new winston.transports.File({
      filename: "/tmp/combined.log",
      format: combine(timestamp(), json()),
    }),
  ],
});

if (process.env.NODE_ENV === "production" || process.env.LOKI_URL) {
  logger.add(
    new LokiTransport({
      host: process.env.LOKI_URL || "http://loki:3100",
      labels: {
        app: "jp-cfg-backend",
        environment: process.env.NODE_ENV || "development",
      },
      json: true,
      format: combine(timestamp(), json()),
      replaceTimestamp: true,
      onConnectionError: (err) => {
        console.error("Loki connection error:", err);
      },
    })
  );
}

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  logger.info("HTTP Request", {
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    requestId: req.get("X-Request-ID"),
  });

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger.log(logLevel, "HTTP Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.get("X-Request-ID"),
    });
  });

  next();
};

export default logger;
