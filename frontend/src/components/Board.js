import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import Column from './Column';
import Task from './Task';
import TaskModal from './TaskModal';
import NewTaskModal from './NewTaskModal';
import ShareBoardModal from './ShareBoardModal';
import WebSocketService from '../services/WebSocketService';
import { columnAPI, taskAPI, boardAPI, fileAPI } from '../services/api';
import './Board.css';

function Board({ boardId, searchQuery = '', filterPriority = 'ALL', filterDueDate = 'ALL' }) {
    const [columns, setColumns] = useState([]);
    const [tasks, setTasks] = useState({});
    const [connected, setConnected] = useState(false);
    const [activeTask, setActiveTask] = useState(null);
    const [boardName, setBoardName] = useState('');
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [selectedColumnForNewTask, setSelectedColumnForNewTask] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Filter tasks based on search and filters
    const filterTasks = useCallback((taskList) => {
        return taskList.filter(task => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    task.title.toLowerCase().includes(query) ||
                    (task.description && task.description.toLowerCase().includes(query));
                if (!matchesSearch) return false;
            }

            // Priority filter
            if (filterPriority !== 'ALL' && task.priority !== filterPriority) {
                return false;
            }

            // Due date filter
            if (filterDueDate !== 'ALL' && task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const now = new Date();
                const diffTime = dueDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (filterDueDate) {
                    case 'OVERDUE':
                        if (diffDays >= 0) return false;
                        break;
                    case 'TODAY':
                        if (diffDays !== 0) return false;
                        break;
                    case 'WEEK':
                        if (diffDays < 0 || diffDays > 7) return false;
                        break;
                    case 'MONTH':
                        if (diffDays < 0 || diffDays > 30) return false;
                        break;
                    default:
                        break;
                }
            }

            return true;
        });
    }, [searchQuery, filterPriority, filterDueDate]);

    const handleWebSocketMessage = useCallback((updatedTask) => {
        console.log('Received WebSocket update:', updatedTask);

        // Update the task in the state
        setTasks(prevTasks => {
            const newTasks = { ...prevTasks };

            // Remove task from all columns
            Object.keys(newTasks).forEach(columnId => {
                newTasks[columnId] = newTasks[columnId].filter(t => t.id !== updatedTask.id);
            });

            // Add task to the new column
            const targetColumnId = updatedTask.columnId;
            if (newTasks[targetColumnId]) {
                newTasks[targetColumnId] = [...newTasks[targetColumnId], updatedTask]
                    .sort((a, b) => a.position - b.position);
            }

            return newTasks;
        });
    }, []);

    const loadBoardData = useCallback(async () => {
        try {
            // Load board info
            const boardResponse = await boardAPI.getBoard(boardId);
            setBoardName(boardResponse.data.name);

            // Load columns
            const columnsResponse = await columnAPI.getBoardColumns(boardId);
            const columnsData = columnsResponse.data;
            setColumns(columnsData);

            // Load tasks for each column
            const tasksData = {};
            for (const column of columnsData) {
                const tasksResponse = await taskAPI.getColumnTasks(column.id);
                tasksData[column.id] = tasksResponse.data;
            }
            setTasks(tasksData);
        } catch (error) {
            console.error('Error loading board data:', error);
        }
    }, [boardId]);

    useEffect(() => {
        loadBoardData();

        // Connect to WebSocket
        WebSocketService.connect(boardId, handleWebSocketMessage);
        setConnected(true);

        // Cleanup on unmount
        return () => {
            WebSocketService.disconnect();
        };
    }, [boardId, loadBoardData, handleWebSocketMessage]);

    const handleDragStart = (event) => {
        const { active } = event;
        const taskId = active.id;
        
        // Find the task being dragged
        let foundTask = null;
        Object.values(tasks).forEach(columnTasks => {
            const task = columnTasks.find(t => t.id === taskId);
            if (task) foundTask = task;
        });
        
        setActiveTask(foundTask);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id;
        const destColumnId = over.id;

        // Find source column
        let sourceColumnId = null;
        let task = null;
        
        Object.entries(tasks).forEach(([columnId, columnTasks]) => {
            const foundTask = columnTasks.find(t => t.id === taskId);
            if (foundTask) {
                sourceColumnId = parseInt(columnId);
                task = foundTask;
            }
        });

        if (!task || sourceColumnId === destColumnId) return;

        // Send move request via WebSocket
        const taskMoveRequest = {
            taskId: taskId,
            targetColumnId: destColumnId,
            newPosition: 0, // Simplified - always add to top
            version: task.version
        };

        WebSocketService.sendTaskMove(boardId, taskMoveRequest);

        // Optimistic UI update
        setTasks(prevTasks => {
            const newTasks = { ...prevTasks };
            
            // Remove from source
            newTasks[sourceColumnId] = newTasks[sourceColumnId].filter(t => t.id !== taskId);
            
            // Add to destination
            const updatedTask = { ...task, columnId: destColumnId, position: 0 };
            newTasks[destColumnId] = [updatedTask, ...newTasks[destColumnId]];
            
            return newTasks;
        });
    };

    const handleNewTaskClick = () => {
        if (columns.length > 0) {
            setSelectedColumnForNewTask(columns[0].id);
            setShowNewTaskModal(true);
        } else {
            alert('Please create a column first');
        }
    };

    const handleCreateTask = async (taskData, files) => {
        try {
            const userId = localStorage.getItem('userId');
            const fullTaskData = {
                ...taskData,
                assignedToId: userId
            };

            // Create the task
            const response = await taskAPI.createTaskEnhanced(fullTaskData);
            const createdTask = response.data;

            // Upload files if any
            if (files && files.length > 0) {
                for (const file of files) {
                    await fileAPI.uploadFile(createdTask.id, file, userId);
                }
            }

            // Refresh tasks
            loadBoardData();
            setShowNewTaskModal(false);
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task. Please try again.');
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowTaskModal(true);
    };

    const handleUpdateTask = async (updatedTask) => {
        try {
            const taskData = {
                title: updatedTask.title,
                description: updatedTask.description,
                columnId: updatedTask.columnId,
                priority: updatedTask.priority,
                dueDate: updatedTask.dueDate,
                color: updatedTask.color,
                assignedToId: updatedTask.assignedToId
            };

            await taskAPI.updateTask(updatedTask.id, taskData);
            loadBoardData();
            setShowTaskModal(false);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task. Please try again.');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await taskAPI.deleteTask(taskId);
            loadBoardData();
            setShowTaskModal(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task. Please try again.');
        }
    };

    return (
        <div className="board-container">
            {/* Board Header */}
            <div className="board-header">
                <div className="board-title-section">
                    <h1 className="board-title">{boardName || 'Loading...'}</h1>
                    <div className={`connection-indicator ${!connected ? 'disconnected' : ''}`}>
                        <span className="connection-dot"></span>
                        <span>{connected ? 'Live' : 'Offline'}</span>
                    </div>
                </div>
                <div className="board-actions">
                    <button className="btn-board-action" onClick={() => setShowShareModal(true)}>
                        <span>👥</span>
                        <span>Share</span>
                    </button>
                    <button className="btn-board-action">
                        <span>⚙️</span>
                        <span>Settings</span>
                    </button>
                    <button className="btn-board-action primary" onClick={handleNewTaskClick}>
                        <span>+</span>
                        <span>New Task</span>
                    </button>
                </div>
            </div>

            {/* Board Content */}
            <div className="board-content">
                <DndContext
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="columns-container">
                        {columns.map(column => {
                            const columnTasks = tasks[column.id] || [];
                            const filteredTasks = filterTasks(columnTasks);
                            return (
                                <Column
                                    key={column.id}
                                    column={column}
                                    tasks={filteredTasks}
                                    totalTasks={columnTasks.length}
                                    onTaskClick={handleTaskClick}
                                />
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeTask ? <Task task={activeTask} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* New Task Modal */}
            {showNewTaskModal && (
                <NewTaskModal
                    columnId={selectedColumnForNewTask}
                    onClose={() => setShowNewTaskModal(false)}
                    onCreate={handleCreateTask}
                />
            )}

            {/* Edit Task Modal */}
            {showTaskModal && selectedTask && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => setShowTaskModal(false)}
                    onSave={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}

            {/* Share Board Modal */}
            {showShareModal && (
                <ShareBoardModal
                    boardId={boardId}
                    boardName={boardName}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
}

export default Board;