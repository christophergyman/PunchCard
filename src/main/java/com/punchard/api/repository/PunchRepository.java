package com.punchard.api.repository;

import com.punchard.api.model.Punch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PunchRepository extends JpaRepository<Punch, UUID> {

    List<Punch> findByCardIdOrderByPositionAsc(UUID cardId);

    int countByCardId(UUID cardId);

    boolean existsByCardIdAndPosition(UUID cardId, int position);

    void deleteByCardId(UUID cardId);
}
