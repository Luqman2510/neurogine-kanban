package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.AddBoardMemberRequest;
import com.amgnips.neurogine.dto.BoardMemberDTO;
import com.amgnips.neurogine.model.BoardMember;
import com.amgnips.neurogine.model.Boards;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.BoardMemberRepository;
import com.amgnips.neurogine.repository.BoardRepository;
import com.amgnips.neurogine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardMemberService {

    private final BoardMemberRepository boardMemberRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Transactional
    public BoardMemberDTO addMember(AddBoardMemberRequest request) {
        // Find the board
        Boards board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // Find the user by username or email
        User user = userRepository.findByUsername(request.getUsername())
                .orElseGet(() -> userRepository.findByEmail(request.getUsername())
                        .orElseThrow(() -> new RuntimeException("User not found: " + request.getUsername())));

        // Check if already a member
        if (boardMemberRepository.existsByBoardIdAndUserId(board.getId(), user.getId())) {
            throw new RuntimeException("User is already a member of this board");
        }

        // Create new board member
        BoardMember boardMember = new BoardMember();
        boardMember.setBoard(board);
        boardMember.setUser(user);
        boardMember.setRole(request.getRole() != null ? request.getRole() : "MEMBER");

        BoardMember saved = boardMemberRepository.save(boardMember);

        return convertToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<BoardMemberDTO> getBoardMembers(Long boardId) {
        List<BoardMember> members = boardMemberRepository.findByBoardId(boardId);
        return members.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeMember(Long boardId, Long userId) {
        boardMemberRepository.deleteByBoardIdAndUserId(boardId, userId);
    }

    @Transactional(readOnly = true)
    public boolean hasAccess(Long boardId, Long userId) {
        // Check if user is owner
        Boards board = boardRepository.findById(boardId).orElse(null);
        if (board != null && board.getOwner().getId().equals(userId)) {
            return true;
        }

        // Check if user is a member
        return boardMemberRepository.existsByBoardIdAndUserId(boardId, userId);
    }

    private BoardMemberDTO convertToDTO(BoardMember member) {
        BoardMemberDTO dto = new BoardMemberDTO();
        dto.setId(member.getId());
        dto.setBoardId(member.getBoard().getId());
        dto.setUserId(member.getUser().getId());
        dto.setUsername(member.getUser().getUsername());
        dto.setEmail(member.getUser().getEmail());
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }
}

