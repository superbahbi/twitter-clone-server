const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");
var cloudinary = require("cloudinary");
const { route } = require("./userRoute");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const Tweet = mongoose.model("Tweet");

const router = express.Router();

router.use(requireAuth);

router.get("/tweet/:username", async (req, res) => {
  console.log("profile");
  const username = req.params.username;
  console.log(username);
  const tweets = await Tweet.find({ username }).sort("-timestamp");
  res.send(tweets);
});

router.get("/tweet", async (req, res) => {
  const tweets = await Tweet.find({}).sort("-timestamp");
  res.send(tweets);
});

router.post("/tweet", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(422).send({ error: "Invalid Tweet" });
  }
  let tweetimg = "";
  if (content.newFile !== "") {
    tweetimg = await cloudinary.v2.uploader.upload(
      content.newFile.file,
      { folder: "tweetImg" },
      (error, result) => {
        if (error) {
          console.log(error);
        }
        if (result) {
          return result;
        }
      }
    );
  }
  console.log("img url:", tweetimg);
  try {
    const tweet = new Tweet({
      userId: req.user._id,
      username: req.user.username,
      name: req.user.profile.name,
      avatar: req.user.profile.avatar.filename,
      timestamp: new Date(),
      content: content.newTweet,
      img: { filename: tweetimg.url },
    });
    await tweet.save();
    res.send(tweet);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
router.delete("/tweet", async (req, res) => {
  const { _id } = req.body;
  if (!_id) {
    return res.status(422).send({ error: "Can't delete this Tweet" });
  }
  try {
    console.log(_id);
    Tweet.deleteOne({ _id }, function (err) {
      if (err) return handleError(err);
      res.send("Tweet deleted");
    });
    // Verify id is owned by the user
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
router.post("/tweet/like", async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(422).send({ error: "Can't like this Tweet" });
  }
  try {
    Tweet.findOne({ _id }, async function (err, tweet) {
      let deleted = false;
      Object.keys(tweet.likes).map((key, index) => {
        if (
          JSON.stringify(tweet.likes[key]._id) === JSON.stringify(req.user._id)
        ) {
          deleted = true;
          commentID = tweet.likes[key]._id;
          userID = req.user._id;
          // delete profile id from the like list
          Tweet.findByIdAndUpdate(
            { _id },
            { $pull: { likes: { _id: userID } } },
            function (err, data) {
              if (err) {
                return res
                  .status(500)
                  .json({ error: "error in deleting address" });
              }
            }
          );
        }
      });
      if (!deleted) {
        tweet.likes.push(req.user._id);
        tweet.save((err) => {
          if (err) {
            return next(err);
          }
        });
      }
      const tweets = await Tweet.find({}).sort("-timestamp");
      res.send(tweets);
    });
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
router.post("/tweet/comment", async (req, res) => {
  const { _id } = req.body;
  if (!_id) {
    return res.status(422).send({ error: "Can't like this Tweet" });
  }
  try {
    // console.log(_id);
    Tweet.findByIdAndUpdate(
      { _id },
      {
        comments: [
          {
            _id: req.user._id,
            name: req.user.name,
            username: req.user.username,
            avatar: req.user.profile.avatar.filename,
            timestamp: new Date(),
            content: "aaa",
          },
        ],
      },
      function (err, result) {
        // if (err) return handleError(err);
        if (err) {
          res.send(err);
        } else {
          res.send(result);
        }
      }
    );
    // Verify id is owned by the user
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
