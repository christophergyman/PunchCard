# Authentication Guide

Complete guide to authentication and authorization in the PunchCard API.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
  - [Security Components](#security-components)
  - [Authentication Flow Diagram](#authentication-flow-diagram)
- [Getting Started](#getting-started)
  - [1. Set Up JWT Secret](#1-set-up-jwt-secret)
  - [2. Register a User](#2-register-a-user)
  - [3. Login and Get Token](#3-login-and-get-token)
- [Using Tokens](#using-tokens)
  - [Including Tokens in Requests](#including-tokens-in-requests)
  - [Token Expiration](#token-expiration)
  - [Token Structure](#token-structure)
- [Security Configuration](#security-configuration)
  - [Public Endpoints](#public-endpoints)
  - [Protected Endpoints](#protected-endpoints)
  - [CORS Configuration](#cors-configuration)
- [Roles and Permissions](#roles-and-permissions)
  - [USER Role](#user-role)
  - [ADMIN Role](#admin-role)
  - [Role-Based Access Control Matrix](#role-based-access-control-matrix)
  - [Owner-Based Access Control](#owner-based-access-control)
  - [Security Services](#security-services)
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

PunchCard uses **JWT (JSON Web Token)** authentication for stateless API access. The system implements:

- **Stateless Authentication**: No server-side sessions; all authentication state is contained in JWT tokens
- **Role-Based Access Control (RBAC)**: Two roles (USER and ADMIN) with different permission levels
- **Owner-Based Access Control**: Users can only access their own resources unless they are admins
- **Spring Security Integration**: Uses Spring Security's filter chain and method-level security annotations

## Architecture

### Security Components

The authentication system consists of several key components:

| Component | Location | Purpose |
|-----------|----------|---------|
| `SecurityConfig` | `config/SecurityConfig.java` | Main Spring Security configuration |
| `JwtService` | `security/JwtService.java` | JWT token generation et validation |
| `JwtAuthenticationFilter` | `security/JwtAuthenticationFilter.java` | Extracts and validates JWT from requests |
| `UserPrincipal` | `security/UserPrincipal.java` | Spring Security UserDetails implementation |
| `UserSecurityService` | `security/UserSecurityService.java` | User ownership verification for @PreAuthorize |
| `CardSecurityService` | `security/CardSecurityService.java` | Punch card ownership verification for @PreAuthorize |
| `AuthController` | `controller/AuthController.java` | Registration, login, and current user endpoints |
| `AuthService` | `service/AuthService.java` | Authentication business logic |

### Authentication Flow Diagram

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
     │  10. GET /api/cards + Bearer  │                               │
     │───────────────────────────────>│                               │
     │                               │  11. JwtAuthenticationFilter  │
     │                               │      validates JWT            │
     │                               │  12. Extract UserPrincipal    │
     │                               │  13. Set SecurityContext      │
     │  14. Response (200)           │                               │
     │<───────────────────────────────│                               │
     │                               │                               │
```

## Getting Started

### 1. Set Up JWT Secret

Before starting the application in production mode, you must set the `JWT_SECRET` environment variable:

```bash
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

**Important:**
- The secret must be at least 32 characters long (enforced by `JwtService`)
- Use a strong, random secret in production
- Never commit secrets to version control
- The application will fail to start if `JWT_SECRET` is not set in production

**For local development:**

The `dev` profile provides a default secret, so you can start the application without setting environment variables:

```bash
# Run with dev profile (uses default secret)
./gradlew bootRun --args='--spring.profiles.active=dev'
```

Or set the environment variable manually:
```bash
# Add to your ~/.zshrc or ~/.bashrc
export JWT_SECRET="dev-secret-key-for-local-development-only-32-chars-min"
```

**Configuration Properties:**

| Property | Default (dev) | Production |
|----------|---------------|------------|
| `jwt.secret` | `dev-secret-key-for-local-testing-must-be-at-least-32-characters` | `${JWT_SECRET}` (required) |
| `jwt.expiration` | 28800000 (8 hours) | 28800000 (8 hours) |

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

## Security Configuration

The security configuration is defined in `SecurityConfig.java` and uses Spring Security 6.x patterns.

### Public Endpoints

The following endpoints do not require authentication:

| Endpoint Pattern | Description |
|------------------|-------------|
| `/api/auth/**` | All authentication endpoints (register, login) |
| `/api/hello` | Health check / welcome endpoint |
| `/h2-console/**` | H2 database console (development only) |
| `/actuator/health` | Application health check |

### Protected Endpoints

All other endpoints under `/api/**` require a valid JWT token. The `JwtAuthenticationFilter` intercepts every request and:

1. Checks for the `Authorization` header with `Bearer` prefix
2. Extracts and validates the JWT token using `JwtService`
3. Creates a `UserPrincipal` from the token claims
4. Sets up the Spring Security `SecurityContext`

**Filter Chain Order:**
```
Request → JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter → Controller
```

### CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured for frontend development:

| Setting | Value |
|---------|-------|
| Allowed Origins | `http://localhost:5173`, `http://127.0.0.1:5173` |
| Allowed Methods | `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` |
| Allowed Headers | `*` (all) |
| Allow Credentials | `true` |
| Max Age | 3600 seconds (1 hour) |

**Note:** CORS is only applied to `/api/**` endpoints. Update `SecurityConfig.java` to add additional origins for production deployments.

## Roles and Permissions

### USER Role

Default role assigned to all new users via registration.

**Permissions:**
- ✅ Get current user info (`GET /api/auth/me`)
- ✅ View all users (`GET /api/users`, `GET /api/users/{id}`)
- ✅ Update own profile (`PUT /api/users/{id}` where `id` matches their own)
- ✅ Delete own account (`DELETE /api/users/{id}` where `id` matches their own)
- ✅ View own punch cards (`GET /api/cards` - returns only cards owned by the user)
- ✅ View specific punch card (`GET /api/cards/{id}` - only if owner)
- ✅ View punches on own cards (`GET /api/cards/{cardId}/punches` - only if card owner)
- ❌ Create users via `POST /api/users` (admin only)
- ❌ Update other users' profiles
- ❌ Delete other users' accounts
- ❌ Create punch cards (admin only)
- ❌ Update/delete punch cards (admin only)
- ❌ Add punches to cards (admin only)
- ❌ Promote users to admin (admin only)

### ADMIN Role

Elevated permissions for administrative tasks. Admins manage punch cards for users (like a loyalty program).

**Permissions:**
- ✅ All USER permissions
- ✅ Create users via `POST /api/users`
- ✅ Update any user's profile
- ✅ Delete any user's account
- ✅ Promote users to admin (`POST /api/users/{id}/promote`)
- ✅ Create punch cards for any user (`POST /api/cards`)
- ✅ View any punch card (`GET /api/cards/{id}`)
- ✅ Update any punch card (`PUT /api/cards/{id}`)
- ✅ Delete any punch card (`DELETE /api/cards/{id}`)
- ✅ Add punches to any card (`POST /api/cards/{cardId}/punches`)
- ✅ View punches on any card (`GET /api/cards/{cardId}/punches`)

### Role-Based Access Control Matrix

| Endpoint | Method | USER | ADMIN | Notes |
|----------|--------|------|-------|-------|
| `/api/auth/register` | POST | ✅ Public | ✅ Public | Self-registration |
| `/api/auth/login` | POST | ✅ Public | ✅ Public | Returns JWT token |
| `/api/auth/me` | GET | ✅ | ✅ | Returns authenticated user |
| `/api/hello` | GET | ✅ Public | ✅ Public | Health check |
| `/api/users` | POST | ❌ | ✅ | Admin creates users |
| `/api/users` | GET | ✅ | ✅ | Paginated list |
| `/api/users/{id}` | GET | ✅ | ✅ | View any profile |
| `/api/users/{id}` | PUT | Own only | ✅ | Update profile |
| `/api/users/{id}` | DELETE | Own only | ✅ | Delete account |
| `/api/users/{id}/promote` | POST | ❌ | ✅ | Promote to admin |
| `/api/cards` | POST | ❌ | ✅ | Admin creates cards |
| `/api/cards` | GET | ✅ | ✅ | Returns own cards only |
| `/api/cards/{id}` | GET | Own only | ✅ | View specific card |
| `/api/cards/{id}` | PUT | ❌ | ✅ | Admin updates cards |
| `/api/cards/{id}` | DELETE | ❌ | ✅ | Admin deletes cards |
| `/api/cards/{cardId}/punches` | POST | ❌ | ✅ | Admin adds punches |
| `/api/cards/{cardId}/punches` | GET | Own only | ✅ | View card punches |

### Owner-Based Access Control

Some endpoints allow access only to the resource owner (or admins). This is enforced using `@PreAuthorize` annotations with custom security services.

**User Operations (via `UserSecurityService`):**
- `PUT /api/users/{id}` - Owner or admin can update
- `DELETE /api/users/{id}` - Owner or admin can delete

**Punch Card Operations (via `CardSecurityService`):**
- `GET /api/cards/{id}` - Owner or admin can view
- `GET /api/cards/{cardId}/punches` - Owner or admin can view punches

**How Ownership is Verified:**
1. The authenticated user's ID is extracted from the JWT token (stored in `UserPrincipal`)
2. For users: The resource ID is compared to the authenticated user's ID
3. For cards: The card's `ownerId` is compared to the authenticated user's ID
4. If they don't match and the user is not an ADMIN, a `403 Forbidden` response is returned

### Security Services

The application uses two security services for authorization checks in `@PreAuthorize` annotations:

#### UserSecurityService

Handles user ownership verification.

```java
@Service("userSecurityService")
public class UserSecurityService {
    /**
     * Checks if the authenticated user owns the resource with the given ID.
     */
    public boolean isOwner(UUID resourceId, Authentication authentication) {
        // Returns true if resourceId matches the authenticated user's ID
    }
}
```

**Usage in Controllers:**
```java
@PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN') or @userSecurityService.isOwner(#id, authentication)")
public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, ...) {
    // Only owner or admin can update
}
```

#### CardSecurityService

Handles punch card ownership verification.

```java
@Service("cardSecurityService")
public class CardSecurityService {
    /**
     * Checks if the authenticated user owns the punch card.
     */
    public boolean isCardOwner(UUID cardId, Authentication authentication) {
        // Queries database to check if card.ownerId matches authenticated user's ID
    }

    /**
     * Checks if the authenticated user has ADMIN role.
     */
    public boolean isAdmin(Authentication authentication) {
        // Returns true if user has ADMIN role
    }

    /**
     * Checks if the authenticated user is admin OR owns the card.
     */
    public boolean isAdminOrCardOwner(UUID cardId, Authentication authentication) {
        return isAdmin(authentication) || isCardOwner(cardId, authentication);
    }
}
```

**Usage in Controllers:**
```java
@GetMapping("/{id}")
@PreAuthorize("@cardSecurityService.isAdminOrCardOwner(#id, authentication)")
public ResponseEntity<PunchCardResponse> getCardById(@PathVariable UUID id) {
    // Only owner or admin can view
}
```

**Error Response for Unauthorized Access:**

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

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
2. **No Token Revocation:** Tokens cannot be invalidated before expiration (logout is client-side only)
3. **No Rate Limiting:** Login endpoint is not rate-limited (may be added in future)
4. **Stateless Only:** No server-side session management
5. **No Password Reset:** No email-based password reset functionality
6. **Single Role per User:** Users can only have one role (USER or ADMIN)

## Technical Details

### JWT Library

The application uses **JJWT (Java JWT)** for token handling:
- Algorithm: HMAC-SHA256 (HS256)
- Minimum secret length: 32 characters
- Token parsing uses `Jwts.parser().verifyWith(secretKey)`

### Password Encoding

Passwords are hashed using **BCrypt** via Spring Security's `BCryptPasswordEncoder`:
- Work factor: Default (10)
- Salt: Automatically generated per password

### Method Security

The application uses Spring Security's method-level security with `@EnableMethodSecurity`:
- `@PreAuthorize` annotations on controller methods
- SpEL expressions for complex authorization logic
- Custom security services referenced via `@serviceName.method()` syntax

## Related Documentation

- [API.md](API.md) - Complete API reference
- [TESTING.md](TESTING.md) - Testing documentation
- [README.md](../README.md) - Project overview and setup

