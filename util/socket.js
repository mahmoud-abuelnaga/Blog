// packages
const { Server } = require("socket.io");
const http = require("http");

/**
 * Creates a new socket object
 *
 * @param {http.Server} httpServer
 * @returns
 */
const Socket = (httpServer) => {
    let io;
    if (httpServer) {
        io = new Server(httpServer, {
            cors: {
                origin: "http://localhost.localdomain:3000",
                allowedHeaders: [
                    "Content-Type",
                    "Authentication",
                    "Posts-Per-Page",
                ],
            },
        });
    }

    return {
        /**
         * Creates a socket server using the given httpServer. You can then get the server using `Socket.getIO()`
         * 
         * @param {http.Server} httpServer 
         */
        init(httpServer) {
            if (!io) {
                io = new Server(httpServer, {
                    cors: {
                        origin: "*",
                        allowedHeaders: [
                            "Content-Type",
                            "Authentication",
                            "Posts-Per-Page",
                        ],
                    },
                });
            } else {
                throw new Error("server already initialized");
            }
        },

        /**
         * Returns the Socket server
         * 
         * @returns {Server}
         */
        getIO() {
            return io;
        }
    }
};

const socketServer = Socket();
module.exports = socketServer;
