// packages
const express = require("express");

// controllers
const feedController = require("../controllers/feed");

// routes
const router = express.Router();

router.route("/posts")
    .get(feedController.getPosts)
    .post(feedController.createPost);


module.exports = router;