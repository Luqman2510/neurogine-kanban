import { useState } from 'react';
import './NewTaskModal.css';

function NewTaskModal({ columnId, onClose, onCreate }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [color, setColor] = useState('#667eea');
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreate = () => {
        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }

        const taskData = {
            title,
            description,
            columnId,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            color
        };

        onCreate(taskData, selectedFiles);
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === 'modal-backdrop') {
            onClose();
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return '🖼️';
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx'].includes(ext)) return '📊';
        if (['zip', 'rar'].includes(ext)) return '📦';
        return '📎';
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content new-task-modal">
                <div className="modal-header">
                    <h2>Create New Task</h2>
                    <button onClick={onClose} className="btn-close">✕</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description"
                            rows="4"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Attachments</label>
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="file-input"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-input" className="file-upload-btn">
                                <span>📎</span>
                                <span>Choose Files</span>
                            </label>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="selected-files">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <span className="file-icon">{getFileIcon(file.name)}</span>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                        <button onClick={() => removeFile(index)} className="btn-remove">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Cancel</button>
                    <button onClick={handleCreate} className="btn-primary">Create Task</button>
                </div>
            </div>
        </div>
    );
}

export default NewTaskModal;

