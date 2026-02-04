package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.BoardDTO;
import com.amgnips.neurogine.dto.CreateBoardRequest;
import com.amgnips.neurogine.model.Boards;
import com.amgnips.neurogine.model.BoardColumn;
import com.amgnips.neurogine.model.User;
import com.amgnips.neurogine.repository.BoardMemberRepository;
import com.amgnips.neurogine.repository.BoardRepository;
import com.amgnips.neurogine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final BoardMemberRepository boardMemberRepository;

    @Transactional(readOnly = true)
    public List<BoardDTO> getBoardsByUser(Long userId) {
        // Get boards owned by user
        List<BoardDTO> ownedBoards = boardRepository.findByOwnerId(userId)
                .stream()
                .map(board -> convertToDTO(board, true)) // true = is owner
                .collect(Collectors.toList());

        // Get boards shared with user
        List<BoardDTO> sharedBoards = boardMemberRepository.findByUserId(userId)
                .stream()
                .map(member -> convertToDTO(member.getBoard(), false)) // false = not owner
                .collect(Collectors.toList());

        // Combine both lists
        List<BoardDTO> allBoards = new ArrayList<>();
        allBoards.addAll(ownedBoards);
        allBoards.addAll(sharedBoards);

        return allBoards;
    }

    @Transactional(readOnly = true)
    public BoardDTO getBoardById(Long boardId) {
        Boards board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        return convertToDTO(board);
    }

    @Transactional
    public BoardDTO createBoard(CreateBoardRequest request, Long userId) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Boards board = new Boards();
        board.setName(request.getName());
        board.setOwner(owner);

        // Create default columns
        BoardColumn todo = new BoardColumn();
        todo.setTitle("To Do");
        todo.setPosition(0);
        todo.setBoard(board);

        BoardColumn inProgress = new BoardColumn();
        inProgress.setTitle("In Progress");
        inProgress.setPosition(1);
        inProgress.setBoard(board);

        BoardColumn done = new BoardColumn();
        done.setTitle("Done");
        done.setPosition(2);
        done.setBoard(board);

        board.getColumns().add(todo);
        board.getColumns().add(inProgress);
        board.getColumns().add(done);

        Boards saved = boardRepository.save(board);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteBoard(Long boardId) {
        boardRepository.deleteById(boardId);
    }

    private BoardDTO convertToDTO(Boards board) {
        return new BoardDTO(
                board.getId(),
                board.getName(),
                board.getOwner().getId(),
                board.getOwner().getUsername(),
                false // Default to false, will be set by overloaded method
        );
    }

    private BoardDTO convertToDTO(Boards board, boolean isOwner) {
        return new BoardDTO(
                board.getId(),
                board.getName(),
                board.getOwner().getId(),
                board.getOwner().getUsername(),
                isOwner
        );
    }
}