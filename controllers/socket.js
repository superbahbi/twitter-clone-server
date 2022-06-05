const Chat = require("../models/Chat");
const User = require("../models/User");
const { ObjectId } = require("mongodb");

exports.Socket = (io) => {
    io.on("connection", socket => {
        console.log(socket.id + ' ==== connected');
        socket.on('join', data => {
            let split = data._id.split('-'); // ['user_id1', 'user_id2']
            let unique = [...new Set(split)].sort((a, b) => (a < b ? -1 : 1)); // ['username1', 'username2']
            let updatedRoomName = `${unique[0]}-${unique[1]}`; // 'username1--with--username2'

            Array.from(socket.rooms)
                .filter(it => it !== socket.id)
                .forEach(id => {
                    socket.leave(id);
                    socket.removeAllListeners("emitMessage");
                });

            Chat.findOne({ roomID: updatedRoomName }, (err, chat) => {
                if (err) {
                    console.log(err);
                } else {
                    if (chat) {
                        socket.join(updatedRoomName);
                        console.log("Join room: " + updatedRoomName)
                    } else {

                        let newChat = new Chat({
                            _id: new ObjectId(),
                            roomID: updatedRoomName
                        });
                        newChat.save((err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                socket.join(updatedRoomName);
                                console.log("Created and join room  : " + updatedRoomName)
                            }
                        });
                    }
                }
            })

            socket.on("emitMessage", message => {
                Array.from(socket.rooms)
                    .filter(it => it !== socket.id)
                    .forEach(id => {
                        socket.to(id).emit('onMessage', message, function (err, success) {

                            Chat.findOne({ roomID: updatedRoomName }, (err, chat) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    if (chat) {
                                        console.log(message);
                                        chat.message.push(message);
                                        chat.save((err) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                    } else {
                                        console.log("Chat not found")
                                    }
                                }
                            });

                        });

                    });

            });

            socket.on("disconnect", () => {
                console.log(socket.id + ' ==== diconnected');
                socket.removeAllListeners();
            });
        });
    });
}