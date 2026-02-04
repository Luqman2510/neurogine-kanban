import React, { useState, useEffect } from 'react';
import { commentAPI } from '../services/api';
import './TaskComments.css';

function TaskComments({ taskId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [taskId]);

    const loadComments = async () => {
        try {
            const response = await commentAPI.getTaskComments(taskId);
            setComments(response.data);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const userId = localStorage.getItem('userId');
            await commentAPI.createComment(taskId, userId, newComment);
            setNewComment('');
            loadComments(); // Reload comments
        } catch (error) {
            console.error('Error creating comment:', error);
            alert('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await commentAPI.deleteComment(commentId);
            loadComments(); // Reload comments
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="task-comments">
            <h3 className="comments-title">💬 Comments ({comments.length})</h3>

            {/* Comment List */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <div className="no-comments">
                        <p>No comments yet</p>
                        <p className="no-comments-hint">Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                                <div className="comment-author">
                                    <div className="author-avatar">
                                        {comment.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="author-info">
                                        <span className="author-name">{comment.username}</span>
                                        <span className="comment-time">{formatTime(comment.createdAt)}</span>
                                    </div>
                                </div>
                                {comment.userId === parseInt(localStorage.getItem('userId')) && (
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="btn-delete-comment"
                                        title="Delete comment"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                            <div className="comment-text">{comment.commentText}</div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="comment-input"
                    rows="3"
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    className="btn-submit-comment"
                    disabled={!newComment.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
            </form>
        </div>
    );
}

export default TaskComments;

