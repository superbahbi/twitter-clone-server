const express = require("express");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
// const User = mongoose.model("User");

const router = express.Router();

router.get("/send", async (req, res) => {
  const message = {
    to: "ExponentPushToken[vRpwpoH2JHPdwos008gkkS]",
    sound: "default",
    title: "Twitter",
    body: "New message from Jee ❤️",
    data: { data: "goes here" },
  };
  const result = fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  res.send(result);
});
module.exports = router;
