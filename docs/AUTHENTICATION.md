# Authentication Guide

Complete guide to authentication and authorization in the PunchCard API.

---

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)
  - [1. Set Up JWT Secret](#1-set-up-jwt-secret)
  - [2. Register a User](#2-register-a-user)
  - [3. Login and Get Token](#3-login-and-get-token)
- [Using Tokens](#using-tokens)
  - [Including Tokens in Requests](#including-tokens-in-requests)
  - [Token Expiration](#token-expiration)
  - [Token Structure](#token-structure)
- [Roles and Permissions](#roles-and-permissions)
  - [USER Role](#user-role)
  - [ADMIN Role](#admin-role)
  - [Role-Based Access Control Matrix](#role-based-access-control-matrix)
- [Security Best Practices](#security-best-practices)
  - [Storing Tokens](#storing-tokens)
  - [Token Refresh Strategy](#token-refresh-strategy)
  - [Handling Expired Tokens](#handling-expired-tokens)
  - [HTTPS in Production](#https-in-production)
- [Troubleshooting](#troubleshooting)
  - [Common Authentication Errors](#common-authentication-errors)
  - [Debugging Tips](#debugging-tips)
- [Known Limitations](#known-limitations)
- [Related Documentation](#related-documentation)

---

## Overview

PunchCard uses **JWT (JSON Web Token)** authentication for stateless API access. After logging in, you receive a JWT token that you include in subsequent requests.

## Authentication Flow

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Client  │                    │   API    │                    │  User   │
│         │                    │          │                    │  Store  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                               │                               │
     │  1. POST /api/auth/register   │                               │
     │───────────────────────────────>│                               │
     │                               │  2. Create user               │
     │                               │──────────────────────────────>│
     │                               │  3. User created              │
     │                               │<──────────────────────────────│
     │  4. UserResponse (201)        │                               │
     │<───────────────────────────────│                               │
     │                               │                               │
     │  5. POST /api/auth/login      │                               │
     │───────────────────────────────>│                               │
     │                               │  6. Validate credentials      │
     │                               │──────────────────────────────>│
     │                               │  7. Credentials valid         │
     │                               │<──────────────────────────────│
     │                               │  8. Generate JWT token        │
     │  9. AuthResponse + JWT (200)  │                               │
     │<───────────────────────────────│                               │
     │                               │                               │
     │  10. GET /api/users + Bearer   │                               │
     │───────────────────────────────>│                               │
     │                               │  11. Validate JWT             │
     │                               │  12. Extract user info        │
     │  13. Response (200)           │                               │
     │<───────────────────────────────│                               │
     │                               │                               │
```

## Getting Started

### 1. Set Up JWT Secret

Before starting the application, you must set the `JWT_SECRET` environment variable:

```bash
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

**Important:** 
- The secret must be at least 32 characters long
- Use a strong, random secret in production
- Never commit secrets to version control
- The application will fail to start if `JWT_SECRET` is not set

**For local development:**
```bash
# Add to your ~/.zshrc or ~/.bashrc
export JWT_SECRET="dev-secret-key-for-local-development-only-32-chars-min"
```

### 2. Register a User

First, create a user account:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T10:30:00Z"
}
```

### 3. Login and Get Token

Authenticate to receive a JWT token:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZG9lIiwidXNlcklkIjoiMTIzZTQ1NjctZTg5Yi0xMmQzLWE0NTYtNDI2NjE0MTc0MDAwIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3MDMyNDE4MDAsImV4cCI6MTcwMzUwMTAwMH0...",
  "type": "Bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2024-12-22T10:30:00Z",
    "updatedAt": "2024-12-22T10:30:00Z"
  }
}
```

**Extract the token:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"securepass123"}' \
  | jq -r '.token')
```

## Using Tokens

### Including Tokens in Requests

Include the JWT token in the `Authorization` header of all authenticated requests:

```
Authorization: Bearer <your-token>
```

**cURL Example:**
```bash
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**JavaScript Example:**
```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const response = await fetch('http://localhost:8080/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Python Example:**
```python
import requests

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

headers = {
    'Authorization': f'Bearer {token}'
}

response = requests.get('http://localhost:8080/api/users', headers=headers)
```

### Token Expiration

- **Expiration Time:** 8 hours (28,800,000 milliseconds)
- **After Expiration:** Token becomes invalid and you must login again
- **No Refresh Tokens:** Currently, there is no refresh token mechanism. Users must re-authenticate when tokens expire.

### Token Structure

JWT tokens contain the following claims:

- `sub` (subject): Username
- `userId`: User's UUID
- `role`: User's role (USER or ADMIN)
- `iat` (issued at): Token creation timestamp
- `exp` (expiration): Token expiration timestamp

**Example Decoded Token:**
```json
{
  "sub": "johndoe",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "role": "USER",
  "iat": 1703241800,
  "exp": 1703501000
}
```

## Roles and Permissions

### USER Role

Default role assigned to all new users.

**Permissions:**
- ✅ View all users (`GET /api/users`, `GET /api/users/{id}`)
- ✅ Update own profile (`PUT /api/users/{id}` where `id` matches their own)
- ✅ Delete own account (`DELETE /api/users/{id}` where `id` matches their own)
- ❌ Create users via `POST /api/users` (admin only)
- ❌ Update other users' profiles
- ❌ Delete other users' accounts

### ADMIN Role

Elevated permissions for administrative tasks.

**Permissions:**
- ✅ All USER permissions
- ✅ Create users via `POST /api/users`
- ✅ Update any user's profile
- ✅ Delete any user's account

### Role-Based Access Control Matrix

| Endpoint | Method | USER | ADMIN |
|----------|--------|------|-------|
| `/api/auth/register` | POST | ✅ | ✅ |
| `/api/auth/login` | POST | ✅ | ✅ |
| `/api/hello` | GET | ✅ | ✅ |
| `/api/users` | POST | ❌ | ✅ |
| `/api/users` | GET | ✅ | ✅ |
| `/api/users/{id}` | GET | ✅ | ✅ |
| `/api/users/{id}` | PUT | Own only | ✅ |
| `/api/users/{id}` | DELETE | Own only | ✅ |

## Security Best Practices

### Storing Tokens

**Client-Side (Web Applications):**
- ✅ Store in memory (JavaScript variable)
- ✅ Store in `httpOnly` cookies (most secure)
- ❌ Do NOT store in `localStorage` (vulnerable to XSS)
- ❌ Do NOT store in `sessionStorage` (vulnerable to XSS)

**Server-Side:**
- ✅ Store in secure session storage
- ✅ Use environment variables for secrets
- ❌ Do NOT log tokens
- ❌ Do NOT commit tokens to version control

### Token Refresh Strategy

Since there are no refresh tokens, implement client-side token refresh:

```javascript
// Check token expiration before making requests
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// Refresh token by logging in again
async function refreshToken(username, password) {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const auth = await response.json();
  return auth.token;
}
```

### Handling Expired Tokens

When a token expires, you'll receive a `401 Unauthorized` response:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

**Client-Side Handling:**
```javascript
async function makeAuthenticatedRequest(url, options = {}) {
  let token = getStoredToken();
  
  // Check if token is expired
  if (isTokenExpired(token)) {
    // Re-authenticate
    token = await refreshToken(username, password);
    storeToken(token);
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Handle 401 - token might have expired during request
  if (response.status === 401) {
    // Re-authenticate and retry once
    token = await refreshToken(username, password);
    storeToken(token);
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    });
  }
  
  return response;
}
```

### HTTPS in Production

**Always use HTTPS in production!**

- JWT tokens are signed but not encrypted
- Tokens transmitted over HTTP can be intercepted
- Use HTTPS to protect tokens in transit

## Troubleshooting

### Common Authentication Errors

#### 401 Unauthorized

**Causes:**
- Missing `Authorization` header
- Invalid token format
- Expired token
- Invalid credentials (for login)

**Solutions:**
- Ensure token is included: `Authorization: Bearer <token>`
- Check token hasn't expired (8 hours)
- Verify token format (should be three parts separated by dots)
- Re-authenticate to get a new token

**Example Error:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### 403 Forbidden

**Causes:**
- Authenticated but insufficient permissions
- Trying to access admin-only endpoint as regular user
- Trying to modify another user's data as regular user

**Solutions:**
- Verify you have the required role (ADMIN for admin endpoints)
- Ensure you're the owner of the resource (for user updates/deletes)
- Check the role-based access control matrix above

**Example Error:**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### Invalid Token Format

**Symptoms:**
- Token doesn't have three parts separated by dots
- Token is malformed

**Solution:**
- Ensure you're using the full token from the login response
- Don't modify or truncate the token
- Token format: `header.payload.signature`

#### Token Not Working After Server Restart

**Cause:**
- JWT secret changed
- Tokens are signed with the secret, so changing the secret invalidates all existing tokens

**Solution:**
- Re-authenticate to get a new token signed with the current secret
- Keep the same `JWT_SECRET` across server restarts in production

### Debugging Tips

**1. Verify Token Structure:**
```bash
# Decode token (without verification)
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huZG9lIn0..." | cut -d. -f2 | base64 -d | jq
```

**2. Check Token Expiration:**
```javascript
const token = 'your-token-here';
const payload = JSON.parse(atob(token.split('.')[1]));
const expirationDate = new Date(payload.exp * 1000);
console.log('Token expires:', expirationDate);
console.log('Is expired:', expirationDate < new Date());
```

**3. Test Authentication:**
```bash
# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"securepass123"}'

# Test authenticated endpoint
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <token-from-login>"
```

## Known Limitations

1. **No Refresh Tokens:** Users must re-authenticate when tokens expire (every 8 hours)
2. **No Token Revocation:** Tokens cannot be invalidated before expiration
3. **No Rate Limiting:** Login endpoint is not rate-limited (may be added in future)
4. **Stateless Only:** No server-side session management

## Related Documentation

- [API.md](API.md) - Complete API reference
- [TESTING.md](TESTING.md) - Testing documentation
- [README.md](../README.md) - Project overview and setup

