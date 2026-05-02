const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "TeamSync backend is running",
  });
});

app.use("/api", routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
