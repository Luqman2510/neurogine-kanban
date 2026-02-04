package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.ActivityLogDTO;
import com.amgnips.neurogine.model.ActivityLog;
import com.amgnips.neurogine.model.Task;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.ActivityLogRepository;
import com.amgnips.neurogine.repository.TaskRepository;
import com.amgnips.neurogine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ActivityLogDTO> getTaskActivities(Long taskId) {
        return activityLogRepository.findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActivityLogDTO logActivity(Long taskId, Long userId, String actionType, 
                                      String fieldName, String oldValue, String newValue, String description) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ActivityLog log = new ActivityLog();
        log.setTask(task);
        log.setUser(user);
        log.setActionType(actionType);
        log.setFieldName(fieldName);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setDescription(description);

        ActivityLog saved = activityLogRepository.save(log);
        return convertToDTO(saved);
    }

    private ActivityLogDTO convertToDTO(ActivityLog log) {
        return new ActivityLogDTO(
                log.getId(),
                log.getTask().getId(),
                log.getUser().getId(),
                log.getUser().getUsername(),
                log.getActionType(),
                log.getFieldName(),
                log.getOldValue(),
                log.getNewValue(),
                log.getDescription(),
                log.getCreatedAt()
        );
    }
}

