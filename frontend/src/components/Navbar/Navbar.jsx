import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { jwtDecode } from "jwt-decode";
import { MdOutlineVideoCall, MdAddCall } from "react-icons/md";
import { userAvatar } from "../Utils/Utils";

function Navbar() {
  const token = localStorage.getItem("chat-app-token");
  const navigate = useNavigate();

  const dropdownRef = useRef(null);

  const decodeToken = token ? jwtDecode(token) : "";
  const [isShow, setIsShow] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("chat-app-token");
    localStorage.removeItem("user_id");
    navigate("/login");
    setIsShow(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsShow(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar-container">
      <div className="navbar-logo-card">
        <h1>Chat & Call</h1>
      </div>
      {!token ? (
        <ul className="navbar-menu-container">
          <li className="navbar-menu-item">
            <Link to="/login" className="navbar-item">
              Login
            </Link>
          </li>
          <li className="navbar-menu-item">
            <Link to="/register" className="navbar-item">
              Register
            </Link>
          </li>
        </ul>
      ) : (
        <div className="navbar-items-container">
          <div className="navbar-icon-avatar-card">
            <div className="navbar-icons-card">
              <MdAddCall className="navbar-icon" />
              <MdOutlineVideoCall className="navbar-icon" />
            </div>
            <div
              className="users-item-avatar"
              style={{ backgroundColor: userAvatar(decodeToken.user_name) }}
              onClick={() => setIsShow(!isShow)}
            >
              <span className="users-item-logo">
                {decodeToken.user_name[0]}
              </span>
            </div>
          </div>
          {isShow && (
            <div className="list-container" ref={dropdownRef}>
              <p className="logout-button" onClick={handleLogout}>
                Logout
              </p>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
