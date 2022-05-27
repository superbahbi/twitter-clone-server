const mongoose = require("mongoose");

const tweetSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  name: String,
  timestamp: Date,
  content: String,
  retweets: {
    type: String,
    default: 0
  },
  likes: [
    {
      user_id: String
    }
  ],
  img: {
    filename: String
  },
  comment: [
    {
      _id: String,
      name: String,
      username: String,
      timestamp: Date,
      content: String,
      avatar: String,
      img: {
        filename: {
          type: String,
          default: "replaceme.jpg"
        }
      }
    }
  ]
});

const Tweet = mongoose.model("Tweet", tweetSchema);

module.exports = Tweet;
