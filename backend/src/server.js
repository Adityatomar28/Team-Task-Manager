const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

function listen(port, label = "primary") {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port} (${label})`);
  });

  server.on("error", (error) => {
    console.error(`Server failed to start on port ${port} (${label}):`, error);
    if (label === "primary") {
      process.exit(1);
    }
  });

  return server;
}

listen(PORT);

if (PORT !== 3000 && process.env.ENABLE_FALLBACK_PORT !== "false") {
  listen(3000, "fallback");
}
