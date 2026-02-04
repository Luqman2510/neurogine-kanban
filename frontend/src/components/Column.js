import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Task from './Task';
import './Column.css';

function Column({ column, tasks, totalTasks, onEditTask, onTaskClick }) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id
    });

    const showingFiltered = totalTasks !== undefined && tasks.length !== totalTasks;

    return (
        <div className="column">
            <div className="column-header">
                <h3 className="column-title">{column.title}</h3>
                <span className="task-count">
                    {showingFiltered ? `${tasks.length}/${totalTasks}` : tasks.length}
                </span>
            </div>

            <SortableContext
                id={column.id.toString()}
                items={tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className={`column-content ${isOver ? 'drag-over' : ''}`}
                >
                    {tasks.length === 0 ? (
                        <div className="empty-column">
                            <p>No tasks yet</p>
                            <span>Drag tasks here</span>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                onEdit={onEditTask}
                                onClick={() => onTaskClick && onTaskClick(task)}
                            />
                        ))
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

export default Column;