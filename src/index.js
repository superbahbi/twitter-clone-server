require("./models/User");
require("./models/Tweet");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const tweetRoutes = require("./routes/tweetRoute");
const requireAuth = require("./middlewares/requireAuth");

const app = express();
app.use(bodyParser.json());
app.use(authRoutes);
app.use(tweetRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Connected to mongo instance");
});

mongoose.connection.on("error", () => {
  console.error("Error connection to mongo", err);
});

app.get("/", (req, res) => {
  res.json("twitter clone api endpoint");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
