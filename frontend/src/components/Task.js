import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Task.css';

function Task({ task, onEdit, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'URGENT': '#ef4444',
            'HIGH': '#f97316',
            'MEDIUM': '#eab308',
            'LOW': '#22c55e'
        };
        return colors[priority] || '#6b7280';
    };

    const formatDueDate = (dueDate) => {
        if (!dueDate) return null;
        const date = new Date(dueDate);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Overdue', color: '#ef4444' };
        if (diffDays === 0) return { text: 'Today', color: '#f97316' };
        if (diffDays === 1) return { text: 'Tomorrow', color: '#eab308' };
        if (diffDays <= 7) return { text: `${diffDays} days`, color: '#22c55e' };
        return { text: date.toLocaleDateString(), color: '#6b7280' };
    };

    const dueInfo = formatDueDate(task.dueDate);
    const cardColor = task.color || '#ffffff';

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '🖼️';
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
        if (['zip', 'rar', '7z'].includes(ext)) return '📦';
        if (['mp4', 'mov', 'avi'].includes(ext)) return '🎥';
        if (['mp3', 'wav'].includes(ext)) return '🎵';
        return '📎';
    };

    const handleCardClick = (e) => {
        // Prevent opening modal when clicking on drag handle or edit button
        if (e.target.closest('.drag-handle') || e.target.closest('.btn-edit-task')) {
            return;
        }

        // Open task details modal
        if (onClick) {
            onClick(task);
        } else if (onEdit) {
            onEdit(task);
        }
    };

    return (
        <div
            ref={setNodeRef}
            className={`task-card ${isDragging ? 'dragging' : ''}`}
            style={{ ...style, borderLeftColor: cardColor }}
            {...attributes}
            onClick={handleCardClick}
        >
            <div className="task-header">
                <div className="drag-handle" {...listeners} title="Drag to move">
                    ⋮⋮
                </div>
                <h4 className="task-title">{task.title}</h4>
                {onEdit && (
                    <button
                        className="btn-edit-task"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        title="Edit task"
                    >
                        ✏️
                    </button>
                )}
                {task.priority && (
                    <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                        {task.priority}
                    </span>
                )}
            </div>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}

            <div className="task-footer">
                <div className="task-meta">
                    {task.assignedToUsername && (
                        <div className="assigned-user">
                            <span className="user-avatar">
                                {task.assignedToUsername.charAt(0).toUpperCase()}
                            </span>
                            <span className="user-name">{task.assignedToUsername}</span>
                        </div>
                    )}
                    {dueInfo && (
                        <div className="due-date" style={{ color: dueInfo.color }}>
                            📅 {dueInfo.text}
                        </div>
                    )}
                </div>

                {/* Attachment Preview */}
                {task.attachments && task.attachments.length > 0 && (
                    <div className="task-attachments">
                        <div className="attachment-count">
                            📎 {task.attachments.length} {task.attachments.length === 1 ? 'file' : 'files'}
                        </div>
                        <div className="attachment-preview">
                            {task.attachments.slice(0, 2).map((attachment) => (
                                <div key={attachment.id} className="attachment-preview-item" title={attachment.originalFileName}>
                                    <span className="attachment-icon">{getFileIcon(attachment.originalFileName)}</span>
                                    <span className="attachment-name">{attachment.originalFileName}</span>
                                </div>
                            ))}
                            {task.attachments.length > 2 && (
                                <div className="attachment-more">
                                    +{task.attachments.length - 2} more
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Task;