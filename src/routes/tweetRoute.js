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
      avatar: req.user.profile.avatar.filename,
      timestamp: new Date(),
      content,
    });
    await tweet.save();
    res.send(tweet);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
router.delete("/tweet", async (req, res) => {
  const { _id } = req.body;
  console.log("id", _id);
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
module.exports = router;
