import React from "react";
import "./LoginRegister.css";
import chat from "../../assets/chat.png";

function LoginRegister({ children }) {
  return (
    <div className="layout-container">
      <div className="layout-card">
        <div className="chat-image-container">
          <img src={chat} className="chat-image" />
        </div>
        <div className="layout-form-container">
          <h1 className="layout-title">
            Connect instantly chat or call, <br /> the choice is yours.
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
