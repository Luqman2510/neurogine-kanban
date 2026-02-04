import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Board from '../components/Board';
import { boardAPI, taskAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [selectedBoardId, setSelectedBoardId] = useState(null);
    const [newBoardName, setNewBoardName] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [username, setUsername] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);

    // New task fields
    const [taskPriority, setTaskPriority] = useState('MEDIUM');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskColor, setTaskColor] = useState('#667eea');

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [filterDueDate, setFilterDueDate] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (!storedUsername) {
            navigate('/');
        } else {
            setUsername(storedUsername);
        }

        // Load dark mode preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, [navigate]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    };

    const loadBoards = useCallback(async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await boardAPI.getUserBoards(userId);
            setBoards(response.data);
            if (response.data.length > 0 && !selectedBoardId) {
                setSelectedBoardId(response.data[0].id);
            }
        } catch (error) {
            console.error('Error loading boards:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    }, [selectedBoardId]);

    useEffect(() => {
        loadBoards();
    }, [loadBoards]);

    const createBoard = async () => {
        if (!newBoardName.trim()) return;

        try {
            const userId = localStorage.getItem('userId');
            await boardAPI.createBoard(newBoardName, userId);
            setNewBoardName('');
            loadBoards();
        } catch (error) {
            console.error('Error creating board:', error);
        }
    };

    const createTask = async () => {
        if (!newTaskTitle.trim() || !selectedColumnId) return;

        try {
            const userId = localStorage.getItem('userId');
            const taskData = {
                title: newTaskTitle,
                description: newTaskDescription,
                columnId: selectedColumnId,
                assignedToId: userId, // Assign to current user
                priority: taskPriority,
                dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
                color: taskColor
            };

            await taskAPI.createTaskEnhanced(taskData);
            setNewTaskTitle('');
            setNewTaskDescription('');
            setTaskPriority('MEDIUM');
            setTaskDueDate('');
            setTaskColor('#667eea');
            setShowTaskForm(false);
            window.location.reload();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                {/* Sidebar Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="logo-icon">📋</div>
                        <h1 className="logo-text">Neurogine</h1>
                    </div>
                    <div className="user-profile">
                        <div className="user-avatar">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <div className="user-name">{username}</div>
                            <div className="user-role">Project Manager</div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="sidebar-content">
                    {/* Boards Section */}
                    <div className="sidebar-section">
                        <div className="section-title">
                            <span>Boards</span>
                            <button
                                onClick={() => setShowTaskForm(!showTaskForm)}
                                className="btn-icon"
                                title="Create new board"
                            >
                                +
                            </button>
                        </div>

                        {showTaskForm && (
                            <div className="create-board-form">
                                <input
                                    type="text"
                                    value={newBoardName}
                                    onChange={(e) => setNewBoardName(e.target.value)}
                                    placeholder="Board name"
                                    className="sidebar-input"
                                    onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                                />
                                <button onClick={createBoard} className="btn-create-sidebar">
                                    Create
                                </button>
                            </div>
                        )}

                        <div className="boards-list">
                            {/* My Boards */}
                            {boards.filter(b => b.isOwner).length > 0 && (
                                <>
                                    <div className="boards-subsection-title">My Boards</div>
                                    {boards.filter(b => b.isOwner).map(board => (
                                        <div
                                            key={board.id}
                                            className={`board-item ${selectedBoardId === board.id ? 'active' : ''}`}
                                            onClick={() => setSelectedBoardId(board.id)}
                                        >
                                            <span className="board-icon">📊</span>
                                            <span className="board-name">{board.name}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {/* Shared With Me */}
                            {boards.filter(b => !b.isOwner).length > 0 && (
                                <>
                                    <div className="boards-subsection-title">Shared With Me</div>
                                    {boards.filter(b => !b.isOwner).map(board => (
                                        <div
                                            key={board.id}
                                            className={`board-item ${selectedBoardId === board.id ? 'active' : ''}`}
                                            onClick={() => setSelectedBoardId(board.id)}
                                        >
                                            <span className="board-icon">👥</span>
                                            <span className="board-name">{board.name}</span>
                                        </div>
                                    ))}
                                </>
                            )}

                            {boards.length === 0 && (
                                <div className="empty-state">
                                    <p>No boards yet</p>
                                    <p className="empty-hint">Create your first board</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Section */}
                    {selectedBoardId && (
                        <>
                            <div className="sidebar-divider"></div>
                            <div className="sidebar-section">
                                <div className="section-title">Search</div>
                                <div className="search-box-sidebar">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search tasks..."
                                        className="sidebar-input"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="btn-clear-sidebar"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Filters Section */}
                            <div className="sidebar-divider"></div>
                            <div className="sidebar-section">
                                <div className="section-title">Filters</div>
                                <div className="filter-group-sidebar">
                                    <label>Priority</label>
                                    <select
                                        value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                        className="sidebar-select"
                                    >
                                        <option value="ALL">All</option>
                                        <option value="URGENT">🔴 Urgent</option>
                                        <option value="HIGH">🟠 High</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="LOW">🟢 Low</option>
                                    </select>
                                </div>
                                <div className="filter-group-sidebar">
                                    <label>Due Date</label>
                                    <select
                                        value={filterDueDate}
                                        onChange={(e) => setFilterDueDate(e.target.value)}
                                        className="sidebar-select"
                                    >
                                        <option value="ALL">All</option>
                                        <option value="OVERDUE">⚠️ Overdue</option>
                                        <option value="TODAY">📅 Today</option>
                                        <option value="WEEK">📆 This Week</option>
                                        <option value="MONTH">🗓️ This Month</option>
                                    </select>
                                </div>
                                {(searchQuery || filterPriority !== 'ALL' || filterDueDate !== 'ALL') && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterPriority('ALL');
                                            setFilterDueDate('ALL');
                                        }}
                                        className="btn-clear-filters"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <button onClick={toggleDarkMode} className="sidebar-btn">
                        <span className="btn-icon-text">{darkMode ? '☀️' : '🌙'}</span>
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button onClick={handleLogout} className="sidebar-btn logout">
                        <span className="btn-icon-text">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Sidebar Toggle Button */}
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
                >
                    <span className="toggle-icon">
                        {sidebarCollapsed ? '▶' : '◀'}
                    </span>
                </button>

                {selectedBoardId ? (
                    <Board
                        key={selectedBoardId}
                        boardId={selectedBoardId}
                        searchQuery={searchQuery}
                        filterPriority={filterPriority}
                        filterDueDate={filterDueDate}
                    />
                ) : (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <div className="welcome-icon">📋</div>
                            <h2>Welcome to Neurogine</h2>
                            <p>Select a board from the sidebar to get started</p>
                            <p className="welcome-hint">or create a new board</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;

