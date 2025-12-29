package com.punchard.api.exception;

import java.util.UUID;

public class CardFullException extends RuntimeException {

    public CardFullException(UUID cardId) {
        super("Punch card is already full: " + cardId);
    }
}
