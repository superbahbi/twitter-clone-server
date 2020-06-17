const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password, email, name } = req.body;
  try {
    const user = new User({
      email,
      username,
      password,
      profile: {
        name,
        email,
        regDate: Math.round(new Date().getTime() / 1000),
      },
    });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(422)
      .send({ error: "Must provide username and password" });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(422).send({ error: "Invalid username or password" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: "Invalid username or password" });
  }
});
module.exports = router;
