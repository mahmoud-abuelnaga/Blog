// packages
const express = require("express");


/**
 * Allows CORS for all domains
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
exports.allowCORS = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authentication");

    if (req.method == "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
}