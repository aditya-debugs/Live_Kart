const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const serverless = require("serverless-http");
const productRoutes = require("./routes/products");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/", productRoutes);

module.exports.handler = serverless(app);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Server listening on", port));
}
