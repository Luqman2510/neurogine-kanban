package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCommentDTO {
    private Long id;
    private Long taskId;
    private Long userId;
    private String username;
    private String commentText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

