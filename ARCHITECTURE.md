# PunchCard Architecture

High-level overview of how the backend and frontend work together in the PunchCard loyalty system.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Entity Model](#entity-model)
- [Authentication Flow](#authentication-flow)
- [Data Flow Examples](#data-flow-examples)
  - [Creating a Punch Card](#creating-a-punch-card)
  - [Punching a Card](#punching-a-card)
- [API Communication](#api-communication)
- [Security Model](#security-model)
- [Development Setup](#development-setup)
- [Related Documentation](#related-documentation)

---

## Overview

PunchCard is a full-stack punch card loyalty system featuring:

- **Backend**: Spring Boot 4.0 REST API with JWT authentication
- **Frontend**: React + TypeScript SPA with Three.js for 3D card visualization
- **Database**: PostgreSQL (production) / H2 (development)

The application allows users to create virtual punch cards, customize their appearance, and track punches toward rewards.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     React Application                                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐   │  │
│  │  │   Zustand   │  │   React     │  │        Three.js             │   │  │
│  │  │  Auth Store │  │   Query     │  │  (3D Card Visualization)    │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                              Port 5173                                       │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                          HTTP + JWT Token
                        (Authorization: Bearer)
                                     │
                          ┌──────────┴──────────┐
                          │   Vite Dev Proxy    │
                          │  /api -> :8080/api  │
                          └──────────┬──────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                              Port 8080                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Spring Boot Backend                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐   │  │
│  │  │   Security  │  │    REST     │  │         Services            │   │  │
│  │  │   Filter    │──│ Controllers │──│  (Auth, Card, Punch)        │   │  │
│  │  │   (JWT)     │  │             │  │                             │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘   │  │
│  │                                              │                        │  │
│  │                                    ┌─────────┴─────────┐              │  │
│  │                                    │   Repositories    │              │  │
│  │                                    │    (Spring JPA)   │              │  │
│  │                                    └─────────┬─────────┘              │  │
│  └──────────────────────────────────────────────┼────────────────────────┘  │
│                                                 │                            │
└─────────────────────────────────────────────────┼────────────────────────────┘
                                                  │
                                        ┌─────────┴─────────┐
                                        │    Database       │
                                        │  PostgreSQL (prod)│
                                        │     H2 (dev)      │
                                        │    Port 5432      │
                                        └───────────────────┘
```

---

## Entity Model

```
┌─────────────────────┐
│        User         │
├─────────────────────┤
│ id: UUID            │
│ username: String    │
│ password: String    │
│ email: String       │
│ role: Role          │
│ createdAt: Instant  │
│ updatedAt: Instant  │
└─────────┬───────────┘
          │
          │ (1) owns (*)
          │
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│     PunchCard       │       │     CardStyle       │
├─────────────────────┤       │    (Embedded)       │
│ id: UUID            │       ├─────────────────────┤
│ owner: User         │◄──────│ backgroundColor     │
│ title: String       │       │ textColor           │
│ description: String │       │ texture             │
│ totalSlots: int     │       │ punchShape          │
│ reward: String      │       └─────────────────────┘
│ cardStyle: CardStyle│
│ punches: List<Punch>│
│ createdAt: Instant  │
│ updatedAt: Instant  │
└─────────┬───────────┘
          │
          │ (1) has (*)
          │
          ▼
┌─────────────────────┐
│       Punch         │
├─────────────────────┤
│ id: UUID            │
│ card: PunchCard     │
│ punchedBy: User     │
│ position: int       │
│ punchedAt: Instant  │
└─────────────────────┘
```

**Relationships:**
- One User can own many PunchCards
- One PunchCard contains many Punches
- CardStyle is embedded within PunchCard (not a separate table)

---

## Authentication Flow

```
┌──────────┐                           ┌──────────┐                    ┌──────────┐
│  Client  │                           │   API    │                    │ Database │
└────┬─────┘                           └────┬─────┘                    └────┬─────┘
     │                                      │                               │
     │  1. POST /api/auth/login             │                               │
     │      {username, password}            │                               │
     │─────────────────────────────────────>│                               │
     │                                      │  2. Validate credentials      │
     │                                      │─────────────────────────────>│
     │                                      │  3. User found                │
     │                                      │<─────────────────────────────│
     │                                      │                               │
     │  4. Response: {token, user}          │                               │
     │<─────────────────────────────────────│                               │
     │                                      │                               │
     │  5. Store token in localStorage      │                               │
     │     (via Zustand persist)            │                               │
     │                                      │                               │
     │  6. GET /api/cards                   │                               │
     │     Authorization: Bearer <token>    │                               │
     │─────────────────────────────────────>│                               │
     │                                      │  7. Validate JWT              │
     │                                      │  8. Extract user from token   │
     │                                      │  9. Query cards               │
     │                                      │─────────────────────────────>│
     │                                      │<─────────────────────────────│
     │  10. Response: [cards]               │                               │
     │<─────────────────────────────────────│                               │
     │                                      │                               │
     │  --- Token Expired/Invalid ---       │                               │
     │                                      │                               │
     │  11. Any request with bad token      │                               │
     │─────────────────────────────────────>│                               │
     │  12. 401 Unauthorized                │                               │
     │<─────────────────────────────────────│                               │
     │                                      │                               │
     │  13. Axios interceptor catches 401   │                               │
     │      -> Calls logout()               │                               │
     │      -> Clears token & redirects     │                               │
     │                                      │                               │
```

**Key Points:**
- JWT tokens are stored in localStorage via Zustand's persist middleware
- Token is automatically attached to requests via Axios interceptor
- 401 responses trigger automatic logout and redirect to login

---

## Data Flow Examples

### Creating a Punch Card

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  CardForm │         │ useCreate│         │   API    │         │ Database │
│   (UI)   │         │   Card   │         │  Client  │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Submit form     │                    │                    │
     │ {title, totalSlots,│                    │                    │
     │  reward, cardStyle}│                    │                    │
     │───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. POST /api/cards │                    │
     │                    │───────────────────>│                    │
     │                    │                    │                    │
     │                    │                    │ 3. Validate JWT    │
     │                    │                    │ 4. Extract userId  │
     │                    │                    │ 5. INSERT card     │
     │                    │                    │───────────────────>│
     │                    │                    │<───────────────────│
     │                    │                    │                    │
     │                    │ 6. PunchCardResponse                    │
     │                    │<───────────────────│                    │
     │                    │                    │                    │
     │                    │ 7. Invalidate      │                    │
     │                    │    ['cards'] query │                    │
     │                    │                    │                    │
     │ 8. Navigate to     │                    │                    │
     │    dashboard       │                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
```

### Punching a Card

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│PunchCard │         │usePunch  │         │   API    │         │ Database │
│   3D     │         │  Card    │         │  Client  │         │          │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ 1. Click punch slot│                    │                    │
     │    position: 3     │                    │                    │
     │───────────────────>│                    │                    │
     │                    │                    │                    │
     │                    │ 2. OPTIMISTIC UPDATE                    │
     │                    │    Cache: currentPunches++              │
     │                    │                    │                    │
     │ 3. UI updates      │                    │                    │
     │    immediately     │                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
     │                    │ 4. POST /cards/{id}/punches             │
     │                    │    {position: 3}   │                    │
     │                    │───────────────────>│                    │
     │                    │                    │ 5. Validate owner  │
     │                    │                    │ 6. Check position  │
     │                    │                    │ 7. INSERT punch    │
     │                    │                    │───────────────────>│
     │                    │                    │<───────────────────│
     │                    │                    │                    │
     │                    │ 8. PunchResponse   │                    │
     │                    │<───────────────────│                    │
     │                    │                    │                    │
     │                    │ 9. onSettled:      │                    │
     │                    │    Invalidate query│                    │
     │                    │    (sync with server)                   │
     │                    │                    │                    │
     │                    │ --- ON ERROR ---   │                    │
     │                    │                    │                    │
     │                    │ 10. Rollback cache │                    │
     │                    │     to previous    │                    │
     │ 11. UI reverts     │                    │                    │
     │<───────────────────│                    │                    │
     │                    │                    │                    │
```

**Optimistic Updates:**
- UI updates immediately when user clicks a punch slot
- Server request happens in background
- On error, UI automatically rolls back to previous state
- On success, query invalidation syncs with server data

---

## API Communication

### REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login, get JWT | Public |
| GET | `/api/cards` | List user's cards | Required |
| POST | `/api/cards` | Create new card | Required |
| GET | `/api/cards/{id}` | Get card by ID | Required |
| PUT | `/api/cards/{id}` | Update card | Owner |
| DELETE | `/api/cards/{id}` | Delete card | Owner |
| POST | `/api/cards/{id}/punches` | Add punch | Owner |
| GET | `/api/cards/{id}/punches` | List punches | Required |

### Vite Proxy (Development)

The frontend dev server proxies API requests to avoid CORS issues:

```typescript
// vite.config.ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
}
```

### CORS Configuration (Production)

Spring Security configures CORS for frontend origins:

```java
// SecurityConfig.java
configuration.setAllowedOrigins(List.of(
    "http://localhost:5173",
    "http://127.0.0.1:5173"
));
configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
configuration.setAllowCredentials(true);
```

---

## Security Model

### JWT Authentication

- **Token Generation**: On login, server generates JWT with user ID, username, and role
- **Token Expiration**: 8 hours
- **Token Storage**: localStorage (via Zustand persist middleware)
- **Token Transmission**: `Authorization: Bearer <token>` header

### CardSecurityService

Owner-only operations are protected via `@PreAuthorize` annotations:

```java
@Service("cardSecurityService")
public class CardSecurityService {

    public boolean isCardOwner(UUID cardId, Authentication authentication) {
        // Verifies the authenticated user owns the specified card
        return punchCardRepository.existsByIdAndOwnerId(cardId, userId);
    }
}
```

### @PreAuthorize Annotations

```java
// Any authenticated user can create cards
@PostMapping
@PreAuthorize("isAuthenticated()")
public ResponseEntity<PunchCardResponse> createCard(...) { }

// Only card owner can update
@PutMapping("/{id}")
@PreAuthorize("@cardSecurityService.isCardOwner(#id, authentication)")
public ResponseEntity<PunchCardResponse> updateCard(...) { }

// Only card owner can delete
@DeleteMapping("/{id}")
@PreAuthorize("@cardSecurityService.isCardOwner(#id, authentication)")
public ResponseEntity<Void> deleteCard(...) { }
```

### Public vs Protected Endpoints

```java
.authorizeHttpRequests(auth -> auth
    // Public endpoints
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/hello").permitAll()
    .requestMatchers("/h2-console/**").permitAll()
    // All other requests require authentication
    .anyRequest().authenticated()
)
```

---

## Development Setup

### Quick Start (Both Servers)

```bash
./run.sh
```

This script:
1. Runs backend tests
2. Installs frontend dependencies
3. Starts backend on port 8080 (H2 dev profile)
4. Starts frontend on port 5173
5. Opens browser to http://localhost:5173

### Individual Commands

**Backend only:**
```bash
# Set JWT secret (required)
export JWT_SECRET="your-secret-key-at-least-32-characters-long"

# Start with PostgreSQL (requires Docker)
docker-compose up -d
./gradlew bootRun

# Or start with H2 (no Docker needed)
./gradlew bootRun --args='--spring.profiles.active=dev'
```

**Frontend only:**
```bash
cd frontend
npm install  # or: bun install
npm run dev  # or: bun run dev
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| H2 Console (dev) | http://localhost:8080/h2-console |

---

## Related Documentation

- **[docs/API.md](docs/API.md)** - Complete API reference with all endpoints, request/response schemas, and examples
- **[docs/AUTHENTICATION.md](docs/AUTHENTICATION.md)** - JWT authentication guide, token usage, roles, and troubleshooting
- **[docs/TESTING.md](docs/TESTING.md)** - Testing documentation, test structure, and best practices
