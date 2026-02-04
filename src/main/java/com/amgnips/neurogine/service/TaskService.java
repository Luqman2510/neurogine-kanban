package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.CreateTaskRequest;
import com.amgnips.neurogine.dto.TaskAttachmentDTO;
import com.amgnips.neurogine.dto.TaskDTO;
import com.amgnips.neurogine.dto.TaskMoveRequest;
import com.amgnips.neurogine.model.BoardColumn;
import com.amgnips.neurogine.model.Task;
import com.amgnips.neurogine.model.TaskAttachment;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.BoardColumnRepository;
import com.amgnips.neurogine.repository.TaskRepository;
import com.amgnips.neurogine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final BoardColumnRepository columnRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional(readOnly = true)
    public List<TaskDTO> getTasksByColumn(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDTO createTask(CreateTaskRequest request) {
        BoardColumn column = columnRepository.findById(request.getColumnId())
                .orElseThrow(() -> new RuntimeException("Column not found"));

        // Get max position in column
        List<Task> existingTasks = taskRepository.findByColumnIdOrderByPositionAsc(request.getColumnId());
        int newPosition = existingTasks.size();

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setColumn(column);
        task.setPosition(newPosition);

        // Set new fields
        if (request.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignedUser);
        }
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setColor(request.getColor());

        Task saved = taskRepository.save(task);

        // Log activity
        if (request.getAssignedToId() != null) {
            activityLogService.logActivity(
                saved.getId(),
                request.getAssignedToId(),
                "CREATED",
                null,
                null,
                null,
                "created task \"" + saved.getTitle() + "\" in " + column.getTitle()
            );
        }

        return convertToDTO(saved);
    }

    @Transactional
    public TaskDTO moveTask(TaskMoveRequest request) {
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Optimistic locking check
        if (!task.getVersion().equals(request.getVersion())) {
            throw new RuntimeException("Task was modified by another user. Please refresh.");
        }

        BoardColumn oldColumn = task.getColumn();
        BoardColumn targetColumn = columnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new RuntimeException("Column not found"));

        task.setColumn(targetColumn);
        task.setPosition(request.getNewPosition());

        Task updated = taskRepository.save(task);

        // Log activity if column changed
        if (!oldColumn.getId().equals(targetColumn.getId())) {
            Long userId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : task.getColumn().getBoard().getOwner().getId();
            activityLogService.logActivity(
                updated.getId(),
                userId,
                "MOVED",
                "status",
                oldColumn.getTitle(),
                targetColumn.getTitle(),
                "moved task from \"" + oldColumn.getTitle() + "\" to \"" + targetColumn.getTitle() + "\""
            );
        }

        return convertToDTO(updated);
    }

    @Transactional
    public TaskDTO updateTask(Long taskId, CreateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        // Track changes for activity log
        String oldPriority = task.getPriority();
        String oldTitle = task.getTitle();
        User oldAssignedTo = task.getAssignedTo();

        Long currentUserId = request.getAssignedToId() != null ? request.getAssignedToId() :
                            (task.getAssignedTo() != null ? task.getAssignedTo().getId() :
                            task.getColumn().getBoard().getOwner().getId());

        // Update basic fields
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setColor(request.getColor());

        // Update assigned user if provided
        if (request.getAssignedToId() != null) {
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            task.setAssignedTo(assignedUser);
        } else {
            task.setAssignedTo(null);
        }

        Task updated = taskRepository.save(task);

        // Log activities for changes
        if (oldPriority != null && !oldPriority.equals(request.getPriority())) {
            activityLogService.logActivity(
                updated.getId(),
                currentUserId,
                "PRIORITY_CHANGED",
                "priority",
                oldPriority,
                request.getPriority(),
                "changed priority from " + oldPriority + " to " + request.getPriority()
            );
        }

        if (!oldTitle.equals(request.getTitle())) {
            activityLogService.logActivity(
                updated.getId(),
                currentUserId,
                "UPDATED",
                "title",
                oldTitle,
                request.getTitle(),
                "changed title from \"" + oldTitle + "\" to \"" + request.getTitle() + "\""
            );
        }

        if ((oldAssignedTo == null && request.getAssignedToId() != null) ||
            (oldAssignedTo != null && !oldAssignedTo.getId().equals(request.getAssignedToId()))) {
            String oldAssignee = oldAssignedTo != null ? oldAssignedTo.getUsername() : "Unassigned";
            String newAssignee = request.getAssignedToId() != null ?
                userRepository.findById(request.getAssignedToId()).get().getUsername() : "Unassigned";
            activityLogService.logActivity(
                updated.getId(),
                currentUserId,
                "ASSIGNED",
                "assignedTo",
                oldAssignee,
                newAssignee,
                "changed assignee from " + oldAssignee + " to " + newAssignee
            );
        }

        return convertToDTO(updated);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    private TaskDTO convertToDTO(Task task) {
        // Convert attachments
        List<TaskAttachmentDTO> attachmentDTOs = task.getAttachments().stream()
                .map(this::convertAttachmentToDTO)
                .collect(Collectors.toList());

        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPosition(),
                task.getColumn().getId(),
                task.getAssignedTo() != null ? task.getAssignedTo().getId() : null,
                task.getAssignedTo() != null ? task.getAssignedTo().getUsername() : null,
                task.getDueDate(),
                task.getPriority(),
                task.getColor(),
                task.getVersion(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                attachmentDTOs
        );
    }

    private TaskAttachmentDTO convertAttachmentToDTO(TaskAttachment attachment) {
        TaskAttachmentDTO dto = new TaskAttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setOriginalFileName(attachment.getOriginalFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setTaskId(attachment.getTask().getId());
        dto.setUploadedAt(attachment.getUploadedAt());

        if (attachment.getUploadedBy() != null) {
            dto.setUploadedBy(attachment.getUploadedBy().getId());
            dto.setUploadedByUsername(attachment.getUploadedBy().getUsername());
        }

        return dto;
    }
}