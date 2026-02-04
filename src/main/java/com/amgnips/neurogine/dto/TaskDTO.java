package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private Integer position;
    private Long columnId;
    private Long assignedToId;
    private String assignedToUsername;
    private LocalDateTime dueDate;
    private String priority;
    private String color;
    private Integer version;  // For optimistic locking!
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TaskAttachmentDTO> attachments;
}