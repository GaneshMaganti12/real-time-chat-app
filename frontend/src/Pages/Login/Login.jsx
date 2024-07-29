import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import "./Login.css";
import LoginRegister from "../../components/LoginRegister/LoginRegister";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [isShow, setIsShow] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUserDetails({
      ...userDetails,
      [name]: name === "email" ? value.toLowerCase() : value,
    });
  };

  const validateFields = (detail) => {
    const { email, password } = detail;

    if (!email || !password) {
      if (!email && !password) {
        return "Please fill out all fields";
      }
      return !email ? "Please enter the email" : "Please enter the password";
    }
    return;
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
      const res = await axios.post("/user/login", userDetails);
      if (res.data.success) {
        setError("");

        const decodeToken = jwtDecode(res.data.token);
        localStorage.setItem("chat-app-token", res.data.token);
        localStorage.setItem("user_id", decodeToken.id);
        navigate("/chat");
      } else {
        setError(res.data.message);
      }
    } catch (error) {
      if (error.response.status) {
        setError(error.response.data.message);
      }
    }

    setLoading(false);

    setUserDetails({
      email: "",
      password: "",
    });
    setIsShow(false);
  };

  useEffect(() => {
    setUserDetails({
      email: "",
      password: "",
    });
    setError("");
    setIsShow(false);
  }, []);

  return (
    <>
      <Navbar />
      <LoginRegister>
        <div className="login-form-container">
          <h1 className="login-title">Log In To Your Account</h1>
          <form
            className="login-form-card"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <input
              className="login-input"
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
            <button className="login-button" type="submit">
              Login {loading && <span className="loader"></span>}
            </button>
            {error && <span className="login-error">{error}</span>}
          </form>
          <p className="account-para">
            Don't have an account?
            <span
              className="login-register-button"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>
        </div>
      </LoginRegister>
    </>
  );
}

export default Login;
