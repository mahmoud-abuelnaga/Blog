// packages
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// models
const Post = require("./Post");

// model
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        set: (email) => email.trim().toLowerCase(),
    },

    password: {
        type: String,
        required: true,
    },

    name: {
        type: String,
        required: true,
        set: (name) => name.trim(),
    },

    status: {
        type: String,
        set: (status) => status.trim(),
        default: "I am new!",
    },

    secret: {
        type: String,
        default: crypto.randomBytes(32).toString("utf-8"),
    }
},

{
    methods: {
        /**
         * Gets all user's posts
         * 
         * @returns {Array<Post>} all the posts that the user created
         */
        async getPosts() {
            const posts = await Post.find({userId: this._id});
            return posts;
        },

        /**
         * Check `pass` against the hashed password.
         * 
         * @param {String} pass 
         * @returns {boolean} Returns true if `pass` matches the hashed password, false otherwise.
         */
        async checkPass(pass) {
            const isCorrect = await bcrypt.compare(pass, this.password);
            return isCorrect;
        },
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;