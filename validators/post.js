// packages
const { body } = require("express-validator");

const validTitle = body("title", "title must be at least 5 chars")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .withMessage("")
    .isLength({
        min: 5,
    });

const validContent = body("content", "content must be at least 5 chars")
    .trim()
    .notEmpty({ ignore_whitespace: true })
    .isLength({
        min: 5,
    });

const validPost = [validTitle, validContent];

module.exports = {
    validTitle,
    validContent,
    validPost,
};
