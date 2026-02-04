package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.CreateCommentRequest;
import com.amgnips.neurogine.dto.TaskCommentDTO;
import com.amgnips.neurogine.dto.TaskDTO;
import com.amgnips.neurogine.dto.TaskMoveRequest;
import com.amgnips.neurogine.service.TaskCommentService;
import com.amgnips.neurogine.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final TaskService taskService;
    private final TaskCommentService commentService;

    /**
     * Handle task move requests via WebSocket
     *
     * Client sends to: /app/task/move/{boardId}
     * Server broadcasts to: /topic/board/{boardId}
     *
     * This allows all users viewing the same board to see real-time updates!
     */
    @MessageMapping("/task/move/{boardId}")
    @SendTo("/topic/board/{boardId}")
    public TaskDTO moveTask(@DestinationVariable Long boardId, TaskMoveRequest request) {
        // Move the task using the service (includes optimistic locking check)
        TaskDTO updatedTask = taskService.moveTask(request);

        // The updated task is automatically broadcast to all subscribers of /topic/board/{boardId}
        return updatedTask;
    }

    /**
     * Handle new comment via WebSocket
     *
     * Client sends to: /app/comment/add/{taskId}
     * Server broadcasts to: /topic/task/{taskId}/comments
     *
     * This allows all users viewing the same task to see new comments in real-time!
     */
    @MessageMapping("/comment/add/{taskId}")
    @SendTo("/topic/task/{taskId}/comments")
    public TaskCommentDTO addComment(@DestinationVariable Long taskId, CreateCommentRequest request) {
        // Create the comment using the service
        TaskCommentDTO newComment = commentService.createComment(request);

        // The new comment is automatically broadcast to all subscribers
        return newComment;
    }
}

