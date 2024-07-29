const express = require("express");
const { authentication } = require("../Middleware/Auth");
const { userRegister, userLogin } = require("../Controllers/UserControllers");
const router = express.Router();

router.post("/register", userRegister);

router.post("/login", authentication, userLogin);

module.exports = router;
