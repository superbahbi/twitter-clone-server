const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const Tweet = mongoose.model("Tweet");

const router = express.Router();

router.use(requireAuth);

router.get("/tweet", async (req, res) => {
  const tweets = await Tweet.find({ userId: req.user._id });

  res.send(tweets);
});

router.post("/tweet", async (req, res) => {
  const { name, locations } = req.body;
  if (!name || !locations) {
    return res.status(422).send({ error: "Invalid Tweet" });
  }
  try {
    const tweet = new Tweet({ name, locations, userId: req.user._id });
    await tweet.save();
    res.send(tweet);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
module.exports = router;
