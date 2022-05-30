const express = require("express");
const cookieSession = require("cookie-session");
const SocketIOServer = require("socket.io");
const db = require("./db.js");
const app = express();
const server = require("http").Server(app);

const io = SocketIOServer(server, {
    allowRequest: (req, callback) => {
        callback(
            null,
            req.headers.referer.startsWith("http://localhost:3000") ||
                req.headers.referer.startsWith(
                    "https://writersbook.herokuapp.com/"
                )
        );
    },
});

app.use(express.json());
const cookieSessionMiddleware = cookieSession({
    // secret: secretcookie.cookieSecret,
    secret: "P4Y45OQU3M1R45",
    maxAge: 100 * 60 * 60 * 24 * 14,
    sameSite: true,
});

app.use(cookieSessionMiddleware);

io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.get("*", function (req, res) {
    res.json({ "yes, i am working": "just do your things and leave me alone" });
});

server.listen(process.env.PORT || 3030, function () {
    console.log("I'm listening.");
});

io.on("connection", (socket) => {
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }

    db.getLastTenMessages()
        .then(({ rows }) => {
            socket.emit("chatMessages", rows);
        })
        .catch((e) => {
            console.log("Error with the messages in socjket.io", e);
        });

    socket.on("newChatMessage", (data) => {
        db.addMessage(socket.request.session.userId, data).then(({ rows }) => {
            const id = rows[0].id;
            const date = rows[0].created_at;
            const message = rows[0].message;

            db.getUserById(socket.request.session.userId).then(({ rows }) => {
                io.emit("chatMessage", {
                    chat_id: id,
                    first: rows[0].first,
                    last: rows[0].last,
                    message: message,
                    time: date,
                    url: rows[0].url,
                    user_id: rows[0].id,
                });
            });
        });
    });

    console.log(
        `User with the ${socket.id} and the userId ${socket.request.session.userId} connected.`
    );
});
