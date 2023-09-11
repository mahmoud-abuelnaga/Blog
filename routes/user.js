// packages
const express = require("express");

// controllers
const userController = require("../controllers/user");

// validators
const {validSignup, validStatus} = require("../validators/user");

// middlewares
const {isLoggedIn} = require("../middlewares/user");

const router = express.Router();

router.route("/signup")
    .post(validSignup, userController.signup);

router.route("/login")
    .post(userController.login);

router.route("/:userId/status")
    .get(isLoggedIn, userController.getStatus)
    .patch(isLoggedIn, validStatus, userController.editStatus);

module.exports = router;