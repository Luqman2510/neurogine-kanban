package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data; 
import lombok.NoArgsConstructor;    

@Data
@NoArgsConstructor
@AllArgsConstructor

public class BoardDTO {
    private Long id;
    private String name;
    private Long ownerId;
    private String ownerUsername;
    private boolean isOwner; // True if current user is the owner
}
