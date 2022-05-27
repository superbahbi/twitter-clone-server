const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const chalk = require("chalk");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const MongoStore = require("connect-mongo")(session);
const multer = require("multer");
const cors = require("cors");
const authentication = require("./models/authentication");
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single("image");
dotenv.config({ path: ".env" });

const apiController = require(__dirname + "/controllers/api");
const app = express();
/**
 * Connect to MongoDB.
 */
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("error", err => {
  console.error(err);
  console.log(
    "%s MongoDB connection error. Please make sure MongoDB is running.",
    chalk.red("✗")
  );
  process.exit();
});
app.use(cors());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(
  "/",
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/moment/min"), {
    maxAge: 31557600000
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"), {
    maxAge: 31557600000
  })
);
app.use(
  "/js/lib",
  express.static(path.join(__dirname, "node_modules/jquery/dist"), {
    maxAge: 31557600000
  })
);
app.use("/uploads", express.static(process.cwd() + "/uploads"));

// app.get("/test", homeController.test);

// Routes for react views
app.get("/", function(req, res) {
  res.json("https://github.com/superbahbi/twitter-clone api endpoint");
});
app.post("/api/login", apiController.postLogin);
app.get("/api/user/:username", apiController.getUser);
app.post("/api/signup", apiController.postSignup);
// Tweet  manipulation
app.get("/api/tweet", apiController.getAllTweet);
app.get("/api/thread/:threadID", apiController.getThreadTweet);
app.get("/api/tweet/:username", apiController.getUserTweet);
app.post("/api/comment", authentication.checkToken, apiController.postComment);
app.post(
  "/api/tweet",
  multerUploads,
  authentication.checkToken,
  apiController.postTweet
);

app.delete("/api/tweet", authentication.checkToken, apiController.deleteTweet);
app.put("/api/like/:id", authentication.checkToken, apiController.likeTweet);
app.put("/api/profile", authentication.checkToken, apiController.updateUser);
app.post(
  "/api/upload",
  multerUploads,
  authentication.checkToken,
  apiController.uploadPhoto
);
app.listen(process.env.PORT || 3000, () => {
  console.log(
    "%s App is running at http://localhost:%d in %s mode",
    chalk.green("✓"),
    process.env.PORT,
    process.env.MODE
  );
  console.log("  Press CTRL-C to stop\n");
});
