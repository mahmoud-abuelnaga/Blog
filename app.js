// packages
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

// constants
const DATABASE = "blog";
const URI = `mongodb+srv://mahmoud:${process.env.mongodb_cluster0_pass}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;

// routes
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

// middlewares
const { allowCORS } = require("./middlewares/app");

// app
const app = express();
app.use(express.json()); // To parse incoming json data
app.use(allowCORS);
app.use(express.static(path.join(__dirname, "public")));

// register routes
app.use("/feed", feedRoutes);
app.use("/users", authRoutes);

const main = async () => {
    await mongoose.connect(URI);
    console.log("...Connected to database...");
    console.log("...listening to requests...");
    app.listen(8080);
};

main();