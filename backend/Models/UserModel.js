const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  { Timestamp: true }
);

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJwtToken = function () {
  return jwt.sign({ id: this._id, user_name: this.username }, secretKey, {
    expiresIn: "1h",
  });
};

const User = mongoose.model("user", userSchema);

module.exports = User;
