package com.amgnips.neurogine.service;

import com.amgnips.neurogine.dto.BoardColumnDTO;
import com.amgnips.neurogine.model.BoardColumn;
import com.amgnips.neurogine.repository.BoardColumnRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardColumnService {

    private final BoardColumnRepository columnRepository;

    @Transactional(readOnly = true)
    public List<BoardColumnDTO> getColumnsByBoard(Long boardId) {
        return columnRepository.findByBoardIdOrderByPositionAsc(boardId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private BoardColumnDTO convertToDTO(BoardColumn column) {
        return new BoardColumnDTO(
                column.getId(),
                column.getTitle(),
                column.getPosition(),
                column.getBoard().getId()
        );
    }
}