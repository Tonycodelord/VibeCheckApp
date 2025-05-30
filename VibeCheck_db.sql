CREATE DATABASE IF NOT EXISTS vibeCheck_app;
use vibeCheck_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  bio TEXT,
  profile_picture_url TEXT,
  birthday DATE,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  post_count INT DEFAULT 0
);
-- Sample user 1
INSERT INTO users (
  username, email, password_hash, full_name, bio, profile_picture_url, birthday,
  followers_count, following_count, post_count
) VALUES (
  'tech_sam', 'sam@example.com', '$2b$10$a6F0KjsmBQ1tKLHjO3I9IuEJxqfxcB1H5EjUcm3wzB8x0uUNb5H3m',
  'Samuel Lin', 'Full-stack dev & coffee addict ☕', 
  'https://example.com/images/sam.jpg', '1998-03-14',
  250, 180, 34
);

-- Sample user 2
INSERT INTO users (
  username, email, password_hash, full_name, bio, profile_picture_url, birthday,
  followers_count, following_count, post_count
) VALUES (
  'artsy_anna', 'anna@example.com', '$2b$10$YwX9jNgzHdLJzt0UwPRcLe6BTe1qA1zWx6BeHvw1CyQ5U4K8DUMZq',
  'Anna Rivera', 'Visual artist 🎨 | DM for commissions', 
  'https://example.com/images/anna.png', '2000-07-25',
  1, 300, 89
);

select * from users