import React, { useState, useEffect } from 'react';
import { boardMemberAPI } from '../services/api';
import './ShareBoardModal.css';

const ShareBoardModal = ({ boardId, boardName, onClose }) => {
    const [members, setMembers] = useState([]);
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const currentUserId = parseInt(localStorage.getItem('userId'));

    useEffect(() => {
        loadMembers();
    }, [boardId]);

    const loadMembers = async () => {
        try {
            const response = await boardMemberAPI.getBoardMembers(boardId);
            setMembers(response.data);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await boardMemberAPI.addMember(boardId, username, role);
            setUsername('');
            setRole('MEMBER');
            loadMembers(); // Reload members list
        } catch (error) {
            setError(error.response?.data || 'Failed to add member');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            await boardMemberAPI.removeMember(boardId, userId);
            loadMembers(); // Reload members list
        } catch (error) {
            console.error('Error removing member:', error);
            setError('Failed to remove member');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'share-modal-overlay') {
            onClose();
        }
    };

    return (
        <div className="share-modal-overlay" onClick={handleOverlayClick}>
            <div className="share-modal">
                <div className="share-modal-header">
                    <h2>👥 Share Board</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="share-modal-body">
                    <p className="board-name">"{boardName}"</p>

                    {/* Add Member Form */}
                    <form onSubmit={handleAddMember} className="add-member-form">
                        <input
                            type="text"
                            placeholder="Enter username or email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="member-input"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="role-select"
                        >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="add-button"
                        >
                            {isLoading ? 'Adding...' : 'Add'}
                        </button>
                    </form>

                    {error && <div className="error-message">{error}</div>}

                    {/* Members List */}
                    <div className="members-list">
                        <h3>Board Members ({members.length})</h3>
                        {members.length === 0 ? (
                            <p className="no-members">No members yet. Add someone to collaborate!</p>
                        ) : (
                            <ul>
                                {members.map((member) => (
                                    <li key={member.id} className="member-item">
                                        <div className="member-info">
                                            <div className="member-avatar">
                                                {member.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="member-details">
                                                <div className="member-username">{member.username}</div>
                                                <div className="member-email">{member.email}</div>
                                            </div>
                                            <span className="member-role">{member.role}</span>
                                        </div>
                                        {member.userId !== currentUserId && (
                                            <button
                                                onClick={() => handleRemoveMember(member.userId)}
                                                className="remove-button"
                                                title="Remove member"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareBoardModal;

