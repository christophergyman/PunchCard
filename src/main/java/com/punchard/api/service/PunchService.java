package com.punchard.api.service;

import com.punchard.api.dto.CreatePunchRequest;
import com.punchard.api.dto.PunchResponse;
import com.punchard.api.exception.*;
import com.punchard.api.model.Punch;
import com.punchard.api.model.PunchCard;
import com.punchard.api.model.User;
import com.punchard.api.repository.PunchCardRepository;
import com.punchard.api.repository.PunchRepository;
import com.punchard.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class PunchService {

    private final PunchRepository punchRepository;
    private final PunchCardRepository punchCardRepository;
    private final UserRepository userRepository;

    public PunchService(PunchRepository punchRepository,
                       PunchCardRepository punchCardRepository,
                       UserRepository userRepository) {
        this.punchRepository = punchRepository;
        this.punchCardRepository = punchCardRepository;
        this.userRepository = userRepository;
    }

    public PunchResponse addPunch(UUID cardId, UUID punchedById, CreatePunchRequest request) {
        PunchCard card = punchCardRepository.findById(cardId)
                .orElseThrow(() -> new PunchCardNotFoundException(cardId));

        User punchedBy = userRepository.findById(punchedById)
                .orElseThrow(() -> new UserNotFoundException(punchedById));

        int position = request.position();

        // Validate position is within valid range
        if (position < 1 || position > card.getTotalSlots()) {
            throw new InvalidPunchPositionException(cardId, position, card.getTotalSlots());
        }

        // Check if card is already full
        if (card.isFull()) {
            throw new CardFullException(cardId);
        }

        // Check if this position is already punched
        if (punchRepository.existsByCardIdAndPosition(cardId, position)) {
            throw new DuplicatePunchException(cardId, position);
        }

        Punch punch = Punch.builder()
                .card(card)
                .punchedBy(punchedBy)
                .position(position)
                .build();

        Punch savedPunch = punchRepository.save(punch);
        return PunchResponse.fromEntity(savedPunch);
    }

    @Transactional(readOnly = true)
    public List<PunchResponse> getPunchesByCard(UUID cardId) {
        if (!punchCardRepository.existsById(cardId)) {
            throw new PunchCardNotFoundException(cardId);
        }

        return punchRepository.findByCardIdOrderByPositionAsc(cardId)
                .stream()
                .map(PunchResponse::fromEntity)
                .toList();
    }
}
