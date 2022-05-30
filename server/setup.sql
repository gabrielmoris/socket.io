DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS chat_messages;

CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL CHECK (name != ''),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

 CREATE TABLE chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );