const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const chatSchema = new mongoose.Schema({
    roomID: String,
    message: [{
        _id: String,
        user: String,
        body: String,
        time: Date,
    }],
});
chatSchema.plugin(passportLocalMongoose);
const Chat = mongoose.model("User", chatSchema);
passport.use(Chat.createStrategy());
passport.serializeUser(function (chat, done) {
    done(null, chat);
});

passport.deserializeUser(function (chat, done) {
    done(null, chat);
});
module.exports = Chat;
