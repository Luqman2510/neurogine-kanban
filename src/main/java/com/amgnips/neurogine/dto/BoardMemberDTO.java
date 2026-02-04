package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardMemberDTO {
    private Long id;
    private Long boardId;
    private Long userId;
    private String username;
    private String email;
    private String role;
    private LocalDateTime joinedAt;
}

