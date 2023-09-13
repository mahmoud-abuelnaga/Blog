// packages
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { createServer } = require("http");
const socketServer = require("./util/socket");

// constants
const DATABASE = "blog";
const URI = `mongodb+srv://mahmoud:${process.env.mongodb_cluster0_pass}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;

// Vars

// routes
const feedRoutes = require("./routes/feed");
const userRoutes = require("./routes/user");

// middlewares
const { allowCORS } = require("./middlewares/index");
const { isLoggedIn } = require("./middlewares/user");

// app
const app = express();
const httpServer = createServer(app);
socketServer.init(httpServer);

app.use(allowCORS);
app.use(express.json()); // To parse incoming json data
app.use(express.static(path.join(__dirname, "public")));

// register routes
app.use("/feed", isLoggedIn, feedRoutes);
app.use("/users", userRoutes);

const main = async () => {
    await mongoose.connect(URI);
    console.log("connected to database");

    // socketServer.getIO().on("connection", (socket) => {
    //     console.log("user connected");
    // });

    httpServer.listen(8080, () => {
        console.log("server running at http://localhost:8080");
    });
};

main();