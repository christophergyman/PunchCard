package com.punchard.api.exception;

import java.util.UUID;

public class DuplicatePunchException extends RuntimeException {

    public DuplicatePunchException(UUID cardId, int position) {
        super("Position " + position + " already punched on card: " + cardId);
    }
}
