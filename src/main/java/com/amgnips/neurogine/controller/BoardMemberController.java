package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.AddBoardMemberRequest;
import com.amgnips.neurogine.dto.BoardMemberDTO;
import com.amgnips.neurogine.service.BoardMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BoardMemberController {

    private final BoardMemberService boardMemberService;

    /**
     * Get all members of a board
     */
    @GetMapping("/{boardId}/members")
    public ResponseEntity<List<BoardMemberDTO>> getBoardMembers(@PathVariable Long boardId) {
        List<BoardMemberDTO> members = boardMemberService.getBoardMembers(boardId);
        return ResponseEntity.ok(members);
    }

    /**
     * Add a member to a board
     */
    @PostMapping("/members")
    public ResponseEntity<?> addMember(@RequestBody AddBoardMemberRequest request) {
        try {
            BoardMemberDTO member = boardMemberService.addMember(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Remove a member from a board
     */
    @DeleteMapping("/{boardId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long boardId, @PathVariable Long userId) {
        try {
            boardMemberService.removeMember(boardId, userId);
            return ResponseEntity.ok("Member removed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Check if a user has access to a board
     */
    @GetMapping("/{boardId}/access/{userId}")
    public ResponseEntity<Boolean> hasAccess(@PathVariable Long boardId, @PathVariable Long userId) {
        boolean hasAccess = boardMemberService.hasAccess(boardId, userId);
        return ResponseEntity.ok(hasAccess);
    }
}

