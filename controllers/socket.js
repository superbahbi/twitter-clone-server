const Chat = require("../models/Chat");
const User = require("../models/User");

exports.Socket = (io) => {
    io.on("connection", socket => {
        console.log(socket.id + ' ==== connected');
        socket.on('join', data => {
            console.log(data._id)
            let split = data._id.split('-'); // ['user_id1', 'user_id2']
            let unique = [...new Set(split)].sort((a, b) => (a < b ? -1 : 1)); // ['username1', 'username2']
            let updatedRoomName = `${unique[0]}-${unique[1]}`; // 'username1--with--username2'

            // Check if sender room exists
            if (data.sender) {
                User.findOne({ _id: data.sender._id }, (err, user) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (user) {
                            temp = {
                                _id: updatedRoomName,
                                sender: data.sender._id,
                                receiver: data.receiver._id,
                                avatar: data.receiver.profile.avatar.filename,
                                name: data.receiver.profile.name,
                            };
                            if (user.chatroom.length === 0) {
                                user.chatroom.push(temp);
                                user.save((err) => {
                                    if (err) {
                                        return next(err);
                                    }
                                    console.log("Sender added to chatroom");
                                });
                            }
                            user.chatroom.forEach(room => {
                                if (!room._id.includes(updatedRoomName)) {
                                    user.chatroom.push(temp);
                                    user.save((err) => {
                                        if (err) {
                                            return next(err);
                                        }
                                        console.log("Sender added to chatroom");
                                    });
                                }
                            })
                        }
                    }
                })
            }

            // Check if receiver room exists
            if (data.receiver) {
                User.findOne({ _id: data.receiver._id }, (err, user) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (user) {
                            temp = {
                                _id: updatedRoomName,
                                sender: data.receiver._id,
                                receiver: data.sender._id,
                                avatar: data.sender.profile.avatar.filename,
                                name: data.sender.profile.name,
                            };
                            if (user.chatroom.length === 0) {
                                user.chatroom.push(temp);
                                user.save((err) => {
                                    if (err) {
                                        return next(err);
                                    }
                                    console.log("Receiver added to chatroom");
                                });
                            }
                            user.chatroom.forEach(room => {
                                if (!room._id.includes(updatedRoomName)) {
                                    user.chatroom.push(temp);
                                    user.save((err) => {
                                        if (err) {
                                            return next(err);
                                        }
                                        console.log("Receiver added to chatroom");
                                    });
                                }
                            })
                        }
                    }
                })
            }


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
                            roomID: updatedRoomName,
                            messages: []
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
                                        console.log("Chat found")
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