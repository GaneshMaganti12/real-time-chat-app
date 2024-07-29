const Chat = require("../Models/ChatModel");
const Message = require("../Models/MessageModel");
const User = require("../Models/UserModel");

exports.getUsers = async (req, res) => {
  try {
    const userId = req.id;

    const query = { _id: { $ne: userId } };

    const { search } = req.query;

    if (search) {
      query.username = { $regex: new RegExp(search, "i") };
    }

    const usersArray = await User.find(query).select("_id username");
    res.status(200).json({ success: true, data: usersArray });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createChatUser = async (req, res) => {
  try {
    const userId = req.id;
    const { receiverId } = req.body;

    const userChatFound = await Chat.findOne({
      members: { $all: [userId, receiverId] },
    }).populate("members", "username");

    if (userChatFound) {
      res.status(200).json({ success: true, data: userChatFound });
    } else {
      let userChat = await Chat.create({
        members: [userId, receiverId],
      });

      userChat = await userChat.populate("members", "username");

      res.status(201).json({ success: true, data: userChat });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getChatUsers = async (req, res) => {
  try {
    const userId = req.id;

    let userChats = await Chat.find({
      members: { $elemMatch: { $eq: userId } },
    })
      .populate("members", "username")
      .populate({ path: "latestMessage", select: "_id" });

    let filteredChats = [];
    for (const chat of userChats) {
      const messages = await Message.find({ chatId: chat._id });

      if (messages.length > 0) {
        filteredChats.push(chat);
      } else {
        await Chat.findByIdAndDelete(chat._id);
      }
    }

    res.status(200).json({ success: true, data: filteredChats });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
