const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const User = mongoose.model("User");

const router = express.Router();

router.use(requireAuth);

router.get("/user", async (req, res) => {
  const { username, _id, tweets, following, followers, profile } = req.user;
  res.send({ username, _id, tweets, following, followers, profile });
});

router.post("/profile", async (req, res) => {
  const { name, locations } = req.body;
  if (!name || !locations) {
    return res
      .status(422)
      .send({ error: "You must provide a name and location" });
  }
  try {
    const track = new Track({ name, locations, userId: req.user._id });
    await track.save();
    res.send(track);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});
module.exports = router;
