// Initialize tracing first (before importing other modules)
import { initTracing } from "./utils/tracing.js";
initTracing();

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import "./config/passport.js";
import authRoutes from "./routes/auth.js";
import { register, metricsMiddleware } from "./utils/metrics.js";
import { logger, requestLogger } from "./utils/logger.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Add monitoring middleware
app.use(requestLogger);
app.use(metricsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Metrics endpoint for Prometheus
app.get("/metrics", async (req, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error("Error generating metrics", { error: error.message });
    res.status(500).end();
  }
});

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  logger.info("Root endpoint accessed");
  res.send("Hello World!");
});

app.listen(port, () => {
  logger.info(`Server started`, {
    port: port,
    environment: process.env.NODE_ENV || "development",
  });
  console.log(`Example app listening at http://localhost:${port}`);
});
