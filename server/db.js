const spicedPg = require("spiced-pg");
// eslint-disable-next-line no-unused-vars
const dotenv = require("dotenv").config();
const database = process.env.DATABASE_NAME;
const username = process.env.DATABASE_USERNAME;
const password = process.env.DATABASE_PASSWORD;

//communication with the database
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${username}:${password}@localhost:5432/${database}`
);

console.log(`[db] connecting to the database-> ${database}`);

module.exports.addUser = (name) => {
    const q = `INSERT INTO users (name) Values($1)
    RETURNING *`;
    const params = [name];
    return db.query(q, params);
};

module.exports.getUserById = (id) => {
    const q = "SELECT * FROM users WHERE id = $1";
    const params = [id];
    return db.query(q, params);
};

module.exports.getLastTenMessages = () => {
    const q = `SELECT chat_messages.id AS chat_id, chat_messages.message AS message, chat_messages.created_at AS time, users.id AS user_id, users.name AS name JOIN users ON users.id = chat_messages.user_id ORDER BY chat_messages.id DESC LIMIT 50`;
    return db.query(q);
};

module.exports.addMessage = (user, message) => {
    const q = `INSERT into chat_messages (user_id, message) VALUES($1, $2) RETURNING id, created_at, message`;
    const params = [user, message];
    return db.query(q, params);
};
