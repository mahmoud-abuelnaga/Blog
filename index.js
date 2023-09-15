// packages
const path = require("path");
const fs = require("fs/promises");

const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { createHandler } = require("graphql-http/lib/use/express");
const multer = require("multer");

const graphqlSchema = require("./graphql/schema");
const rootValue = require("./graphql/resolver");

const { allowCORS } = require("./middlewares/index");

const Post = require("./models/Post");

const { isLoggedIn } = require("./util/user");
const rootDir = require("./util/path");

// constants
const DATABASE = "blog";
const URI = `mongodb+srv://mahmoud:${process.env.mongodb_cluster0_pass}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;
const upload = multer({
    dest: "public/images",
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/jpeg" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/png"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
});

// Vars

// app
const app = express();
const httpServer = createServer(app);

app.use(allowCORS);
app.use(express.json()); // To parse incoming json data
app.use(express.static(path.join(__dirname, "public")));

// register routes
app.put("/images/:postId", upload.single("image"), async (req, res, next) => {
    let post, user;
    try {
        user = await isLoggedIn(req.headers.authentication);
    } catch (err) {
        return res.status(err.status).json({
            message: err.message,
        });
    }

    const image = req.file;
    if (!image) {
        return res.status(422).json({
            message: "You need to send an image",
        });
    }

    try {
        post = await Post.findOne({
            _id: req.params.postId,
            creator: user._id,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Database error: Can't fetch post",
        });
    }

    if (!post) {
        if (image) {
            try {
                await fs.unlink(image.path);
            } catch (err) {
                console.log(err);
            }
        }

        return res.status(401).json({
            message: "Not Authenticated or Post not found!",
        });
    }

    // change image name
    const imageType = image.mimetype.split("/")[1];
    const imageName = post._id.toString() + "." + imageType;
    const newImagePath = path.join(rootDir, "public", "images", imageName);
    post.imageUrl = path.join("images", imageName);

    try {
        await fs.rename(image.path, newImagePath);
        post = await post.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message:
                "Filesystem or Database error: Can't save image to the filesystem or can't save the new imageUrl in database",
        });
    }

    return res.status(200).json({
        message: "New image saved",
        post,
    });
});

app.all(
    "/graphql",
    createHandler({
        schema: graphqlSchema,
        rootValue,

        context: async (req) => {
            return { token: req.headers.authentication };
        },

        formatError(err) {
            if (!err.originalError) {
                return err;
            }

            return {
                message: err.message,
                status: err.originalError.status,
                errors: err.originalError.errors,
            };
        },
    })
);

const main = async () => {
    await mongoose.connect(URI);
    console.log("connected to database");

    httpServer.listen(8080, () => {
        console.log("server running at http://localhost:8080");
    });
};

main();
