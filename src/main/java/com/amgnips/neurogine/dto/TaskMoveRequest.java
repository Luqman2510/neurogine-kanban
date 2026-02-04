package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskMoveRequest {
    private Long taskId;
    private Long targetColumnId;
    private Integer newPosition;
    private Integer version;  // For optimistic locking check
}