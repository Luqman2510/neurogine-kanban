package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.BoardColumnDTO;
import com.amgnips.neurogine.service.BoardColumnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/columns")
@RequiredArgsConstructor
public class BoardColumnController {

    private final BoardColumnService columnService;

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<BoardColumnDTO>> getBoardColumns(@PathVariable Long boardId) {
        return ResponseEntity.ok(columnService.getColumnsByBoard(boardId));
    }
}