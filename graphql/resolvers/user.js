// packages
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const {isLoggedIn} = require("../../util/user");

// models
const User = require("../../models/User");

// constants
const saltRounds = 10;

// helpers
/**
 * Validates the user input. If it doesn't meet the criteria, an error is thrown
 *
 * @param {{name: String, email: String, password: String}} userInput
 */
const validateSignup = (userInput) => {
    const regex = /\\s/;
    const errors = [];

    if (validator.isEmpty(userInput.name)) {
        errors.push({
            message: "Invalid name! Name can't be empty.",
            value: userInput.name,
        });
    }

    if (
        !validator.isEmail(userInput.email) ||
        validator.isEmpty(userInput.email)
    ) {
        errors.push({ message: "Invalid email!", value: userInput.email });
    }

    if (
        validator.isEmpty(userInput.password) ||
        !validator.isLength(userInput.password, { min: 5 }) ||
        regex.test(userInput.password)
    ) {
        errors.push({
            message:
                "Invalid password! password must be at least 5 chars long & can't have white spaces.",
            value: userInput.password,
        });
    }

    if (errors.length != 0) {
        const err = new Error("Invalid signup!");
        err.errors = errors;
        err.status = 422;
        throw err;
    }
};

/**
 * Signup the user & returns the user created
 *
 * @param {{name: String, email: String, password: String}} userInput
 * @returns
 */
exports.signup = async (userInput) => {
    userInput.name = userInput.name.trim();
    userInput.email = userInput.email.toLowerCase().trim();
    userInput.password = userInput.password.trim();
    validateSignup(userInput);

    let user;
    try {
        userInput.password = await bcrypt.hash(userInput.password, saltRounds);
        user = await User.create(userInput);
    } catch (err) {
        console.log(err);
        if (err.code == 11000) {
            // user already exists
            const error = new Error("User already exists");
            error.status = 422;
            throw error;
        }
    }

    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
    };
};

/**
 * Checks login data & authenticate user by sending back a JWT if login data is valid.
 *
 * @param {{email: String, password: String}} param0
 * @returns {{token: String, userId: String}} An object that carries the JWT & the userId of the authenticated user
 */
exports.login = async ({ email, password }) => {
    const user = await User.findOne({ email: email });
    if (user) {
        if (user.checkPass(password)) {
            const token = jwt.sign(
                {
                    userId: user._id.toString(),
                    email: user.email,
                },
                user.secret,
                {
                    expiresIn: "1h",
                }
            );

            return {
                token,
                userId: user._id.toString(),
            };
        } else {
            const err = new Error("Invalid email or password");
            err.status = 422;
            throw err;
        }
    } else {
        const err = new Error("Invalid email or password");
        err.status = 422;
        throw err;
    }
};

/**
 * Returns the token owner status
 * 
 * @param {*} args 
 * @param {{token: String}} param1 
 * @returns 
 */
exports.getStatus = async (args, {token}) => {
    const user = await isLoggedIn(token);
    return user.status;
};

/**
 * Edits the status
 * 
 * @param {{status: String}} param0 
 * @param {{token: String}} param1 
 * @returns 
 */
exports.editStatus = async ({status}, {token}) => {
    let user = await isLoggedIn(token);
    let error;

    status = status.trim();
    if (status.length == 0) {   
        error = new Error("Invalid status!");
        error.status = 422;
        throw error;
    }

    user.status = status;
    try {
        user = await user.save();
    } catch (err) {
        console.log(err);
        error = new Error("Database error: Can't save new status");
        error.status = 500;
        throw error;
    }

    return status;
};
