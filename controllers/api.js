const { ObjectId } = require("mongodb");
const User = require("../models/User");
const Tweet = require("../models/Tweet");
const passport = require("passport");
const validator = require("validator");
const moment = require("moment");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const upload = require("../models/Upload");
exports.postSignup = (req, res) => {
  console.log(req.body);

  const username = req.body.username || "";
  const email = req.body.email || "";
  const password = req.body.password || "";
  const confirmpassword = req.body.confirmpassword || "";
  const gender = req.body.gender || "";
  const phone = req.body.phone || "";
  const validationErrors = [];
  if (validator.isEmpty(username))
    validationErrors.push({
      name: "username",
      message: "Please enter a username."
    });
  if (!validator.isEmail(email))
    validationErrors.push({
      name: "email",
      message: "Please enter a valid email address."
    });
  if (validator.isEmpty(password))
    validationErrors.push({
      name: "password",
      message: "Password cannot be blank."
    });
  if (validator.isEmpty(confirmpassword))
    validationErrors.push({
      name: "confirmpassword",
      message: "Confirm Password cannot be blank."
    });
  if (!validator.equals(password, confirmpassword))
    validationErrors.push({
      name: "password",
      message: "Password is not match."
    });
  if (validator.isEmpty(gender))
    validationErrors.push({
      name: "gender",
      message: "Please pick a gender."
    });
  if (!validator.equals(gender, "M") && !validator.equals(gender, "F"))
    validationErrors.push({
      name: "gender",
      message: "Please pick a gender."
    });

  if (validator.isEmpty(phone))
    validationErrors.push({
      name: "phone",
      message: "Please enter a phone number."
    });

  if (validationErrors.length) {
    return res.status(400).json(validationErrors);
  }
  User.register(
    new User({
      _id: new ObjectId(),
      username: username,
      profile: {
        name: null,
        email: email,
        bio: null,
        gender: gender,
        phone: phone,
        regDate: Math.round(new Date().getTime() / 1000)
      }
    }),
    password,
    function(err, user) {
      if (err) {
        validationErrors.push(err);
        res.status(400).json(validationErrors);
      } else {
        return res
          .status(200)
          .json({ success: "User " + username + " created!" });
      }
    }
  );
};
/**
 * Post /
 * Login request page.
 */
exports.postLogin = (req, res, next) => {
  const username = req.body.username || "";
  const password = req.body.password || "";

  const validationErrors = [];
  if (validator.isEmpty(username))
    validationErrors.push({
      success: false,
      message: "Please enter a username."
    });

  if (validator.isEmpty(password))
    validationErrors.push({
      success: false,
      message: "Password cannot be blank."
    });
  if (validationErrors.length) {
    return res.status(400).json(validationErrors);
  }
  let user = new User({
    username: username,
    password: password
  });
  req.login(user, function(err) {
    if (err) {
      validationErrors.push({
        success: false,
        message: "Authentication failed! Please check the request"
      });
      res.status(400).json(validationErrors);
    } else {
      passport.authenticate("local", function(error, user, info) {
        if (user) {
          user = user.toObject();
          delete user.salt;
          delete user.hash;
          let token = jwt.sign(user, process.env.JWT_SECRET, {
            expiresIn: "24h"
          });

          // return the JWT token for the future API calls
          res.status(200).json({
            success: true,
            message: "Authentication successful!",
            token: token,
            user: user
          });
        } else {
          validationErrors.push({
            success: false,
            message:
              "The username and password you entered did not match our records. Please double-check and try again."
          });
          res.status(400).json(validationErrors);
        }
      })(req, res, next);
    }
  });
};

exports.getAllTweet = (req, res) => {
  Tweet.aggregate(
    [
      {
        $lookup: {
          from: "users",
          localField: "username",
          foreignField: "username",
          as: "user_data"
        }
      },
      {
        $project: {
          "user_data.salt": 0,
          "user_data.hash": 0
        }
      },
      {
        $unwind: {
          path: "$user_data",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          timestamp: -1
        }
      }
    ],
    function(err, foundTweet) {
      if (err) {
        console.log(err);
      }
      res.send({
        foundTweet
      });
    }
  );
};
exports.getUserTweet = (req, res) => {
  Tweet.aggregate(
    [
      { $match: { username: req.params.username } },
      {
        $lookup: {
          from: "users",
          localField: "username",
          foreignField: "username",
          as: "user_data"
        }
      },
      {
        $project: {
          "user_data.salt": 0,
          "user_data.hash": 0
        }
      },
      {
        $sort: {
          timestamp: -1
        }
      },
      {
        $unwind: {
          path: "$user_data",
          preserveNullAndEmptyArrays: true
        }
      }
    ],
    function(err, foundTweet) {
      if (err) {
        console.log(err);
      }
      res.send({
        foundTweet
      });
    }
  );
};
exports.getUser = (req, res) => {
  User.findOne({ username: req.params.username }, (err, foundUser) => {
    if (err) {
      res.json(err);
    }
    res.json(foundUser);
  });
};
exports.postTweet = (req, res, next) => {
  console.log(req.body);
  // TODO: Data validator
  //Creating new tweet data
  let tweet = new Tweet();
  // Adding new tweet to mongodb
  User.findOne(
    {
      username: req.decoded.username
    },
    function(err, user) {
      tweet._id = new ObjectId();
      tweet.username = user.username;
      tweet.name = user.profile.name;
      tweet.timestamp = new Date();
      tweet.content = req.body.tweet;
      if (!_.isEmpty(req.file)) {
        switch (req.file.mimetype) {
          case "image/gif":
          case "image/png":
          case "image/jpeg":
            upload.uploadToCloud(req, (result, error) => {
              tweet.img.filename = result.url;
              tweet.save(function(err, t) {
                if (err) {
                  res.status(400).json(err);
                } else {
                  res.send(t);
                }
              });
            });
            break;
          default:
            res.status(406).json("Invalid file");
            break;
        }
      } else {
        tweet.save(function(err, t) {
          if (err) {
            res.status(400).json(err);
            return;
          } else {
            res.send(t);
            return;
          }
        });
      }
    }
  );
};
exports.deleteTweet = (req, res, next) => {
  Tweet.deleteOne({ _id: req.body.id }, function(err, result) {
    if (err) {
      return res.send(err);
    } else {
      return res.send(result);
    }
  });
};
exports.updateUser = async (req, res, next) => {
  console.log(req.body);

  User.findOne(
    {
      username: req.body.username
    },
    function(err, user) {
      switch (req.body.field) {
        case "name":
          user.profile.name = req.body.content;
          break;
        case "bio":
          user.profile.bio = req.body.content;
          break;
        case "location":
          user.profile.location = req.body.content;
          break;
        case "website":
          user.profile.website = req.body.content;
          break;
      }

      user.save(err => {
        if (err) {
          return next(err);
        }

        res.json("Success");
      });
    }
  );
};
exports.uploadPhoto = async (req, res, next) => {
  console.log("Change");
  console.log(req.body);
  if (req.body.username && req.file && req.body.type) {
    User.findOne(
      {
        username: req.body.username
      },
      function(err, user) {
        if (err) {
          res.status(400).json(err);
        }
        if (!_.isEmpty(req.file)) {
          if (err) {
            res.status(400).json(err);
          }
          switch (req.file.mimetype) {
            case "image/gif":
            case "image/png":
            case "image/jpeg":
              upload.uploadToCloud(req, (result, error) => {
                if (error) {
                  return next(err);
                }
                switch (req.body.type) {
                  case "avatar":
                    user.profile.avatar.filename = result.url;
                    break;
                  case "cover":
                    user.profile.cover.filename = result.url;
                    break;
                  default:
                    res.status(400).json("Invalid type");
                    break;
                }
                console.log(req.body.type);
                console.log(result.url);
                user.save(err => {
                  if (err) {
                    return next(err);
                  }
                  res.status(200).json("Successfully updated the DB");
                });
              });
              break;
            default:
              res.status(400).json("Invalid file");
              break;
          }
        }
      }
    );
  } else {
    res.status(400).json("Incomplete request data");
  }
};

exports.likeTweet = async (req, res, next) => {
  const tweetId = req.params.id;
  const profileId = req.body.profile_id;

  if (tweetId) {
    Tweet.findOne(
      {
        _id: tweetId
      },

      function(err, tweet) {
        let deleted = false;
        // console.log(tweet);
        if (err) {
          res.status(400).json(err);
        }

        Object.keys(tweet.likes).map((key, index) => {
          if (tweet.likes[key]._id == profileId) {
            deleted = true;
            // delete profile id from the like list
            Tweet.findOneAndUpdate(
              { _id: tweetId },
              { $pull: { likes: { _id: profileId } } },
              function(err, data) {
                if (err) {
                  return res
                    .status(500)
                    .json({ error: "error in deleting address" });
                }
              }
            );
          }
        });

        if (!deleted) {
          tweet.likes.push(profileId);
          tweet.save(err => {
            if (err) {
              return next(err);
            }
            res.json(tweet);
          });
        }
      }
    );
  } else {
    res.status(400).json("Missing id");
  }
};
exports.postComment = async (req, res, next) => {
  console.log(req.body);
  const name = req.body.name || "";
  const username = req.body.username || "";
  const comment = req.body.comment || "";
  const tweetId = req.body.tweetId || "";
  const profileId = req.body.profileId || "";
  const avatar = req.body.avatar || "";
  // const validationErrors = [];
  // if (validator.isEmpty(comment))
  //   validationErrors.push({
  //     success: false,
  //     message: "Please enter a comment."
  //   });
  // if (validator.isEmpty(tweetId))
  //   validationErrors.push({
  //     success: false,
  //     message: "Please enter a tweet id."
  //   });

  // if (validationErrors.length) {
  //   return res.status(400).json(validationErrors);
  // }
  if (tweetId) {
    Tweet.findOne(
      {
        _id: tweetId
      },

      async function(err, tweet) {
        let deleted = false;
        // console.log(tweet);
        if (err) {
          res.status(400).json(err);
        }

        // Object.keys(tweet.comment).map((key, index) => {
        //   if (tweet.comment[key]._id == profileId) {
        //     deleted = true;
        //     // delete profile id from the like list
        //     Tweet.findOneAndUpdate(
        //       { _id: tweetId },
        //       { $pull: { likes: { _id: profileId } } },
        //       function(err, data) {
        //         if (err) {
        //           return res
        //             .status(500)
        //             .json({ error: "error in deleting address" });
        //         }
        //       }
        //     );
        //   }
        // });
        // _id: String,
        // timestamp: Date,
        // content: String,
        if (!deleted) {
          data = {
            _id: new ObjectId(profileId),
            timestamp: new Date(),
            content: comment,
            name: name,
            username: username,
            avatar: avatar
          };
          tweet.comment.push(data);
          await tweet.save(err => {
            if (err) {
              res.status(400).json(err);
            }
            res.status(200).json("Success");
          });
        }
      }
    );
  } else {
    res.status(400).json("Missing comment");
  }
};
exports.getThreadTweet = async (req, res, next) => {
  const threadID = req.params.threadID || "";
  // const validationErrors = [];
  // if (validator.isEmpty(comment))
  //   validationErrors.push({
  //     success: false,
  //     message: "Please enter a comment."
  //   });
  // if (validator.isEmpty(tweetId))
  //   validationErrors.push({
  //     success: false,
  //     message: "Please enter a tweet id."
  //   });

  // if (validationErrors.length) {
  //   return res.status(400).json(validationErrors);
  // }
  if (threadID) {
    Tweet.aggregate(
      [
        { $match: { _id: new ObjectId(threadID) } },
        {
          $lookup: {
            from: "users",
            localField: "username",
            foreignField: "username",
            as: "user_data"
          }
        },
        {
          $project: {
            "user_data.salt": 0,
            "user_data.hash": 0
          }
        },
        {
          $sort: {
            "comment.timestamp": -1
          }
        },

        {
          $unwind: {
            path: "$user_data",
            preserveNullAndEmptyArrays: true
          }
        }
      ],
      function(err, foundTweet) {
        if (err) {
          console.log(err);
        }
        res.status(200).json({
          foundTweet
        });
      }
    );
  } else {
    res.status(400).json("Missing comment");
  }
};
