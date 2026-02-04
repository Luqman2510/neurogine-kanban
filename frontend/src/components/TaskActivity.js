import React, { useState, useEffect } from 'react';
import { activityAPI } from '../services/api';
import './TaskActivity.css';

function TaskActivity({ taskId }) {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [taskId]);

    const loadActivities = async () => {
        setIsLoading(true);
        try {
            const response = await activityAPI.getTaskActivities(taskId);
            setActivities(response.data);
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setIsLoading(false);
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

    const getActivityIcon = (actionType) => {
        switch (actionType) {
            case 'CREATED':
                return '✨';
            case 'UPDATED':
                return '✏️';
            case 'MOVED':
                return '➡️';
            case 'ASSIGNED':
                return '👤';
            case 'PRIORITY_CHANGED':
                return '🔥';
            case 'DELETED':
                return '🗑️';
            default:
                return '📝';
        }
    };

    return (
        <div className="task-activity">
            <h3 className="activity-title">📋 Activity Log</h3>

            {isLoading ? (
                <div className="activity-loading">
                    <div className="spinner-small"></div>
                    <p>Loading activity...</p>
                </div>
            ) : activities.length === 0 ? (
                <div className="no-activity">
                    <p>No activity yet</p>
                    <p className="no-activity-hint">Activity will appear here</p>
                </div>
            ) : (
                <div className="activity-list">
                    {activities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">
                                {getActivityIcon(activity.actionType)}
                            </div>
                            <div className="activity-content">
                                <div className="activity-description">
                                    <span className="activity-user">{activity.username}</span>
                                    {' '}
                                    <span className="activity-text">{activity.description}</span>
                                </div>
                                <div className="activity-time">{formatTime(activity.createdAt)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TaskActivity;

