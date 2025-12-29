package com.punchard.api.repository;

import com.punchard.api.model.PunchCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PunchCardRepository extends JpaRepository<PunchCard, UUID> {

    Page<PunchCard> findByOwnerId(UUID ownerId, Pageable pageable);

    List<PunchCard> findByOwnerId(UUID ownerId);

    boolean existsByIdAndOwnerId(UUID id, UUID ownerId);

    @Query("SELECT pc FROM PunchCard pc LEFT JOIN FETCH pc.punches WHERE pc.id = :id")
    Optional<PunchCard> findByIdWithPunches(@Param("id") UUID id);
}
