CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    username VARCHAR(200) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_id INTEGER REFERENCES images(id)
);
