// packages
const express = require("express");

// controllers
const authController = require("../controllers/auth");

// validators
const {validSignup, validEmail} = require("../validators/auth");

const router = express.Router();

router.route("/signup")
    .post(validSignup, authController.signup);

router.route("/login")
    .post(validEmail, authController.login);


module.exports = router;