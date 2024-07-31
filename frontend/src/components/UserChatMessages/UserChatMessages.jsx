import React, { useEffect, useState } from "react";
import "./UserChatMessages.css";
import axios from "axios";
import { io } from "socket.io-client";
import { ThreeDots } from "react-loader-spinner";
import { transformMessage, transformMessageData } from "../Utils/Utils";
import { MdAutoDelete } from "react-icons/md";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ENDPOINT = "https://chat-and-call-app.onrender.com";
var socket;

function UserChatMessages(props) {
  const { selectedUserChat, setIsChat } = props;

  const { chatId, receiver } = selectedUserChat;

  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageId, setMessageId] = useState("");

  const token = localStorage.getItem("chat-app-token");
  const userId = localStorage.getItem("user_id");

  const decodeToken = jwtDecode(token);

  const currentToken = Date.now() / 1000;

  const navigate = useNavigate();

  const fetchgetAllMessages = async () => {
    try {
      setLoading(true);
      const options = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(`/chat/message/${chatId}`, options);
      if (res.data.success) {
        setChatMessages(transformMessageData(res.data.data, userId));
        socket.emit("join chat", chatId);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (chatId) {
      fetchgetAllMessages();
    }
  }, [chatId]);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userId);
    socket.on("connected", () => console.log("connect"));

    return () => {
      socket.off("setup");
    };
  }, [userId]);

  useEffect(() => {
    socket.on("received message", (newMessageReceived) => {
      setChatMessages([newMessageReceived, ...chatMessages]);
    });

    socket.on("updated messages", (newMessageReceived) => {
      console.log("updated chat");
      setChatMessages(transformMessageData(newMessageReceived, userId));
    });

    socket.on("chat update", (newUpdateMessages) => {
      console.log("react updated");
      setChatMessages(transformMessageData(newUpdateMessages, userId));
    });
  });

  const handleChange = (e) => {
    setNewMessage(e.target.value);
  };

  const fetchCreateMessage = async () => {
    try {
      const options = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const messageData = {
        content: newMessage,
        chatId: chatId,
      };
      const res = await axios.post("/chat/message", messageData, options);
      if (res.data.success) {
        const data = res.data.data;

        socket.emit("send message", data);

        setTimeout(() => {
          socket.emit("new chat", transformMessage(data));
        }, 500);
        setIsChat(data.chatId._id);

        setChatMessages(transformMessageData([data, ...chatMessages], userId));
        setMessageId(data._id);
        setError(false);
      }
    } catch (error) {
      if (error.response.data.message === "Token Expired") {
        return setError(true);
      }
      console.log(error);
    }
  };

  const handleDeleteMsg = async (messageId) => {
    console.log(receiver);
    try {
      const options = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.delete(
        `/chat/message/${chatId}/${messageId}`,
        options
      );
      if (res.data.success) {
        socket.emit("delete message", res.data.data, receiver);
        setChatMessages(transformMessageData(res.data.data, userId));
        setError(false);
      }
    } catch (error) {
      if (error.response.data.message === "Token Expired") {
        return setError(true);
      }
      console.log(error);
    }
  };

  const handleUpdateMessge = async (chatId, messageId, react) => {
    console.log(react);
    try {
      const options = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const data = {
        isMessageReact: !react,
      };

      const res = await axios.patch(
        `/chat/message/${chatId}/${messageId}`,
        data,
        options
      );

      if (res.data.success) {
        socket.emit("update react", res.data.data, receiver);
        setChatMessages(transformMessageData(res.data.data, userId));
      }
    } catch (error) {
      if (error.response.data.message === "Token Expired") {
        return setError(true);
      }
      console.log(error);
    }
  };

  useEffect(() => {
    if (messageId) {
      const time = 2 * 60 * 1000;

      setTimeout(() => {
        setChatMessages((prevMessages) =>
          prevMessages.map((item) => {
            if (item._id === messageId) {
              return { ...item, isOlder: true };
            }
            return item;
          })
        );

        setMessageId("");
      }, time);
    }
  }, [messageId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage) {
      fetchCreateMessage();
      setNewMessage("");
    }
  };

  useEffect(() => {
    const expireToken = decodeToken.exp;

    if (currentToken > expireToken) {
      localStorage.removeItem("chat-app-token");
      localStorage.removeItem("user_id");
      navigate("/login");
    }
  }, [decodeToken.exp]);

  return (
    <>
      {loading ? (
        <span>
          <ThreeDots
            visible={true}
            height="50"
            width="50"
            color="#343434"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </span>
      ) : (
        <>
          {chatId ? (
            <div className="chat-user-messages-container">
              <div className="chat-user-name-card">
                <h1 className="chat-user-name">{receiver.username}</h1>
              </div>
              <div className="chat-user-messages-card">
                <ul className="chat-user-messages-list">
                  {chatMessages.map((message) => {
                    return message.senderId === userId ? (
                      <li key={message._id} className="message-user-item-card">
                        <div className="message-user-item">
                          <p className="message-text">{message.text}</p>
                          {!message.isOlder && (
                            <MdAutoDelete
                              className="delete-icon"
                              onClick={() => handleDeleteMsg(message._id)}
                            />
                          )}
                          <span className="user-like-button-card">
                            {message.react && (
                              <FaHeart className="user-like-button" />
                            )}
                          </span>
                        </div>
                      </li>
                    ) : (
                      <li className="message-list-item" key={message._id}>
                        <span className="message">{message.text}</span>
                        <span className="like-button-card">
                          {message.react ? (
                            <FaHeart
                              className="like-button"
                              onClick={() =>
                                handleUpdateMessge(
                                  message.chatId._id,
                                  message._id,
                                  message.react
                                )
                              }
                            />
                          ) : (
                            <FaRegHeart
                              className="like-button unlike"
                              onClick={() =>
                                handleUpdateMessge(
                                  message.chatId._id,
                                  message._id,
                                  message.react
                                )
                              }
                            />
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <form className="chat-message-input-card" onSubmit={handleSend}>
                  <input
                    className="message-text-input"
                    type="text"
                    placeholder="Type a message"
                    value={newMessage}
                    onChange={handleChange}
                  />
                  <button className="chat-message-button" type="submit">
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <span className="no-chat-messages">
              Tap on a chat to start conversion
            </span>
          )}
        </>
      )}
    </>
  );
}

export default UserChatMessages;
