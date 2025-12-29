package com.punchard.api.exception;

import java.util.UUID;

public class InvalidPunchPositionException extends RuntimeException {

    public InvalidPunchPositionException(UUID cardId, int position, int totalSlots) {
        super("Invalid punch position " + position + " for card " + cardId + ". Must be between 1 and " + totalSlots);
    }
}
