// packages
const express = require("express");
const multer = require("multer");

// controllers
const feedController = require("../controllers/feed");

// validators
const { validPost } = require("../validators/post");

// middlewares


// constants
const upload = multer({
    dest: "public/images",
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/png"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

// routes
const router = express.Router();

router
    .route("/posts")
    .get(feedController.getPosts)
    .post(upload.single("image"), validPost, feedController.createPost);

router.route("/posts/:postId")
    .get(feedController.getPost)
    .patch(upload.single("image"), validPost, feedController.editPost)
    .delete(feedController.deletePost);
    

module.exports = router;
