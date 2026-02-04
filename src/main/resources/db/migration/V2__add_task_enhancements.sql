-- Add new columns to tasks table for enhanced features
ALTER TABLE tasks
ADD COLUMN assigned_to BIGINT,
ADD COLUMN due_date TIMESTAMP,
ADD COLUMN priority VARCHAR(20),
ADD COLUMN color VARCHAR(7);

-- Add foreign key constraint for assigned_to
ALTER TABLE tasks
ADD CONSTRAINT fk_tasks_assigned_to
FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for assigned_to for better query performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

