// packages
const express = require("express");
const jwt = require("jsonwebtoken");

// models
const User = require("../models/User");

/**
 * Check if the request carries a valid JWT, if so it sets the JWT owner under `req.user` & calls `next()`
 *
 * @param token
 */
exports.isLoggedIn = async (token) => {
    let error;
    if (!token) {
        error = new Error("Not Authenticated!");
        error.status = 401;
        throw error;
    }

    const decodedToken = jwt.decode(token);
    const user = await User.findOne({
        _id: decodedToken.userId,
        email: decodedToken.email,
    });
    if (user) {
        try {
            jwt.verify(token, user.secret); // this is the decoded token
            return user;
        } catch (err) {
            error = new Error("Not Authenticated!");
            error.status = 401;
            throw error;
        }
    } else {
        error = new Error("Not Authenticated!");
        error.status = 401;
        throw error;
    }
};
