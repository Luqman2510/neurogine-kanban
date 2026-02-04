package com.amgnips.neurogine.repository;

import com.amgnips.neurogine.model.BoardMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {

    // Find all members of a board
    List<BoardMember> findByBoardId(Long boardId);

    // Find all boards a user is a member of
    List<BoardMember> findByUserId(Long userId);

    // Check if a user is a member of a board
    boolean existsByBoardIdAndUserId(Long boardId, Long userId);

    // Find specific membership
    Optional<BoardMember> findByBoardIdAndUserId(Long boardId, Long userId);

    // Delete membership
    void deleteByBoardIdAndUserId(Long boardId, Long userId);

    // Get all board IDs that a user has access to (owned or member)
    @Query("SELECT DISTINCT bm.board.id FROM BoardMember bm WHERE bm.user.id = :userId")
    List<Long> findBoardIdsByUserId(@Param("userId") Long userId);
}

