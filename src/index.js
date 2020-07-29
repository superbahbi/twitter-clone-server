require("./models/User");
require("./models/Tweet");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoute");
const tweetRoutes = require("./routes/tweetRoute");
const userRoutes = require("./routes/userRoute");
const requireAuth = require("./middlewares/requireAuth");

const app = express();
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use(authRoutes);
app.use(messageRoutes);
app.use(notificationRoutes);
app.use(tweetRoutes);
app.use(userRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
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
