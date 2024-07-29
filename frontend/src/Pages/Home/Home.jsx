import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";
import chatImage from "../../assets/chat-image.png";

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-page-container">
        <div className="home-page-card">
          <div className="home-page-title-card">
            <h1 className="home-quote top">
              Stay connected with seamless chat and call experiences
            </h1>
            <h1 className="home-quote">
              where every message and conversation matters.
            </h1>
          </div>
          <div className="landing-page-image-card">
            <img src={chatImage} className="landing-page-image" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
