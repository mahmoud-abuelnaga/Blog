// packages
const express = require("express");
const bcrypt = require("bcrypt");
const { validationResult, ValidationError } = require("express-validator");

// utilties
const { send500Res } = require("../util/response");

// models
const User = require("../models/User");

// constants
const saltRounds = 10;

// helpers
/**
 * Sends validation error response with status code of 422 in JSON format with errors under the key `errors`
 *
 * @param {express.Response} res
 * @param {Result<ValidationError>} result
 */
const sendErrorRes = (res, result) => {
    const errors = {};

    const errs = result.mapped();
    if (errs.name) {
        errors.name = {
            message: errs.name.msg,
            value: errs.name.value,
        };
    }

    if (errs.password) {
        errors.password = {
            message: errs.password.msg,
            value: errs.password.value,
        };
    }

    if (errs.email) {
        errors.email = {
            message: errs.email.msg,
            value: errs.email.value,
        };
    }

    return res.status(422).json({
        message: "Invalid input.",
        errors,
    });
};

/**
 * Signs-up the user to the database
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.signup = async (req, res, next) => {
    let user;
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return sendErrorRes(res, result);
    } else {
        try {
            req.body.password = await bcrypt.hash(
                req.body.password,
                saltRounds
            );
            user = await User.create(req.body);
        } catch (err) {
            console.log(err);
            if (err.code == 11000) {
                // user already exists
                return res.status(422).json({
                    message: "This user already exists",
                    email: req.body.email,
                });
            } else {
                return send500Res(res, "Database Error: Can't create user");
            }
        }

        return res.status(201).json({
            message: "User created!",
            userId: user._id,
        });
    }
};

/**
 * Checks if user data is correct for login
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
exports.login = async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if (user) {
        if (user.checkPass(req.body.password)) {
            return res.status(200).json({
                message: "Correct login data.",
            });
        } else {
            return res.status(422).json({
                message: "Invalid email or password.",
            })
        }
    } else {
        return res.status(422).json({
            message: "Invalid email or password.",
        })
    }
}