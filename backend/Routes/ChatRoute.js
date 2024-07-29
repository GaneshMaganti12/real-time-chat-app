const express = require("express");
const { authorization } = require("../Middleware/Auth");
const {
  getUsers,
  getChatUsers,
  createChatUser,
} = require("../Controllers/ChatControllers");
const router = express.Router();

router.post("/user-chat", authorization, createChatUser);

router.get("/users", authorization, getUsers);

router.get("/user-chats", authorization, getChatUsers);

module.exports = router;
