const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  _id: String,
  username: { type: String, unique: true },
  password: String,
  tweets: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  profile: {
    name: String,
    email: { type: String, unique: true },
    bio: String,
    gender: String,
    phone: String,
    birthday: Number,
    location: String,
    website: String,
    regDate: Number,
    avatar: {
      filename: {
        type: String,
        default:
          "http://res.cloudinary.com/dlz6xmn1q/image/upload/v1583088333/avatar/gf5k6jlwwebdlgmtrq1g.png"
      }
    },
    cover: {
      filename: {
        type: String,
        default:
          "http://res.cloudinary.com/dlz6xmn1q/image/upload/v1583088333/avatar/gf5k6jlwwebdlgmtrq1g.png"
      }
    }
  }
});
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
module.exports = User;
