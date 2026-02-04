package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.BoardDTO;
import com.amgnips.neurogine.dto.CreateBoardRequest;
import com.amgnips.neurogine.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BoardDTO>> getUserBoards(@PathVariable Long userId) {
        return ResponseEntity.ok(boardService.getBoardsByUser(userId));
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardDTO> getBoard(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardService.getBoardById(boardId));
    }

    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(
            @RequestBody CreateBoardRequest request,
            @RequestParam Long userId) {
        BoardDTO created = boardService.createBoard(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build();
    }
}