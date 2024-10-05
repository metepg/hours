CREATE TABLE time_entries
(
    id          BIGSERIAL PRIMARY KEY,
    date        DATE NOT NULL UNIQUE,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    modified_at TIMESTAMP DEFAULT NOW()
);
