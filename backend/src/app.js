const express = require("express");
const cors = require("cors");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TeamSync backend is running",
  });
});

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TeamSync backend is running",
    health: "/health",
    apiBase: "/api",
  });
});

app.get("/favicon.ico", (req, res) => {
  return res.status(204).end();
});

let routes;
let apiLoadError;

app.use("/api", (req, res, next) => {
  if (!routes && !apiLoadError) {
    try {
      routes = require("./routes");
    } catch (error) {
      apiLoadError = error;
      console.error("API failed to initialize:", error);
    }
  }

  if (apiLoadError) {
    return res.status(503).json({
      success: false,
      message:
        "API is unavailable because the server configuration is incomplete. Check DATABASE_URL and other Railway variables.",
    });
  }

  return routes(req, res, next);
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
