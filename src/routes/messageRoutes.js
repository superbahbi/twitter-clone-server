const express = require("express");
const mongoose = require("mongoose");
const requireAuth = require("../middlewares/requireAuth");

const User = mongoose.model("User");

const router = express.Router();

router.use(requireAuth);

router.post("/chatroom", async (req, res) => {
  const { content } = req.body;
  const { username, _id, tweets, following, followers, profile } = req.user;

  if (!content) {
    return res.status(422).send({ error: "Can't talk to this person" });
  }
  try {
    User.findOne({ _id }, async function (err, user) {
      let exist = false;
      Object.keys(user.messages).map((key, index) => {
        // make new chat room
        if (
          JSON.stringify(user.messages[key]._id) === JSON.stringify(content)
        ) {
          exist = true;
        }
      });
      if (!exist) {
        user.messages.push(content);
        user.save((err) => {
          if (err) {
            console.log(err);
          }
        });
        console.log(user);
      }
    });
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
  res.send("test");
});
module.exports = router;
