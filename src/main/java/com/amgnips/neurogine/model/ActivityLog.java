package com.amgnips.neurogine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "action_type", length = 50, nullable = false)
    private String actionType; // CREATED, UPDATED, MOVED, DELETED, ASSIGNED, PRIORITY_CHANGED, etc.

    @Column(name = "field_name", length = 100)
    private String fieldName; // Which field was changed

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue; // Previous value

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue; // New value

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // Human-readable description

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

