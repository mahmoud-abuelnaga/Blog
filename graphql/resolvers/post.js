// packages
const validator = require("validator");

const path = require("path");
const fs = require("fs/promises");

const rootDir = require("../../util/path");
const { isLoggedIn } = require("../../util/user");

// models
const Post = require("../../models/Post");

// helpers
/**
 * Checks if received post data is valid. If it's not, it throws an error
 *
 * @param {{title: String, content: String}} postData
 */
const validPost = (postData) => {
    const errors = [];
    if (
        validator.isEmpty(postData.title) ||
        !validator.isLength(postData.title, { min: 5 })
    ) {
        errors.push({
            message: "Invalid title! Title must be at least 5 chars",
            value: postData.title,
        });
    }

    if (
        validator.isEmpty(postData.content) ||
        !validator.isLength(postData.content, { min: 5 })
    ) {
        errors.push({
            message: "Invalid content! Contnet must be at least 5 chars",
            value: postData.content,
        });
    }

    if (errors.length != 0) {
        const err = new Error("Invalid post!");
        err.errors = errors;
        err.status = 422;
        throw err;
    }
};

/**
 * Returns array of all posts in database
 *
 * @param {*} args
 * @returns {[Post]} array of posts
 */
exports.getAllPosts = async (args, { token }) => {
    await isLoggedIn(token);

    let posts;
    try {
        posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "creator",
            select: "_id name",
        });
    } catch (err) {
        console.log(err);
        const error = new Error("Database error: Can't fetch posts");
        error.status = 500;
        throw error;
    }

    for (let post of posts) {
        post._doc.createdAt = post.createdAt.toISOString();
    }

    return posts;
};

/**
 * Gets the posts of a single page
 *
 * @param {{page: number, limit: number}} param0
 * @returns page posts
 */
exports.getPagePosts = async ({ page, limit }, { token }) => {
    await isLoggedIn(token);

    let posts;
    const postsPerPage = parseInt(limit);
    page = page || 1;
    let totalPosts;

    try {
        totalPosts = await Post.count();
        posts = await Post.find()
            .sort({ createdAt: -1 }) // sort by createdAt in an descending way
            .skip((page - 1) * postsPerPage)
            .limit(postsPerPage)
            .populate({
                path: "creator",
                select: "_id name",
            });
    } catch (err) {
        console.log(err);
        const error = new Error("Database error: Can't fetch posts");
        error.status = 500;
        throw error;
    }

    for (let post of posts) {
        post._doc.createdAt = post.createdAt.toISOString();
    }

    return {
        posts,
        totalPosts,
    };
};

exports.createPost = async (postData, { token }) => {
    const user = await isLoggedIn(token);

    postData.title = postData.title.trim();
    postData.content = postData.content.trim();
    validPost(postData);

    let post;

    // create a new post
    postData.creator = user._id;
    try {
        post = await Post.create(postData);
    } catch (err) {
        console.log(err);
        const error = new Error("Database error: Can't create the post");
        error.status = 500;
        throw error;
    }

    post._doc.creator = {
        _id: user._id.toString(),
        name: user.name,
    };
    post._doc.createdAt = post.createdAt.toISOString();

    return post;
};


exports.getOnePost = async ({_id}, {token}) => {
    const user = await isLoggedIn(token);
    let post, error;

    try {
        post = await Post.findById(_id).populate({
            path: "creator",
            select: "_id name",
        });
    } catch (err) {
        console.log(err);
        error = new Error("Database error: Can't fetch the post");
        error.status = 500;
        throw error;
    }
    if (post) {
        post._doc.createdAt = post.createdAt.toISOString();
        return post;
    } else {
        error = new Error("Post not found!");
        error.status = 404;
        throw error;
    }
};

exports.deletePost = async ({_id}, {token}) => {
    const user = await isLoggedIn(token);

    let post, error;
    try {
        post = await Post.findOneAndDelete({
            _id,
            creator: user._id,
        });
    } catch (err) {
        console.log(err);
        error = new Error("Database Error: Can't delete post");
        error.status = 500;
        throw error;
    }

    if (post) {
        try {
            await fs.unlink(path.join(rootDir, "public", post.imageUrl));
        } catch (err) {
            console.log(err);
        }

        post._doc.createdAt = post.createdAt.toISOString();
        return post;
    } else {
        error = new Error("Not authorized!");
        error.status = 403;
        throw error;
    }
};

exports.editPost = async (postData, { token }) => {
    const user = await isLoggedIn(token);
    let error, post;

    validPost(postData);
    try {
        post = await Post.findOneAndUpdate(
            { _id: postData._id, creator: user._id },
            { title: postData.title, content: postData.content },
            { new: true }
        );
    } catch (err) {
        console.log(err);
        error = new Error("Database Error: Can't update post");
        error.status = 500;
        throw error;
    }

    if (post) {
        post._doc.creator = { _id: user._id, name: user.name };
        post._doc.createdAt = post.createdAt.toISOString();

        return post;
    } else {
        if (image) {
            try {
                await fs.unlink(image.path);
            } catch (err) {
                console.log(err);
            }
        }

        error = new Error("Not authorized!");
        error.status = 403;
        throw error;
    }
};
