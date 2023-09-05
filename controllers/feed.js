// packages
const express = require("express");


/**
 * Gets the list of posts from the database & sends them to the client.
 * 
 * Data format: [{title: string, content: string}]
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
module.exports.getPosts = (req, res, next) => {
    // Get list of posts

    res.status(200).json([{title: "First Post!", content: "My first post."}]);
}


/**
 * Creates a post & send a confirmation response
 * 
 * Response format: {message: string, post: {_id: string, title: string, content: string}}
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 */
module.exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;

    // Create a post

    res.status(201).json({
        message: "Post Created!",
        post: {_id: new Date().toISOString(), title, content}
    });
}