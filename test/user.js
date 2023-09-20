const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const { stub } = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/User");

const { isLoggedIn } = require("../middlewares/user");

describe("User", () => {
    describe("middlewares", () => {
        describe("#isLoggedIn()", () => {
            it("Sends error response if there is no authentication header", async () => {
                const req = {
                    headers: {},
                };

                const res = {
                    status(code) {
                        this.statusCode = code;
                        return this;
                    },

                    json(resObject) {
                        this.resObject = resObject;
                        return this;
                    },
                };

                const response = await isLoggedIn(req, res, () => {});
                expect(response).to.have.property("statusCode", 401);
                expect(response).to.have.deep.property("resObject", {
                    message: "Not authenticated",
                });
            });

            it("throw error if the decoded token in invalid", async () => {
                const req = {
                    headers: {
                        authentication: "15235iohhoegrihiilbwegiu", // invalid token
                    },
                };

                const res = {
                    status(code) {
                        this.statusCode = code;
                        return this;
                    },

                    json(resObject) {
                        this.resObject = resObject;
                        return this;
                    },
                };

                try {
                    await isLoggedIn(req, res, () => {});
                } catch (err) {
                    expect(err).to.be.an("error");
                }
            });


            it("return error response if there is a database error getting the user", async () => {
                const req = {
                    headers: {
                        authentication: "15235iohhoegrihiilbwegiu", // invalid token
                    },
                };
    
                const res = {
                    status(code) {
                        this.statusCode = code;
                        return this;
                    },
    
                    json(resObject) {
                        this.resObject = resObject;
                        return this;
                    },
                };
    
                stub(jwt, "decode");
                jwt.decode.returns({userId: "123", email: "mahmoud@gmail.com"});
    
                stub(User, "findOne");
                User.findOne.throws();
    
                const response = await isLoggedIn(req, res, () => {});
                expect(response).to.have.property("statusCode", 500);
                expect(response).to.have.deep.property("resObject", {
                    message: "Database error",
                });
    
                jwt.decode.restore();
                User.findOne.restore();
            });


            it("return error response if the decoded email & userId pair is invalid", async () => {
                const req = {
                    headers: {
                        authentication: "15235iohhoegrihiilbwegiu", // invalid token
                    },
                };
    
                const res = {
                    status(code) {
                        this.statusCode = code;
                        return this;
                    },
    
                    json(resObject) {
                        this.resObject = resObject;
                        return this;
                    },
                };
    
                stub(jwt, "decode");
                jwt.decode.returns({userId: "123", email: "mahmoud@gmail.com"});
    
                stub(User, "findOne");
                User.findOne.returns(null);
    
                const response = await isLoggedIn(req, res, () => {});
                expect(response).to.have.property("statusCode", 401);
                expect(response).to.have.deep.property("resObject", {
                    message: "Not authenticated",
                });
                expect(jwt.decode.called).to.be.true;
                expect(User.findOne.called).to.be.true;
    
                jwt.decode.restore();
                User.findOne.restore();
            });

            it("assigns user to req object if the token is valid", async () => {
                // setup
                const DATABASE = "testing";
                const URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_CLUSTER0_PASS}@cluster0.ffkdxbs.mongodb.net/${DATABASE}?retryWrites=true&w=majority`;
                await mongoose.connect(URI);

                const user = await User.create({
                    name: "Test User",
                    email: "test@test.com",
                    password: "123",
                    secret: "superSecret",
                });

                const token = jwt.sign({ userId: user._id, email: user.email, }, user.secret, {expiresIn: "1h"});

                // testing
                const req = {
                    headers: {
                        authentication: token,
                    }
                }
                await isLoggedIn(req, {}, () => {});
                expect(req).to.have.deep.property("user");
                
                await User.deleteMany({});
                await mongoose.disconnect();
            });
        });

        
    });
});
