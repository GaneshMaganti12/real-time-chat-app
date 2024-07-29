import React, { useEffect, useState } from "react";
import "./UsersList.css";
import {
  findSelectedUserDetails,
  selectChatUsers,
  transformMessageIntoChat,
  transformUserChatData,
  userAvatar,
} from "../Utils/Utils";
import axios from "axios";
import { ThreeDots } from "react-loader-spinner";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const ENDPOINT = "http://localhost:3002";
var socket;

function UsersList(props) {
  const { selectedUser, setUserChat, isChat } = props;
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("chat-app-token");

  const userId = localStorage.getItem("user_id");

  const decodeToken = jwtDecode(token);

  const currentToken = Date.now() / 1000;

  const navigate = useNavigate();

  const fetchUserChats = async () => {
    try {
      setLoading(true);
      const options = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get("/chat/user-chats", options);

      if (res.data.success) {
        socket.emit(transformUserChatData(res.data.data, userId));
        setChatUsers(transformUserChatData(res.data.data, userId));
      } else {
        setError(true);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userId);
    socket.on("connected", () => console.log("connect"));
  });

  useEffect(() => {
    socket.emit("join chat", isChat);
  }, [isChat]);

  useEffect(() => {
    socket.on("received chat", (newChat) => {
      console.log("Received Chat");

      const findChat = chatUsers.find((item) => item.chatId === newChat.chatId);

      if (!findChat) {
        const newChatUser = transformMessageIntoChat(newChat);

        setChatUsers([newChatUser, ...chatUsers]);
      }
    });
  });

  useEffect(() => {
    if (selectedUser && Object.keys(selectedUser).length !== 0) {
      const userExists = chatUsers.find(
        (user) => user.receiver._id === selectedUser.receiver._id
      );

      setChatUsers(selectChatUsers(userExists, selectedUser, chatUsers));
    }
  }, [selectedUser]);

  useEffect(() => {
    fetchUserChats();
  }, []);

  const handleActiveUser = (chat) => {
    const userExists = chatUsers.find(
      (user) => user.receiver._id === chat.receiver._id
    );
    setUserChat(findSelectedUserDetails(chat.receiver._id, chatUsers));
    setChatUsers(selectChatUsers(userExists, chat, chatUsers));
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
        <div>
          <ThreeDots
            visible={true}
            height="40"
            width="40"
            color="#343434"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : (
        <>
          {chatUsers.length !== 0 ? (
            <ul className="users-list-container">
              {chatUsers.map((userChat, index) => (
                <React.Fragment key={userChat.chatId}>
                  <li
                    key={`${userChat.chatId}-${index}`}
                    className={`users-list-item ${
                      userChat.isActive ? "active-chat" : ""
                    }`}
                    onClick={() => handleActiveUser(userChat)}
                  >
                    <div
                      className="users-item-avatar"
                      style={{
                        backgroundColor: userAvatar(userChat.receiver.username),
                      }}
                    >
                      <span className="users-item-logo">
                        {userChat.receiver.username[0]}
                      </span>
                    </div>
                    <p
                      className={`users-item-username ${
                        userChat.isActive && "active-username"
                      }`}
                    >
                      {userChat.receiver.username}
                    </p>
                  </li>
                  <hr />
                </React.Fragment>
              ))}
            </ul>
          ) : (
            <span className="no-user-chats">No Chats Available</span>
          )}
        </>
      )}
    </>
  );
}

export default UsersList;
