const express = require("express");
const cors = require("cors");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();
const apiLoadError = (() => {
  try {
    app.locals.routes = require("./routes");
    return null;
  } catch (error) {
    return error;
  }
})();

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
    api: apiLoadError ? "unavailable" : "ready",
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

if (apiLoadError) {
  console.error("API failed to initialize:", apiLoadError);
  app.use("/api", (req, res) => {
    return res.status(503).json({
      success: false,
      message:
        "API is unavailable because the server configuration is incomplete. Check DATABASE_URL and other Railway variables.",
    });
  });
} else {
  app.use("/api", app.locals.routes);
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
