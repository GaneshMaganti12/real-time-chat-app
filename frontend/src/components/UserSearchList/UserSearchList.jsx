import React from "react";
import "./UserSearchList.css";
import axios from "axios";
import { transformUserChatData, userAvatar } from "../Utils/Utils";
import { jwtDecode } from "jwt-decode";

function UserSearchList(props) {
  const { user, setSelectUser, setUserListShow } = props;
  const token = localStorage.getItem("chat-app-token");

  const userId = localStorage.getItem("user_id");

  const fetchCreateUserChat = async () => {
    try {
      const options = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };
      const data = {
        receiverId: user._id,
      };
      const res = await axios.post("/chat/user-chat", data, options);
      if (res.data.success) {
        setSelectUser(transformUserChatData(res.data.data, userId));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = () => {
    fetchCreateUserChat();
    setUserListShow(false);
  };

  return (
    <li className="user-list-item" onClick={handleClick}>
      <div
        className="user-avatar"
        style={{ backgroundColor: userAvatar(user.username) }}
      >
        <span className="user-logo">{user.username[0]}</span>
      </div>
      <p className="user-name">{user.username}</p>
    </li>
  );
}

export default UserSearchList;
