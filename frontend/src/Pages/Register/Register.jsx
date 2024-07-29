import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Register.css";
import LoginRegister from "../../components/LoginRegister/LoginRegister";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [isShow, setIsShow] = useState(false);
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { value, name } = e.target;

    setUserDetails({
      ...userDetails,
      [name]: name === "email" ? value.toLowerCase() : value,
    });
  };

  const validateFields = (details) => {
    const { username, email, password } = details;
    if (username && email && password) {
      return;
    }

    return "Please fill out all fields";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const err = validateFields(userDetails);

    if (err) {
      setError(err);
    } else {
      fetchPost();
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/user/register", userDetails);
      if (res.data.success) {
        setMessage(res.data.message);
        setError("");
      } else {
        setError(res.data.message);
        setMessage("");
      }
    } catch (error) {
      if (error.response.status) {
        setError(error.response.data.message);
        setMessage("");
      }
    }

    setUserDetails({
      username: "",
      email: "",
      password: "",
    });
    setIsShow(false);
    setLoading(false);
  };

  useEffect(() => {
    setUserDetails({
      username: "",
      email: "",
      password: "",
    });
    setMessage("");
    setError("");
    setIsShow(false);
  }, []);

  return (
    <>
      <Navbar />
      <LoginRegister>
        <div className="register-form-container">
          <h1 className="register-title">Create Your Account</h1>
          <form
            className="register-form-card"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <input
              className="register-input"
              type="text"
              placeholder="Username"
              name="username"
              onChange={handleChange}
              value={userDetails.username}
            />
            <input
              className="register-input"
              type="email"
              placeholder="Email"
              name="email"
              onChange={handleChange}
              value={userDetails.email}
            />
            <div className="input-icon-card">
              <input
                type={isShow ? "text" : "password"}
                className="input"
                placeholder="Password"
                name="password"
                onChange={handleChange}
                value={userDetails.password}
              />
              {isShow ? (
                <IoIosEyeOff
                  className="input-icon"
                  onClick={() => setIsShow(false)}
                />
              ) : (
                <IoIosEye
                  className="input-icon"
                  onClick={() => setIsShow(true)}
                />
              )}
            </div>
            <button type="submit" className="register-button">
              Register {loading && <span className="loader"></span>}
            </button>
            {message && <span className="register-message">{message}</span>}
            {error && <span className="login-error">{error}</span>}
          </form>
          <p className="account-para">
            Already have an account?
            <span
              className="register-login-button"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </LoginRegister>
    </>
  );
}

export default Register;
