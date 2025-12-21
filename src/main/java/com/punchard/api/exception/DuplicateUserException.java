package com.punchard.api.exception;

public class DuplicateUserException extends RuntimeException {

    public DuplicateUserException(String field, String value) {
        super(String.format("User with %s '%s' already exists", field, value));
    }
}

