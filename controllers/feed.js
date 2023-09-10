// packages
const express = require("express");
const {
    validationResult,
    Result,
    ValidationError,
} = require("express-validator");
const path = require("path");
const fs = require("fs/promises");

// models
const Post = require("../models/Post");

// util
const rootDir = require("../util/path");
const { send500Res, send404Res } = require("../util/response");

// helpers
/**
 * Sends validation error response with status code of 422 in JSON format with errors under the key `errors`
 *
 * @param {express.Response} res
 * @param {Result<ValidationError>} result
 */
const sendErrorRes = (res, result, image) => {
    const errors = {};

    const errs = result.mapped();
    if (errs.title) {
        errors.title = {
            message: errs.title.msg,
            value: errs.title.value,
        };
    }

    if (errs.content) {
        errors.content = {
            message: errs.content.msg,
            value: errs.content.value,
        };
    }

    if (!image) {
        errors.image = {
            message: "You need to upload an image.",
        };
    }

    return res.status(422).json({
        message: "Invalid input.",
        errors,
    });
};

/**
 * Gets the list of all posts from the database & sends them to the client.
 *
 * Data format: {posts: [{_id, title, content, creator, createdAt, updatedAt}]}
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.getAllPosts = async (req, res, next) => {
    let posts;
    try {
        posts = await Post.find().populate({
            path: "creator",
            select: "_id name",
        });

        for (let post of posts) {
            // tmp
            post._doc.creator = {
                name: "Mahmoud",
            };
        }
    } catch (err) {
        console.log(err);
        return send500Res("Error fetching data from database.");
    }

    return res.status(200).json({
        message: "Posts fetched successfully",
        posts,
    });
};

/**
 * Gets the list of page posts from the database & sends them to the client.
 *
 * Data format: {posts: [{_id, title, content, creator, createdAt, updatedAt}]}
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.getPosts = async (req, res, next) => {
    let posts;
    const postsPerPage = parseInt(req.headers["posts-per-page"]);
    const page = req.query.page || 1;
    let totalItems;

    try {
        totalItems = await Post.count();
        // const lastPage = Math.ceil(totalItems/postsPerPage);
        // if (page < 1 || page > lastPage) {
        //     return res.status(422).json({
        //         message: "Invalid page",
        //     })
        // }

        posts = await Post.find()
            .skip((page - 1) * postsPerPage)
            .limit(postsPerPage)
            .populate({
                path: "creator",
                select: "_id name",
            });

        for (let post of posts) {
            // tmp
            post._doc.creator = {
                name: "Mahmoud",
            };
        }
    } catch (err) {
        console.log(err);
        return send500Res("Error fetching data from database.");
    }

    return res.status(200).json({
        message: "Posts fetched successfully",
        posts,
        totalItems,
    });
};

/**
 * Creates a post & send a confirmation response
 *
 * Response format: {message: string, post: {_id: string, title: string, content: string}}
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.createPost = async (req, res, next) => {
    let post;
    const image = req.file;
    const result = validationResult(req);

    if (!result.isEmpty() || !image) {
        return sendErrorRes(res, result, image);
    } else {
        // create a new post
        try {
            post = await Post.create(req.body);
        } catch (err) {
            console.log(err);
            return send500Res("Error creating post in the database.");
        }

        // change image name
        const imageType = image.mimetype.split("/")[1];
        const imageName = post._id.toString() + "." + imageType;
        const newImagePath = path.join(rootDir, "public", "images", imageName);
        try {
            await fs.rename(image.path, newImagePath);
            // save imageUrl in database
            post.imageUrl = path.join("images", imageName);
            post = await post.save();
        } catch (err) {
            console.log(err);
            await post.deleteOne();
            return send500Res("Error saving the image.");
        }

        post._doc.creator = {
            // tmp
            name: "Mahmoud",
        };
        return res.status(201).json({
            message: "Post Created!",
            post,
        });
    }
};

/**
 * Gets the post with the corresponding id in parameters
 *
 * Response format: {message: string, post: {_id: string, title: string, content: string}}
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.getPost = async (req, res, next) => {
    let post;
    try {
        post = await Post.findById(req.params.postId);
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error fetching post from the database",
        });
    }
    if (post) {
        post._doc.creator = {
            // tmp
            name: "Mahmoud",
        };

        return res.status(200).json({
            message: "Post fetched successfully.",
            post,
        });
    } else {
        return res.status(404).json({
            message: "Post not found!",
        });
    }
};

/**
 * Deletes the post with the corresponding id in parameters
 *
 * Response format: {message: string, post: {_id: string, title: string, content: string}}
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.deletePost = async (req, res, next) => {
    let post;
    try {
        post = await Post.findByIdAndDelete(req.params.postId);
    } catch (err) {
        console.log(err);
        return send500Res("Error deleting post from the database");
    }

    try {
        await fs.unlink(path.join(rootDir, "public", post.imageUrl));
    } catch (err) {
        console.log(err);
    }

    if (post) {
        return res.status(200).json({
            message: "Deleted Post!",
            post,
        });
    } else {
        return res.status(404).json({
            message: "Post not found!",
        });
    }
};

/**
 * Edit the post with the corresponding id in parameters
 *
 * Response format: {message: string, post: {_id: string, title: string, content: string}}
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.editPost = async (req, res, next) => {
    let post;
    const title = req.body.title;
    const content = req.body.content;
    const image = req.file;
    const result = validationResult(req);

    if (!result.isEmpty()) {
        return sendErrorRes(res, result);
    } else {
        try {
            post = await Post.findByIdAndUpdate(
                req.params.postId,
                { title, content },
                { new: true }
            );
        } catch (err) {
            console.log(err);
            return send500Res(res, "Database Error: Can't update post");
        }

        if (post) {
            if (image) {
                // change image name
                const imageType = image.mimetype.split("/")[1];
                const imageName = post._id.toString() + "." + imageType;
                const newImagePath = path.join(
                    rootDir,
                    "public",
                    "images",
                    imageName
                );
                post.imageUrl = path.join("images", imageName);
                try {
                    post = await post.save();
                    await fs.rename(image.path, newImagePath);
                } catch (err) {
                    console.log(err);
                    return send500Res(
                        res,
                        "Error updating the image. Please retry editing the post."
                    );
                }
            }

            post._doc.creator = {
                // tmp
                name: "Mahmoud",
            };
            return res.status(200).json({
                message: "Post updated!",
                post,
            });
        } else {
            fs.unlink(image.path);
            return send404Res(res, "Post not found!");
        }
    }
};
