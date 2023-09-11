// packages
const express = require("express");
const jwt = require("jsonwebtoken");

// models
const User = require("../models/User");

/**
 * Check if the request carries a valid JWT, if so it sets the JWT owner under `req.user` & calls `next()`
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.isLoggedIn = async (req, res, next) => {
    const token = req.headers.authentication;
    if (!token) {
        return res.status(401).json({
            message: "Not authorized",
        });
    }
    const decodedToken = jwt.decode(token);

    const user = await User.findOne({_id: decodedToken.userId, email: decodedToken.email});
    if (user) {
        try {
            jwt.verify(token, user.secret);    // this is the decoded token
            req.user = user;
            next();
        } catch (err) {
            return res.status(401).json({
                message: "Not authenticated",
            });
        }
    } else {
        return res.status(401).json({
            message: "Not authenticated",
        });
    }
}