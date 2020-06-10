const mongoose = require("mongoose");
const comment = new mongoose.Schema({
  _id: String,
  name: String,
  username: String,
  timestamp: Date,
  content: String,
  avatar: String,
  img: {
    filename: {
      type: String,
      default: "replaceme.jpg",
    },
  },
});
const trackSchema = new mongoose.Schema({
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

mongoose.model("Track", trackSchema);
