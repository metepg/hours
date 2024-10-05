-- Create the users table expected by Spring Security
CREATE TABLE users
(
    username TEXT    NOT NULL PRIMARY KEY,
    password TEXT    NOT NULL,
    enabled  BOOLEAN NOT NULL
);

-- Create the authorities (roles) table expected by Spring Security
CREATE TABLE authorities
(
    id        BIGSERIAL PRIMARY KEY,
    username  TEXT NOT NULL,
    authority TEXT NOT NULL,
    CONSTRAINT fk_authorities_users FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE
);

-- Ensure no duplicate authority entries for the same user
CREATE UNIQUE INDEX ix_auth_username ON authorities (username, authority);

ALTER TABLE users OWNER TO postgres;
ALTER TABLE authorities OWNER TO postgres;