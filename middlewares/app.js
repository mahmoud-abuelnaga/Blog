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
    res.setHeader("Access-Control-Allow-Origin", "*");  // Allow all domains to access our resources
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE"); // Allow those methods

    /**
     * Set what headers the client is allowed to set in case of CORS.
     * We allowed the client to set `Content-Type` to be able to send `JSON` requests.
     * We allowed the client to set `Authorization` Header in order to add authorization in our application
     * Use `*` to allow the client to set any headers
     */
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authentication, Posts-Per-Page");

    if (req.method == "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
}