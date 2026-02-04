import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL
});

// Add JWT token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (username, email, password) => api.post('/auth/register', { username, email, password })
};

export const boardAPI = {
    // Get all boards for a user
    getUserBoards: (userId) => api.get(`/boards/user/${userId}`),

    // Get a specific board
    getBoard: (boardId) => api.get(`/boards/${boardId}`),

    // Create a new board
    createBoard: (name, userId) => api.post(`/boards?userId=${userId}`, { name }),

    // Delete a board
    deleteBoard: (boardId) => api.delete(`/boards/${boardId}`)
};

export const columnAPI = {
    // Get columns for a board
    getBoardColumns: (boardId) => api.get(`/columns/board/${boardId}`)
};

export const taskAPI = {
    // Get tasks for a column
    getColumnTasks: (columnId) => api.get(`/tasks/column/${columnId}`),

    // Create a new task (basic)
    createTask: (title, description, columnId) =>
        api.post('/tasks', { title, description, columnId }),

    // Create a new task (enhanced with all fields)
    createTaskEnhanced: (taskData) =>
        api.post('/tasks', taskData),

    // Update a task
    updateTask: (taskId, taskData) =>
        api.put(`/tasks/${taskId}`, taskData),

    // Delete a task
    deleteTask: (taskId) => api.delete(`/tasks/${taskId}`)
};

export const fileAPI = {
    // Upload a file to a task
    uploadFile: (taskId, file, userId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        // Don't set Content-Type - let axios set it automatically with boundary
        return api.post(`/files/upload/${taskId}`, formData);
    },

    // Get all attachments for a task
    getTaskAttachments: (taskId) => api.get(`/files/task/${taskId}`),

    // Download a file
    downloadFile: (attachmentId) => api.get(`/files/download/${attachmentId}`, {
        responseType: 'blob'
    }),

    // Delete an attachment
    deleteAttachment: (attachmentId) => api.delete(`/files/${attachmentId}`)
};

export const commentAPI = {
    // Get all comments for a task
    getTaskComments: (taskId) => api.get(`/comments/task/${taskId}`),

    // Create a new comment
    createComment: (taskId, userId, commentText) =>
        api.post('/comments', { taskId, userId, commentText }),

    // Update a comment
    updateComment: (commentId, newText) =>
        api.put(`/comments/${commentId}`, newText),

    // Delete a comment
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`)
};

export const activityAPI = {
    // Get all activities for a task
    getTaskActivities: (taskId) => api.get(`/activities/task/${taskId}`)
};

export const boardMemberAPI = {
    // Get all members of a board
    getBoardMembers: (boardId) => api.get(`/boards/${boardId}/members`),

    // Add a member to a board
    addMember: (boardId, username, role = 'MEMBER') =>
        api.post('/boards/members', { boardId, username, role }),

    // Remove a member from a board
    removeMember: (boardId, userId) => api.delete(`/boards/${boardId}/members/${userId}`),

    // Check if user has access to a board
    hasAccess: (boardId, userId) => api.get(`/boards/${boardId}/access/${userId}`)
};