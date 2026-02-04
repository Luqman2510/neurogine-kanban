package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.CreateCommentRequest;
import com.amgnips.neurogine.dto.TaskCommentDTO;
import com.amgnips.neurogine.service.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class TaskCommentController {

    private final TaskCommentService commentService;

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskCommentDTO>> getTaskComments(@PathVariable Long taskId) {
        List<TaskCommentDTO> comments = commentService.getTaskComments(taskId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<TaskCommentDTO> createComment(@RequestBody CreateCommentRequest request) {
        TaskCommentDTO created = commentService.createComment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<TaskCommentDTO> updateComment(
            @PathVariable Long commentId,
            @RequestBody String newText) {
        TaskCommentDTO updated = commentService.updateComment(commentId, newText);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}

