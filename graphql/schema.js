// packages
const {graphql, buildSchema} = require("graphql");

// Define a query Schema
const schema = buildSchema(`
    type LoginOut {
        token: String!
        userId: ID!
    }

    type PagePosts {
        posts: [Post]
        totalPosts: Int!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        status: String!
        getPosts: [Post]
    }

    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type Mutation {
        signup(name: String!, email: String!, password: String!): User
        login(email: String!, password: String!): LoginOut
        editStatus(status: String!): String!
        createPost(title: String!, content: String!): Post
        editPost(_id: ID!, title: String!, content: String!): Post
        deletePost(_id: ID!): Post
    }

    type Query {
        getStatus: String!
        getAllPosts: [Post]
        getOnePost(_id: ID!): Post
        getPagePosts(page: Int, limit: Int!): PagePosts
    }
`);

// graphql({
//     schema,
//     source: "{ hello }",
//     rootValue,
// })
// .then(result => {
//     console.log(result);
// })


module.exports = schema;
