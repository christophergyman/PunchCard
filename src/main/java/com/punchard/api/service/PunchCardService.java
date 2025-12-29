package com.punchard.api.service;

import com.punchard.api.dto.*;
import com.punchard.api.exception.PunchCardNotFoundException;
import com.punchard.api.exception.UserNotFoundException;
import com.punchard.api.model.CardStyle;
import com.punchard.api.model.PunchCard;
import com.punchard.api.model.User;
import com.punchard.api.repository.PunchCardRepository;
import com.punchard.api.repository.PunchRepository;
import com.punchard.api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class PunchCardService {

    private final PunchCardRepository punchCardRepository;
    private final PunchRepository punchRepository;
    private final UserRepository userRepository;

    public PunchCardService(PunchCardRepository punchCardRepository,
                           PunchRepository punchRepository,
                           UserRepository userRepository) {
        this.punchCardRepository = punchCardRepository;
        this.punchRepository = punchRepository;
        this.userRepository = userRepository;
    }

    public PunchCardResponse createCard(UUID ownerId, CreatePunchCardRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException(ownerId));

        CardStyle cardStyle = request.cardStyle() != null
                ? request.cardStyle().toEntity()
                : new CardStyle();

        PunchCard card = PunchCard.builder()
                .owner(owner)
                .title(request.title())
                .description(request.description())
                .totalSlots(request.totalSlots())
                .reward(request.reward())
                .cardStyle(cardStyle)
                .build();

        PunchCard savedCard = punchCardRepository.save(card);
        return PunchCardResponse.fromEntity(savedCard);
    }

    @Transactional(readOnly = true)
    public PunchCardResponse getCardById(UUID id) {
        PunchCard card = punchCardRepository.findByIdWithPunches(id)
                .orElseThrow(() -> new PunchCardNotFoundException(id));
        return PunchCardResponse.fromEntity(card);
    }

    @Transactional(readOnly = true)
    public Page<PunchCardResponse> getCardsByOwner(UUID ownerId, Pageable pageable) {
        return punchCardRepository.findByOwnerId(ownerId, pageable)
                .map(card -> {
                    var punches = punchRepository.findByCardIdOrderByPositionAsc(card.getId());
                    return PunchCardResponse.fromEntity(card, punches);
                });
    }

    public PunchCardResponse updateCard(UUID id, UpdatePunchCardRequest request) {
        PunchCard card = punchCardRepository.findByIdWithPunches(id)
                .orElseThrow(() -> new PunchCardNotFoundException(id));

        if (request.title() != null) {
            card.setTitle(request.title());
        }
        if (request.description() != null) {
            card.setDescription(request.description());
        }
        if (request.reward() != null) {
            card.setReward(request.reward());
        }
        if (request.cardStyle() != null) {
            CardStyle currentStyle = card.getCardStyle();
            if (currentStyle == null) {
                currentStyle = new CardStyle();
            }
            CardStyleDto styleDto = request.cardStyle();
            if (styleDto.backgroundColor() != null) {
                currentStyle.setBackgroundColor(styleDto.backgroundColor());
            }
            if (styleDto.textColor() != null) {
                currentStyle.setTextColor(styleDto.textColor());
            }
            if (styleDto.texture() != null) {
                currentStyle.setTexture(styleDto.texture());
            }
            if (styleDto.punchShape() != null) {
                currentStyle.setPunchShape(styleDto.punchShape());
            }
            card.setCardStyle(currentStyle);
        }

        PunchCard updatedCard = punchCardRepository.save(card);
        return PunchCardResponse.fromEntity(updatedCard);
    }

    public void deleteCard(UUID id) {
        if (!punchCardRepository.existsById(id)) {
            throw new PunchCardNotFoundException(id);
        }
        punchCardRepository.deleteById(id);
    }
}
