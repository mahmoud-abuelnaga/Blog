// packages
const {body} = require("express-validator");

const validEmail = body("email", "Please provide a valid email")
    .trim()
    .notEmpty({ignore_whitespace: true})
    .isEmail();

const validPass = body("password")
    .trim()
    .custom((pass) => {
        const regex = /\\s/;
        if (regex.test(pass)) {
            return false;
        } else {
            return true;
        }
    })
    .withMessage("password can't have white spaces.")
    .isLength({
        min: 5,
    });

const validName = body("name", "please enter a name of at least 5 chars")
    .trim()
    .notEmpty({ignore_whitespace: true})
    .isLength({
        min: 5,
    });

const validSignup = [validName, validEmail, validPass];

module.exports = {
    validEmail,
    validName,
    validPass,
    validSignup,
}