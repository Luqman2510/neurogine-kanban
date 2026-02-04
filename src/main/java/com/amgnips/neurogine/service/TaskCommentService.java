package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.CreateCommentRequest;
import com.amgnips.neurogine.dto.TaskCommentDTO;
import com.amgnips.neurogine.model.Task;
import com.amgnips.neurogine.model.TaskComment;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.TaskCommentRepository;
import com.amgnips.neurogine.repository.TaskRepository;
import com.amgnips.neurogine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskCommentService {

    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TaskCommentDTO> getTaskComments(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskCommentDTO createComment(CreateCommentRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setCommentText(request.getCommentText());

        TaskComment saved = commentRepository.save(comment);
        return convertToDTO(saved);
    }

    @Transactional
    public TaskCommentDTO updateComment(Long commentId, String newText) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.setCommentText(newText);
        TaskComment updated = commentRepository.save(comment);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    private TaskCommentDTO convertToDTO(TaskComment comment) {
        return new TaskCommentDTO(
                comment.getId(),
                comment.getTask().getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                comment.getCommentText(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}

