-- Users Table 
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    --updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards Table
CREATE TABLE boards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_id BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Columns Table
CREATE TABLE board_columns (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL,
    board_id BIGINT NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tasks Table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    column_id BIGINT NOT NULL,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (column_id) REFERENCES board_columns(id) ON DELETE CASCADE
);


-- Indexes for performance 
CREATE INDEX idx_boards_owner_id ON boards(owner_id);
CREATE INDEX idx_board_columns_board_id ON board_columns(board_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
