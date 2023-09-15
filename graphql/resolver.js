const {getAllPosts, getPagePosts, createPost, editPost, getOnePost, deletePost} = require("./resolvers/post");
const {signup, login, getStatus, editStatus} = require("./resolvers/user");

const rootValue = {
    getAllPosts,
    getPagePosts,
    createPost,
    editPost,
    getOnePost,
    deletePost,
    signup,
    login,
    getStatus,
    editStatus,
};

module.exports = rootValue;