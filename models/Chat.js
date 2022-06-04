const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    roomID: String,
    message: [{
        id: String,
        user: String,
        body: String,
        createdAt: Date,
    }],
});
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
