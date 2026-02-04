package com.amgnips.neurogine.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardColumnDTO {
    private Long id;
    private String title;
    private Integer position;
    private Long boardId;
}