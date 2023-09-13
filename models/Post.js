// packages
const mongoose = require("mongoose");

// models
// const User = require("./User");

// model
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        set: (title) => title.trim(),
    },

    content: {
        type: String,
        required: true,
        set: (content) => content.trim(),
    },

    imageUrl: {
        type: String,
        set: (url) => url.trim(),
    },

    creator: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
    }
},

{
    methods: {
        async getUser() {
            await this.populate({path: "creator", select: "_id name"});
            return this.creator;
        },
    },

    timestamps: true,   // createdAt & updatedAt fields are created & managed automatically
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;