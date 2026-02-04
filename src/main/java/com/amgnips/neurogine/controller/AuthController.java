package com.amgnips.neurogine.controller;

import com.amgnips.neurogine.dto.AuthResponse;
import com.amgnips.neurogine.dto.LoginRequest;
import com.amgnips.neurogine.dto.RegisterRequest;
import com.amgnips.neurogine.model.Boards;
import com.amgnips.neurogine.model.BoardColumn;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.BoardColumnRepository;
import com.amgnips.neurogine.repository.BoardRepository;
import com.amgnips.neurogine.repository.UserRepository;
import com.amgnips.neurogine.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BoardRepository boardRepository;
    private final BoardColumnRepository boardColumnRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        // Create default board for new user
        Boards defaultBoard = new Boards();
        defaultBoard.setName("My First Board");
        defaultBoard.setOwner(savedUser);
        defaultBoard.setCreatedAt(LocalDateTime.now());
        Boards savedBoard = boardRepository.save(defaultBoard);

        // Create default columns
        String[] columnNames = {"To Do", "In Progress", "Done"};
        for (int i = 0; i < columnNames.length; i++) {
            BoardColumn column = new BoardColumn();
            column.setTitle(columnNames[i]);
            column.setBoard(savedBoard);
            column.setPosition(i);
            column.setCreatedAt(LocalDateTime.now());
            boardColumnRepository.save(column);
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());

        AuthResponse response = new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Find user by username
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );

        return ResponseEntity.ok(response);
    }
}

