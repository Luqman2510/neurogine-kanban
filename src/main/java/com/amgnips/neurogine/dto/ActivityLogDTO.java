package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogDTO {
    private Long id;
    private Long taskId;
    private Long userId;
    private String username;
    private String actionType;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String description;
    private LocalDateTime createdAt;
}

