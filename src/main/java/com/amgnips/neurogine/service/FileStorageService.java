package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.TaskAttachmentDTO;
import com.amgnips.neurogine.model.Task;
import com.amgnips.neurogine.model.TaskAttachment;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.TaskAttachmentRepository;
import com.amgnips.neurogine.repository.TaskRepository;
import com.amgnips.neurogine.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileStorageService {

    private final TaskAttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public FileStorageService(TaskAttachmentRepository attachmentRepository,
                              TaskRepository taskRepository,
                              UserRepository userRepository) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    @Transactional
    public TaskAttachmentDTO storeFile(MultipartFile file, Long taskId, Long userId) {
        // Validate file
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFileName.contains("..")) {
            throw new RuntimeException("Invalid file path: " + originalFileName);
        }

        // Generate unique filename
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            // Store file
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Get task and user
            Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create attachment record
            TaskAttachment attachment = new TaskAttachment();
            attachment.setFileName(fileName);
            attachment.setOriginalFileName(originalFileName);
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setFilePath(targetLocation.toString());
            attachment.setTask(task);
            attachment.setUploadedBy(user);

            TaskAttachment saved = attachmentRepository.save(attachment);
            return convertToDTO(saved);

        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName, ex);
        }
    }

    public List<TaskAttachmentDTO> getTaskAttachments(Long taskId) {
        return attachmentRepository.findByTaskId(taskId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskAttachmentDTO getAttachment(Long attachmentId) {
        TaskAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return convertToDTO(attachment);
    }

    public Resource loadFileAsResource(Long attachmentId) {
        try {
            TaskAttachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new RuntimeException("Attachment not found"));

            Path filePath = Paths.get(attachment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + attachment.getFileName());
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found", ex);
        }
    }

    @Transactional
    public void deleteFile(Long attachmentId) {
        TaskAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        try {
            // Delete physical file
            Path filePath = Paths.get(attachment.getFilePath());
            Files.deleteIfExists(filePath);

            // Delete database record
            attachmentRepository.delete(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file", ex);
        }
    }

    private TaskAttachmentDTO convertToDTO(TaskAttachment attachment) {
        TaskAttachmentDTO dto = new TaskAttachmentDTO();
        dto.setId(attachment.getId());
        dto.setFileName(attachment.getFileName());
        dto.setOriginalFileName(attachment.getOriginalFileName());
        dto.setFileType(attachment.getFileType());
        dto.setFileSize(attachment.getFileSize());
        dto.setTaskId(attachment.getTask().getId());
        dto.setUploadedAt(attachment.getUploadedAt());

        if (attachment.getUploadedBy() != null) {
            dto.setUploadedBy(attachment.getUploadedBy().getId());
            dto.setUploadedByUsername(attachment.getUploadedBy().getUsername());
        }

        return dto;
    }
}

