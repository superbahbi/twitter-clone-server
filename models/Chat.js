const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    _id: String,
    roomID: String,
    message: [{
        id: String,
        user: String,
        body: String,
        createdAt: Number,
    }],
});
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
