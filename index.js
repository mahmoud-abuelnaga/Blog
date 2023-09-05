// packages
const express = require("express");

// routes
const feedRoutes = require("./routes/feed");

const app = express();
app.use(express.json());    // To parse incoming json data

// register routes
app.use("/feed", feedRoutes);

app.listen(8080);
