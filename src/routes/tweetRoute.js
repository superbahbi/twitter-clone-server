const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Tweet = mongoose.model("Tweet");

const router = express.Router();

router.use(requireAuth);

router.get("/tweet", async (req, res) => {
  const tweets = await Tweet.find({});
  res.send(tweets);
});

router.post("/tweet", async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(422).send({ error: "Invalid Tweet" });
  }
  try {
    const tweet = new Tweet({
      userId: req.user._id,
      username: req.user.username,
      name: req.user.profile.name,
      timestamp: new Date(),
      content,
    });
    await tweet.save();
    res.send(tweet);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
module.exports = router;
