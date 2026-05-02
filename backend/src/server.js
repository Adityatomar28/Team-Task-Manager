const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});