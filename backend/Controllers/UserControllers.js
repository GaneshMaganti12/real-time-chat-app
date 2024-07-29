const User = require("../Models/UserModel");

exports.userRegister = async (req, res) => {
  try {
    await User.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "You are successfully registered" });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      res.status(403).json({ success: false, message: "User already exists." });
    } else {
      res.status(500).json({
        success: false,
        message: "Something went wrong, Please try again",
      });
    }
  }
};

exports.userLogin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const jwtToken = await user.generateJwtToken();
    res.status(200).json({
      success: true,
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong, Please try again",
    });
  }
};
