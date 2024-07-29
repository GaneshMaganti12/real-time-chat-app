const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const colors = require("colors");
require("dotenv").config();
const userRoute = require("./Routes/UserRoute");
const chatRoute = require("./Routes/ChatRoute");
const messageRoute = require("./Routes/MessageRoute");
const path = require("path");

const mongoURL = process.env.MONGO_URL;
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("backend connected to the database".bgCyan);
  } catch (error) {
    console.log(error);
  }
};

connectToDatabase();

app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/chat/message", messageRoute);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname1, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running successfully");
  });
}

const server = app.listen(port, () =>
  console.log(`server is running at port ${port}`.white)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log("user id " + userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined in a room: " + room);
  });

  socket.on("send message", (newMessageReceived) => {
    let chat = newMessageReceived.chatId;

    if (!chat.members.length) return console.log("chat users not found");

    chat.members.forEach((user) => {
      if (user._id === newMessageReceived.senderId) return;

      socket.in(user._id).emit("received message", newMessageReceived);
    });
  });

  socket.on("new chat", (newChatUser) => {
    const receiver = newChatUser.receiver;
    const message = newChatUser.latestMessage;

    if (!message) return console.log("User doesn't have latest message");

    console.log("received Id: " + receiver._id);

    socket.in(receiver._id).emit("received chat", newChatUser);
  });

  socket.on("delete message", (newchatMessage, receiver) => {
    if (Array.isArray(newchatMessage).length)
      return console.log("no messages in the chat");

    console.log("receiver Id: " + receiver._id);

    socket.in(receiver._id).emit("updated messages", newchatMessage);
  });

  socket.on("update react", (newChatUpdate, receiver) => {
    if (Object.keys(receiver).length === 0)
      return console.log("receiver does not exist");

    console.log("receiver Id : " + receiver._id);

    socket.in(receiver._id).emit("chat update", newChatUpdate);
  });

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userId);
  });
});
