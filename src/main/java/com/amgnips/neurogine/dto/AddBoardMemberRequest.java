package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddBoardMemberRequest {
    private Long boardId;
    private String username; // Username or email of the user to add
    private String role; // MEMBER, ADMIN, VIEWER
}

