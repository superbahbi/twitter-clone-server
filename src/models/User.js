const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tweets: {
    type: Number,
    default: 0,
  },
  following: {
    type: Number,
    default: 0,
  },
  followers: {
    type: Number,
    default: 0,
  },
  profile: {
    name: String,
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
          "http://res.cloudinary.com/dlz6xmn1q/image/upload/v1583088333/avatar/gf5k6jlwwebdlgmtrq1g.png",
      },
    },
    cover: {
      filename: {
        type: String,
        default:
          "http://res.cloudinary.com/dlz6xmn1q/image/upload/v1583088333/avatar/gf5k6jlwwebdlgmtrq1g.png",
      },
    },
  },
});

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }
      if (!isMatch) {
        return reject(false);
      }
      resolve(true);
    });
  });
};
mongoose.model("User", userSchema);
