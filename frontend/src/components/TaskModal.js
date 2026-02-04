import { useState, useEffect } from 'react';
import { fileAPI } from '../services/api';
import TaskComments from './TaskComments';
import TaskActivity from './TaskActivity';
import './TaskModal.css';

function TaskModal({ task, onClose, onSave, onDelete }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [color, setColor] = useState(task?.color || '#667eea');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'comments', 'activity'

    useEffect(() => {
        if (task?.dueDate) {
            const date = new Date(task.dueDate);
            const formattedDate = date.toISOString().split('T')[0];
            setDueDate(formattedDate);
        }

        // Load attachments
        if (task?.attachments) {
            setAttachments(task.attachments);
        }
    }, [task]);

    // ESC key to close preview modal
    useEffect(() => {
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                if (previewFile) {
                    closePreview();
                } else if (!showDeleteConfirm) {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [previewFile, showDeleteConfirm, onClose]);

    const handleSave = async () => {
        if (!title.trim()) return;

        const updatedTask = {
            ...task,
            title,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            color
        };

        // Upload new files if any
        if (selectedFiles.length > 0) {
            const userId = localStorage.getItem('userId');
            for (const file of selectedFiles) {
                try {
                    await fileAPI.uploadFile(task.id, file, userId);
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            }
        }

        onSave(updatedTask);
    };

    const handleDelete = () => {
        onDelete(task.id);
    };

    const handleBackdropClick = (e) => {
        if (e.target.className === 'modal-backdrop') {
            onClose();
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeNewFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDownload = async (attachmentId, originalFileName) => {
        try {
            const response = await fileAPI.downloadFile(attachmentId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalFileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (window.confirm('Are you sure you want to delete this attachment?')) {
            try {
                await fileAPI.deleteAttachment(attachmentId);
                setAttachments(prev => prev.filter(a => a.id !== attachmentId));
            } catch (error) {
                console.error('Error deleting attachment:', error);
                alert('Failed to delete attachment');
            }
        }
    };

    const handlePreview = async (attachment) => {
        setIsLoadingPreview(true);
        try {
            const response = await fileAPI.downloadFile(attachment.id);
            const blob = new Blob([response.data], { type: attachment.fileType });
            const url = window.URL.createObjectURL(blob);
            setPreviewFile(attachment);
            setPreviewUrl(url);
        } catch (error) {
            console.error('Error previewing file:', error);
            alert('Failed to preview file');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const closePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewFile(null);
        setPreviewUrl(null);
    };

    const isPreviewable = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'pdf', 'txt', 'json', 'xml', 'csv'].includes(ext);
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
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Task</h2>
                    <button onClick={onClose} className="btn-close">✕</button>
                </div>

                {/* Tab Navigation */}
                <div className="modal-tabs">
                    <button
                        className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        📝 Details
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('comments')}
                    >
                        💬 Comments
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('activity')}
                    >
                        📋 Activity
                    </button>
                </div>

                <div className="modal-body">
                    {/* Details Tab */}
                    {activeTab === 'details' && (
                        <>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Task title"
                                    className="form-input"
                                    autoFocus
                                />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Task description"
                            rows="4"
                            className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select 
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-input"
                            >
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
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-picker">
                            {['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'].map(c => (
                                <button
                                    key={c}
                                    className={`color-option ${color === c ? 'selected' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                    type="button"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Attachments</label>

                        {/* Existing Attachments */}
                        {attachments.length > 0 && (
                            <div className="attachments-list">
                                {attachments.map(att => (
                                    <div key={att.id} className="attachment-item">
                                        <span className="file-icon">{getFileIcon(att.originalFileName)}</span>
                                        <span className="file-name">{att.originalFileName}</span>
                                        <span className="file-size">{formatFileSize(att.fileSize)}</span>
                                        {isPreviewable(att.originalFileName) && (
                                            <button
                                                onClick={() => handlePreview(att)}
                                                className="btn-preview"
                                                title="Preview"
                                            >
                                                👁️
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDownload(att.id, att.originalFileName)}
                                            className="btn-download"
                                            title="Download"
                                        >
                                            ⬇️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAttachment(att.id)}
                                            className="btn-remove"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload New Files */}
                        <div className="file-upload-area">
                            <input
                                type="file"
                                id="file-input-edit"
                                multiple
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="file-input-edit" className="file-upload-btn">
                                <span>📎</span>
                                <span>Add Files</span>
                            </label>
                        </div>

                        {/* New Files to Upload */}
                        {selectedFiles.length > 0 && (
                            <div className="selected-files">
                                <p className="new-files-label">New files to upload:</p>
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="file-item new-file">
                                        <span className="file-icon">{getFileIcon(file.name)}</span>
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                        <button onClick={() => removeNewFile(index)} className="btn-remove">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                            </div>
                        </>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <TaskComments taskId={task.id} />
                    )}

                    {/* Activity Tab */}
                    {activeTab === 'activity' && (
                        <TaskActivity taskId={task.id} />
                    )}
                </div>

                <div className="modal-footer">
                    {!showDeleteConfirm ? (
                        <>
                            <button onClick={() => setShowDeleteConfirm(true)} className="btn-delete">
                                Delete Task
                            </button>
                            <div className="modal-actions">
                                <button onClick={onClose} className="btn-cancel">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="btn-save">
                                    Save Changes
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="delete-confirm">
                            <p>Are you sure you want to delete this task?</p>
                            <div className="modal-actions">
                                <button onClick={() => setShowDeleteConfirm(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button onClick={handleDelete} className="btn-delete-confirm">
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* File Preview Modal */}
            {previewFile && (
                <div className="preview-modal-backdrop" onClick={closePreview}>
                    <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="preview-modal-header">
                            <div className="preview-file-info">
                                <span className="preview-file-icon">{getFileIcon(previewFile.originalFileName)}</span>
                                <div>
                                    <h3>{previewFile.originalFileName}</h3>
                                    <p>{formatFileSize(previewFile.fileSize)}</p>
                                </div>
                            </div>
                            <button onClick={closePreview} className="btn-close-preview" title="Close (ESC)">✕</button>
                        </div>
                        <div className="preview-modal-body">
                            {isLoadingPreview ? (
                                <div className="preview-loading">
                                    <div className="spinner"></div>
                                    <p>Loading preview...</p>
                                </div>
                            ) : (
                                <>
                                    {previewFile.originalFileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) && (
                                        <img src={previewUrl} alt={previewFile.originalFileName} className="preview-image" />
                                    )}
                                    {previewFile.originalFileName.match(/\.pdf$/i) && (
                                        <iframe src={previewUrl} className="preview-pdf" title="PDF Preview" />
                                    )}
                                    {previewFile.originalFileName.match(/\.(txt|json|xml|csv)$/i) && (
                                        <iframe src={previewUrl} className="preview-text" title="Text Preview" />
                                    )}
                                </>
                            )}
                        </div>
                        <div className="preview-modal-footer">
                            <button
                                onClick={() => handleDownload(previewFile.id, previewFile.originalFileName)}
                                className="btn-download-preview"
                            >
                                ⬇️ Download
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading Overlay for Preview */}
            {isLoadingPreview && !previewFile && (
                <div className="loading-overlay">
                    <div className="spinner-large"></div>
                </div>
            )}
        </div>
    );
}

export default TaskModal;

