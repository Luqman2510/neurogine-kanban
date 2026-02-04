-- Create board_members table for board sharing/collaboration
CREATE TABLE board_members (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_board_members_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_board_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_board_user UNIQUE (board_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);

-- Add some comments for documentation
COMMENT ON TABLE board_members IS 'Stores board membership/sharing information';
COMMENT ON COLUMN board_members.role IS 'Member role: OWNER, ADMIN, MEMBER, VIEWER';
COMMENT ON COLUMN board_members.joined_at IS 'When the user was added to the board';

