import React, { useEffect, useRef, useState } from "react";
import "./Chat.css";
import Navbar from "../../components/Navbar/Navbar";
import { IoMdSearch } from "react-icons/io";
import axios from "axios";
import UserSearchList from "../../components/UserSearchList/UserSearchList";
import UsersList from "../../components/UsersList/UsersList";
import UserChatMessages from "../../components/UserChatMessages/UserChatMessages";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";

function Chat() {
  const [usersArray, setUsersArray] = useState([]);
  const [error, setError] = useState(false);
  const [userListShow, setUserListShow] = useState(false);
  const token = localStorage.getItem("chat-app-token");
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [selectUser, setSelectUser] = useState({});
  const [isChat, setIsChat] = useState("");

  const decodeToken = jwtDecode(token);

  const currentToken = Date.now() / 1000;

  const navigate = useNavigate();

  const searchRef = useRef();
  const inputRef = useRef();

  const fetchUserArray = async () => {
    try {
      setLoading(true);
      const options = {
        headers: {
          authorization: `Barear ${token}`,
        },
      };
      const res = await axios.get(`/chat/users?search=${searchUser}`, options);
      if (res.data.success) {
        setUsersArray(res.data.data);
      }
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  };

  const handleFocus = () => {
    setUserListShow(true);
    fetchUserArray();
  };

  const handleChange = (e) => {
    setSearchUser(e.target.value);
  };

  const handleOutsideClick = (e) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(e.target) &&
      !inputRef.current.contains(e.target)
    ) {
      setUserListShow(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const expireToken = decodeToken.exp;

    if (currentToken > expireToken) {
      localStorage.removeItem("chat-app-token");
      localStorage.removeItem("user_id");
      navigate("/login");
    }
  }, [currentToken]);

  return (
    <>
      <Navbar />
      <div className="chat-page-container">
        <div className="chat-page-user-card">
          <div className="title-search-card">
            <h1 className="my-chat-title">My Chats</h1>
            <div className="search-card" ref={inputRef}>
              <input
                className="search-input"
                type="text"
                placeholder="Search"
                onFocus={handleFocus}
                value={searchUser}
                onChange={handleChange}
              />
              <IoMdSearch
                className="search-icon"
                onClick={() => {
                  if (searchUser) {
                    setUserListShow(true);
                    fetchUserArray();
                    setSearchUser("");
                  }
                }}
              />
            </div>
            {userListShow && (
              <div className="search-result-card" ref={searchRef}>
                {loading ? (
                  <span>
                    <MagnifyingGlass
                      visible={true}
                      height="50"
                      width="50"
                      ariaLabel="magnifying-glass-loading"
                      wrapperStyle={{}}
                      wrapperClass="magnifying-glass-wrapper"
                      glassColor="#c0efff"
                      color="#e15b64"
                    />
                  </span>
                ) : usersArray.length !== 0 ? (
                  <ul className="user-list-contaner">
                    {usersArray.map((user) => (
                      <UserSearchList
                        key={user._id}
                        user={user}
                        setSelectUser={setSelectUser}
                        setUserListShow={setUserListShow}
                      />
                    ))}
                  </ul>
                ) : (
                  <span>No Users Found</span>
                )}
              </div>
            )}
          </div>
          <div className="chat-user-list-container">
            <UsersList
              selectedUser={selectUser}
              setUserChat={(obj) => setSelectUser(obj)}
              isChat={isChat}
            />
          </div>
        </div>
        <div className="chat-page-message-card">
          <UserChatMessages
            selectedUserChat={selectUser}
            setIsChat={setIsChat}
          />
        </div>
      </div>
    </>
  );
}

export default Chat;
