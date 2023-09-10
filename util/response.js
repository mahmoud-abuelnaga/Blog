// packages
const express = require("express");

/**
 * Send a JSON response with `500` status code.
 *
 * @param {express.Response} res
 * @param {string} message
 */
exports.send500Res = (res, message) => {
    return res.status(500).json({
        message,
    });
};

/**
 * Send a JSON response with `404` status code.
 *
 * @param {express.Response} res
 * @param {string} message
 */
exports.send404Res = (res, message) => {
    return res.status(404).json({
        message,
    });
};
