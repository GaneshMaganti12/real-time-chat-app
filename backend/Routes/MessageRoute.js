const express = require("express");
const { authorization } = require("../Middleware/Auth");
const {
  getMessages,
  createMessage,
  deleteMessage,
  updateMessage,
} = require("../Controllers/MessageControllers");
const router = express.Router();

router.post("/", authorization, createMessage);

router.get("/:chatId", authorization, getMessages);

router.delete("/:chatId/:messageId", authorization, deleteMessage);

router.patch("/:chatId/:messageId", authorization, updateMessage);

module.exports = router;
