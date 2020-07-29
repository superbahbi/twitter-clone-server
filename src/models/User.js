const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
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
  following: [
    {
      _id: String,
      name: String,
      username: String,
    },
  ],
  followers: [
    {
      _id: String,
      name: String,
      username: String,
    },
  ],
  messages: [
    {
      _id: mongoose.Types.ObjectId,
      data: [
        {
          _id: mongoose.Types.ObjectId,
          text: String,
          createdAt: Date,
          user: {
            _id: mongoose.Types.ObjectId,
            name: String,
            avatar: String,
          },
          image: String,
          // You can also add a video prop:
          video: String,
          // Mark the message as sent, using one tick
          sent: Boolean,
          // Mark the message as received, using two tick
          received: Boolean,
          // Mark the message as pending with a clock loader
          pending: Boolean,
          // Any additional custom parameters are passed through
        },
      ],
    },
  ],

  profile: {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      default: "",
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
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
