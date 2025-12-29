package com.punchard.api.exception;

import java.util.UUID;

public class PunchCardNotFoundException extends RuntimeException {

    public PunchCardNotFoundException(UUID id) {
        super("Punch card not found with id: " + id);
    }
}
