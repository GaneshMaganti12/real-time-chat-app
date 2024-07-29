const Chat = require("../Models/ChatModel");
const Message = require("../Models/MessageModel");

exports.createMessage = async (req, res) => {
  try {
    const userId = req.id;
    const { content, chatId } = req.body;

    let message = await Message.create({
      text: content,
      senderId: userId,
      chatId: chatId,
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    message = await message.populate({
      path: "chatId",
      populate: {
        path: "members",
        select: "username",
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    let allMessages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .populate({
        path: "chatId",
        populate: {
          path: "members",
          select: "username",
        },
      });

    res.status(200).json({ success: true, data: allMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (deletedMessage) {
      const remainMessages = await Message.find({ chatId })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "chatId",
          populate: {
            path: "members",
            select: "username",
          },
        });
      if (remainMessages.length > 0) {
        res.status(200).json({
          success: true,
          data: remainMessages,
        });
      } else {
        await Chat.findByIdAndDelete(chatId);
        res.status(200).json({ success: true, data: [] });
      }
    } else {
      res.status(200).json({ success: true, data: [] });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId, chatId } = req.params;

    const { isMessageReact } = req.body;

    console.log("param msg Id " + messageId);

    await Message.findByIdAndUpdate(messageId, {
      react: isMessageReact,
    });

    const allMessages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .populate({
        path: "chatId",
        populate: {
          path: "members",
          select: "username",
        },
      });

    res.status(200).json({ success: true, data: allMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
