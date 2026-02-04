package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.ActivityLogDTO;
import com.amgnips.neurogine.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<ActivityLogDTO>> getTaskActivities(@PathVariable Long taskId) {
        List<ActivityLogDTO> activities = activityLogService.getTaskActivities(taskId);
        return ResponseEntity.ok(activities);
    }
}

