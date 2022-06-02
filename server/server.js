const express = require("express");
const cookieSession = require("cookie-session");
const SocketIOServer = require("socket.io");
const db = require("./db.js");
// const cors = require("cors");
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

// const corsOptions = {
//     origin: "*",
//     credentials: true, //access-control-allow-credentials:true
//     optionSuccessStatus: 200,
// };

const cookieSessionMiddleware = cookieSession({
    name: "session",
    secret: "P4Y45OQU3M1R45?",
    maxAge: 100 * 60 * 60 * 24 * 14,
    secure: false,
    domain: "http://localhost:3000/",
});

// app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieSessionMiddleware);

io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.post("/users", async function (req, res) {
    const name = req.body.name;
    console.log("body", req.body);
    await db
        .addUser(name)
        .then(({ rows }) => {
            const id = rows[0].id;
            console.log("i am here!!!", id);
            req.session.userId = id;
            console.log("i was here", req.session.userId);
            return rows[0];
        })
        .then((results) => {
            const name = results.name;
            console.log("NAME", name);
            res.json({ response: name, success: true });
            // console.log("rows-->", results);
        })
        .catch((e) => {
            res.json({ error: e, success: false });
        });

    await console.log(req.session);
});

app.get("/users", (req, res) => {
    req.session.cookiRandom = "hello"
    console.log("from users", req.session);
    res.json({ response: req.session, success: true });
});

app.get("*", function (req, res) {
    res.json({ "yes, i am working": "just do your things and leave me alone" });
});

server.listen(process.env.PORT || 3001, function () {
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
