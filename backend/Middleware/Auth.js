const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

exports.authentication = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({ success: false, message: "Email does not exist" });
    } else {
      const isPasswordMatched = await user.matchPassword(req.body.password);

      if (isPasswordMatched) {
        next();
      } else {
        res
          .status(403)
          .json({ success: false, message: "You're entered wrong password" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Somenthing went wrong, please try again",
    });
  }
};

exports.authorization = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (token) {
      const jwtToken = token.split(" ");
      const decodedToken = jwt.verify(jwtToken[1], secretKey);

      if (token) {
        req.id = decodedToken.id;
        req.userName = decodedToken.user_name;
        next();
      } else {
        res
          .status(403)
          .json({ success: false, message: "You are not authorized" });
      }
    } else {
      res
        .status(403)
        .json({ success: false, message: "You are not authorized" });
    }
  } catch (error) {
    if (error.message === "jwt expired") {
      res.status(401).json({ success: false, message: "Token Expired" });
    } else {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Somenthing went wrong, please try again",
      });
    }
  }
};
