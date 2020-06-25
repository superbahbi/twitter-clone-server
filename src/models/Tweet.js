const mongoose = require("mongoose");
const comment = new mongoose.Schema({
  _id: String,
  name: String,
  username: String,
  timestamp: Date,
  content: String,
  avatar: {
    type: String,
    default: "replaceme.jpg",
  },
});
const tweetScheme = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  username: {
    type: String,
    default: "",
  },
  name: String,
  timestamp: Date,
  content: String,
  avatar: String,
  retweets: {
    type: String,
    default: 0,
  },
  likes: [
    {
      user_id: String,
    },
  ],
  img: {
    filename: String,
  },
  comments: [comment],
});

mongoose.model("Tweet", tweetScheme);
