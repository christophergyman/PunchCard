# PunchCard API Reference

Complete API reference for the PunchCard backend.

---

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
    - [Register User](#register-user)
    - [Login](#login)
    - [Get Current User](#get-current-user)
  - [User Endpoints](#user-endpoints)
    - [Create User (Admin Only)](#create-user-admin-only)
    - [List Users](#list-users)
    - [Get User by ID](#get-user-by-id)
    - [Update User](#update-user)
    - [Delete User](#delete-user)
    - [Promote User to Admin](#promote-user-to-admin)
  - [Punch Card Endpoints](#punch-card-endpoints)
    - [Create Punch Card (Admin Only)](#create-punch-card-admin-only)
    - [List User's Cards](#list-users-cards)
    - [Get Card by ID](#get-card-by-id)
    - [Update Card (Admin Only)](#update-card-admin-only)
    - [Delete Card (Admin Only)](#delete-card-admin-only)
  - [Punch Endpoints](#punch-endpoints)
    - [Add Punch (Admin Only)](#add-punch-admin-only)
    - [List Punches](#list-punches)
  - [Hello Endpoint](#hello-endpoint)
- [Data Types](#data-types)
- [Error Responses](#error-responses)
  - [Status Codes](#status-codes)
  - [Common Error Scenarios](#common-error-scenarios)
  - [Punch Card Error Scenarios](#punch-card-error-scenarios)
- [Pagination](#pagination)
- [Rate Limiting](#rate-limiting)
- [Related Documentation](#related-documentation)

---

## Base URL

```
http://localhost:8080
```

All endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication via JWT tokens. See [AUTHENTICATION.md](AUTHENTICATION.md) for complete authentication details.

**Quick Start:**
1. Register a user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` (returns JWT token)
3. Include token in requests: `Authorization: Bearer <token>`

**Roles:**
- `USER` - Default role for registered users. Can view their own cards and punches.
- `ADMIN` - Administrative role. Can create/update/delete cards and punches for any user, promote users.

---

## Endpoints

### Authentication Endpoints

#### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required (public)

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123",
  "email": "john@example.com"
}
```

**Validation Rules:**
- `username`: Required, 3-50 characters
- `password`: Required, 8-100 characters
- `email`: Required, valid email format

**Response:** `201 Created`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `409 Conflict` - Username or email already exists

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'securepass123',
    email: 'john@example.com'
  })
});

const user = await response.json();
```

---

#### Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required (public)

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Validation Rules:**
- `username`: Required
- `password`: Required

**Response:** `200 OK`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-12-22T10:30:00Z",
    "updatedAt": "2024-12-22T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Invalid username or password

**Example:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'johndoe',
    password: 'securepass123'
  })
});

const auth = await response.json();
const token = auth.token; // Store this for authenticated requests
```

---

#### Get Current User

Get the currently authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required (any authenticated user)

**Response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated or invalid token

**Example:**
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8080/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const currentUser = await response.json();
```

---

### User Endpoints

#### Create User (Admin Only)

Create a new user account. Admin-only endpoint. Regular users should use `/api/auth/register`.

**Endpoint:** `POST /api/users`

**Authentication:** Required (ADMIN role)

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepass123",
  "email": "newuser@example.com"
}
```

**Validation Rules:**
- `username`: Required, 3-50 characters
- `password`: Required, 8-100 characters
- `email`: Required, valid email format

**Response:** `201 Created`

```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "username": "newuser",
  "email": "newuser@example.com",
  "role": "USER",
  "createdAt": "2024-12-22T10:35:00Z",
  "updatedAt": "2024-12-22T10:35:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `409 Conflict` - Username or email already exists

**Example:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "username": "newuser",
    "password": "securepass123",
    "email": "newuser@example.com"
  }'
```

---

#### List Users

Get a paginated list of all users.

**Endpoint:** `GET /api/users`

**Authentication:** Required (any authenticated user)

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T10:30:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "username": "janedoe",
      "email": "jane@example.com",
      "role": "ADMIN",
      "createdAt": "2024-12-22T10:31:00Z",
      "updatedAt": "2024-12-22T10:31:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 2,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 2
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl "http://localhost:8080/api/users?page=0&size=20" \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8080/api/users?page=0&size=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const page = await response.json();
console.log(`Total users: ${page.totalElements}`);
```

---

#### Get User by ID

Get a specific user by their ID.

**Endpoint:** `GET /api/users/{id}`

**Authentication:** Required (any authenticated user)

**Path Parameters:**
- `id` (UUID): User ID

**Response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found

**Example:**
```bash
curl "http://localhost:8080/api/users/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const user = await response.json();
```

---

#### Update User

Update a user's information. Only the user themselves or an admin can update.

**Endpoint:** `PUT /api/users/{id}`

**Authentication:** Required (owner or ADMIN role)

**Path Parameters:**
- `id` (UUID): User ID

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "password": "newpassword123"
}
```

All fields are optional. Only include fields you want to update.

**Validation Rules:**
- `username`: Optional, 3-50 characters (if provided)
- `password`: Optional, 8-100 characters (if provided)
- `email`: Optional, valid email format (if provided)

**Response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "USER",
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T11:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the owner and not an admin
- `404 Not Found` - User not found
- `409 Conflict` - Username or email already exists

**Example:**
```bash
curl -X PUT http://localhost:8080/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "username": "newusername"
  }'
```

**JavaScript Example:**
```javascript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    username: 'newusername'
  })
});

const updatedUser = await response.json();
```

---

#### Delete User

Delete a user account. Only the user themselves or an admin can delete.

**Endpoint:** `DELETE /api/users/{id}`

**Authentication:** Required (owner or ADMIN role)

**Path Parameters:**
- `id` (UUID): User ID

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the owner and not an admin
- `404 Not Found` - User not found

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.status === 204) {
  console.log('User deleted successfully');
}
```

---

#### Promote User to Admin

Promote a user to the ADMIN role. Only admins can perform this action.

**Endpoint:** `POST /api/users/{id}/promote`

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `id` (UUID): User ID to promote

**Response:** `200 OK`

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "ADMIN",
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T11:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - User not found

**Example:**
```bash
curl -X POST http://localhost:8080/api/users/123e4567-e89b-12d3-a456-426614174000/promote \
  -H "Authorization: Bearer <admin-token>"
```

**JavaScript Example:**
```javascript
const userId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(`http://localhost:8080/api/users/${userId}/promote`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const promotedUser = await response.json();
console.log(`User ${promotedUser.username} is now an ${promotedUser.role}`);
```

---

### Punch Card Endpoints

#### Create Punch Card (Admin Only)

Create a new punch card. Admin can optionally specify a target user via `ownerId`, otherwise the card is created for the admin.

**Endpoint:** `POST /api/cards`

**Authentication:** Required (ADMIN role)

**Request Body:**
```json
{
  "title": "Coffee Rewards",
  "description": "Buy 10 coffees, get one free!",
  "totalSlots": 10,
  "reward": "Free Coffee",
  "cardStyle": {
    "backgroundColor": "#8B4513",
    "textColor": "#FFFFFF",
    "texture": null,
    "punchShape": "CIRCLE"
  },
  "ownerId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Validation Rules:**
- `title`: Required, max 100 characters
- `description`: Optional, max 500 characters
- `totalSlots`: Required, 1-20
- `reward`: Required, max 255 characters
- `cardStyle`: Optional (defaults applied if not provided)
- `cardStyle.backgroundColor`: Optional, valid hex color (e.g., `#FF5733`)
- `cardStyle.textColor`: Optional, valid hex color (e.g., `#000000`)
- `cardStyle.texture`: Optional, string
- `cardStyle.punchShape`: Optional, one of `CIRCLE`, `STAR`, `HEART`, `CUSTOM`
- `ownerId`: Optional, UUID of the target user (defaults to admin's ID)

**Response:** `201 Created`

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "ownerId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Coffee Rewards",
  "description": "Buy 10 coffees, get one free!",
  "totalSlots": 10,
  "currentPunches": 0,
  "reward": "Free Coffee",
  "cardStyle": {
    "backgroundColor": "#8B4513",
    "textColor": "#FFFFFF",
    "texture": null,
    "punchShape": "CIRCLE"
  },
  "punches": [],
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin

**Example:**
```bash
curl -X POST http://localhost:8080/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "title": "Coffee Rewards",
    "description": "Buy 10 coffees, get one free!",
    "totalSlots": 10,
    "reward": "Free Coffee",
    "cardStyle": {
      "backgroundColor": "#8B4513",
      "textColor": "#FFFFFF",
      "punchShape": "CIRCLE"
    },
    "ownerId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8080/api/cards', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    title: 'Coffee Rewards',
    description: 'Buy 10 coffees, get one free!',
    totalSlots: 10,
    reward: 'Free Coffee',
    cardStyle: {
      backgroundColor: '#8B4513',
      textColor: '#FFFFFF',
      punchShape: 'CIRCLE'
    },
    ownerId: '123e4567-e89b-12d3-a456-426614174000'
  })
});

const card = await response.json();
```

---

#### List User's Cards

Get a paginated list of the authenticated user's punch cards.

**Endpoint:** `GET /api/cards`

**Authentication:** Required (any authenticated user)

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20)

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174001",
      "ownerId": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Coffee Rewards",
      "description": "Buy 10 coffees, get one free!",
      "totalSlots": 10,
      "currentPunches": 5,
      "reward": "Free Coffee",
      "cardStyle": {
        "backgroundColor": "#8B4513",
        "textColor": "#FFFFFF",
        "texture": null,
        "punchShape": "CIRCLE"
      },
      "punches": [
        {
          "id": "789e0123-e89b-12d3-a456-426614174002",
          "cardId": "456e7890-e89b-12d3-a456-426614174001",
          "punchedBy": "223e4567-e89b-12d3-a456-426614174001",
          "position": 1,
          "punchedAt": "2024-12-22T11:00:00Z"
        }
      ],
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T11:00:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated

**Example:**
```bash
curl "http://localhost:8080/api/cards?page=0&size=20" \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8080/api/cards?page=0&size=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const page = await response.json();
console.log(`Total cards: ${page.totalElements}`);
```

---

#### Get Card by ID

Get a specific punch card by its ID.

**Endpoint:** `GET /api/cards/{id}`

**Authentication:** Required (card owner or ADMIN role)

**Path Parameters:**
- `id` (UUID): Punch card ID

**Response:** `200 OK`

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "ownerId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Coffee Rewards",
  "description": "Buy 10 coffees, get one free!",
  "totalSlots": 10,
  "currentPunches": 5,
  "reward": "Free Coffee",
  "cardStyle": {
    "backgroundColor": "#8B4513",
    "textColor": "#FFFFFF",
    "texture": null,
    "punchShape": "CIRCLE"
  },
  "punches": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174002",
      "cardId": "456e7890-e89b-12d3-a456-426614174001",
      "punchedBy": "223e4567-e89b-12d3-a456-426614174001",
      "position": 1,
      "punchedAt": "2024-12-22T11:00:00Z"
    }
  ],
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T11:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the card owner and not an admin
- `404 Not Found` - Punch card not found

**Example:**
```bash
curl "http://localhost:8080/api/cards/456e7890-e89b-12d3-a456-426614174001" \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const cardId = '456e7890-e89b-12d3-a456-426614174001';
const response = await fetch(`http://localhost:8080/api/cards/${cardId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const card = await response.json();
```

---

#### Update Card (Admin Only)

Update a punch card's information. Only admins can update cards.

**Endpoint:** `PUT /api/cards/{id}`

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `id` (UUID): Punch card ID

**Request Body:**
```json
{
  "title": "Updated Coffee Rewards",
  "description": "Buy 10 coffees, get two free!",
  "reward": "Two Free Coffees",
  "cardStyle": {
    "backgroundColor": "#654321",
    "textColor": "#FFFFFF",
    "punchShape": "STAR"
  }
}
```

All fields are optional. Only include fields you want to update. Note: `totalSlots` cannot be changed after creation.

**Validation Rules:**
- `title`: Optional, max 100 characters (if provided)
- `description`: Optional, max 500 characters (if provided)
- `reward`: Optional, max 255 characters (if provided)
- `cardStyle`: Optional (if provided)

**Response:** `200 OK`

```json
{
  "id": "456e7890-e89b-12d3-a456-426614174001",
  "ownerId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Updated Coffee Rewards",
  "description": "Buy 10 coffees, get two free!",
  "totalSlots": 10,
  "currentPunches": 5,
  "reward": "Two Free Coffees",
  "cardStyle": {
    "backgroundColor": "#654321",
    "textColor": "#FFFFFF",
    "texture": null,
    "punchShape": "STAR"
  },
  "punches": [],
  "createdAt": "2024-12-22T10:30:00Z",
  "updatedAt": "2024-12-22T12:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Punch card not found

**Example:**
```bash
curl -X PUT http://localhost:8080/api/cards/456e7890-e89b-12d3-a456-426614174001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "title": "Updated Coffee Rewards"
  }'
```

**JavaScript Example:**
```javascript
const cardId = '456e7890-e89b-12d3-a456-426614174001';
const response = await fetch(`http://localhost:8080/api/cards/${cardId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    title: 'Updated Coffee Rewards'
  })
});

const updatedCard = await response.json();
```

---

#### Delete Card (Admin Only)

Delete a punch card. Only admins can delete cards.

**Endpoint:** `DELETE /api/cards/{id}`

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `id` (UUID): Punch card ID

**Response:** `204 No Content`

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Punch card not found

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/cards/456e7890-e89b-12d3-a456-426614174001 \
  -H "Authorization: Bearer <admin-token>"
```

**JavaScript Example:**
```javascript
const cardId = '456e7890-e89b-12d3-a456-426614174001';
const response = await fetch(`http://localhost:8080/api/cards/${cardId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

if (response.status === 204) {
  console.log('Card deleted successfully');
}
```

---

### Punch Endpoints

#### Add Punch (Admin Only)

Add a punch to a punch card. Only admins can add punches.

**Endpoint:** `POST /api/cards/{cardId}/punches`

**Authentication:** Required (ADMIN role)

**Path Parameters:**
- `cardId` (UUID): Punch card ID

**Request Body:**
```json
{
  "position": 1
}
```

**Validation Rules:**
- `position`: Required, must be at least 1 and at most the card's `totalSlots`, must not already be punched

**Response:** `201 Created`

```json
{
  "id": "789e0123-e89b-12d3-a456-426614174002",
  "cardId": "456e7890-e89b-12d3-a456-426614174001",
  "punchedBy": "223e4567-e89b-12d3-a456-426614174001",
  "position": 1,
  "punchedAt": "2024-12-22T11:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Validation errors or invalid punch position
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not an admin
- `404 Not Found` - Punch card not found
- `409 Conflict` - Position already punched (duplicate punch)

**Example:**
```bash
curl -X POST http://localhost:8080/api/cards/456e7890-e89b-12d3-a456-426614174001/punches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "position": 1
  }'
```

**JavaScript Example:**
```javascript
const cardId = '456e7890-e89b-12d3-a456-426614174001';
const response = await fetch(`http://localhost:8080/api/cards/${cardId}/punches`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    position: 1
  })
});

const punch = await response.json();
```

---

#### List Punches

Get all punches for a punch card.

**Endpoint:** `GET /api/cards/{cardId}/punches`

**Authentication:** Required (card owner or ADMIN role)

**Path Parameters:**
- `cardId` (UUID): Punch card ID

**Response:** `200 OK`

```json
[
  {
    "id": "789e0123-e89b-12d3-a456-426614174002",
    "cardId": "456e7890-e89b-12d3-a456-426614174001",
    "punchedBy": "223e4567-e89b-12d3-a456-426614174001",
    "position": 1,
    "punchedAt": "2024-12-22T11:00:00Z"
  },
  {
    "id": "789e0123-e89b-12d3-a456-426614174003",
    "cardId": "456e7890-e89b-12d3-a456-426614174001",
    "punchedBy": "223e4567-e89b-12d3-a456-426614174001",
    "position": 2,
    "punchedAt": "2024-12-22T15:00:00Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not the card owner and not an admin
- `404 Not Found` - Punch card not found

**Example:**
```bash
curl "http://localhost:8080/api/cards/456e7890-e89b-12d3-a456-426614174001/punches" \
  -H "Authorization: Bearer <token>"
```

**JavaScript Example:**
```javascript
const cardId = '456e7890-e89b-12d3-a456-426614174001';
const response = await fetch(`http://localhost:8080/api/cards/${cardId}/punches`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const punches = await response.json();
console.log(`Total punches: ${punches.length}`);
```

---

### Hello Endpoint

#### Health Check

Simple endpoint to verify the API is running.

**Endpoint:** `GET /api/hello`

**Authentication:** Not required (public)

**Response:** `200 OK`

```
Hello World
```

**Example:**
```bash
curl http://localhost:8080/api/hello
```

---

## Data Types

### UUID

All IDs (users, cards, punches) are UUIDs (Universally Unique Identifiers) in the format:
```
123e4567-e89b-12d3-a456-426614174000
```

### Timestamp

All timestamps are in ISO 8601 format (UTC):
```
2024-12-22T10:30:00Z
```

### Pagination

Paginated responses follow Spring Data's `Page` format:
- `content`: Array of items
- `totalElements`: Total number of items
- `totalPages`: Total number of pages
- `pageNumber`: Current page (0-indexed)
- `pageSize`: Items per page
- `first`: Whether this is the first page
- `last`: Whether this is the last page

### UserResponse

Response object for user operations:

```json
{
  "id": "UUID",
  "username": "string",
  "email": "string",
  "role": "USER | ADMIN",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### PunchCardResponse

Response object for punch card operations:

```json
{
  "id": "UUID",
  "ownerId": "UUID",
  "title": "string",
  "description": "string | null",
  "totalSlots": "number (1-20)",
  "currentPunches": "number",
  "reward": "string",
  "cardStyle": "CardStyleDto",
  "punches": "PunchResponse[]",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### PunchResponse

Response object for punch operations:

```json
{
  "id": "UUID",
  "cardId": "UUID",
  "punchedBy": "UUID",
  "position": "number (1-totalSlots)",
  "punchedAt": "timestamp"
}
```

### CardStyleDto

Style configuration for punch cards:

```json
{
  "backgroundColor": "string (hex color, e.g., '#8B4513')",
  "textColor": "string (hex color, e.g., '#FFFFFF')",
  "texture": "string | null",
  "punchShape": "PunchShape enum"
}
```

### PunchShape Enum

Available shapes for punch indicators:

| Value | Description |
|-------|-------------|
| `CIRCLE` | Circular punch marker (default) |
| `STAR` | Star-shaped punch marker |
| `HEART` | Heart-shaped punch marker |
| `CUSTOM` | Custom punch marker |

### Role Enum

User roles for authorization:

| Value | Description |
|-------|-------------|
| `USER` | Default role for registered users |
| `ADMIN` | Administrative role with elevated permissions |

---

## Error Responses

All error responses follow this format:

```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid request parameters",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": {
    "username": "Username must be 3-50 characters",
    "email": "Must be a valid email address"
  }
}
```

### Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no response body |
| 400 | Bad Request | Validation errors or malformed request |
| 401 | Unauthorized | Authentication required or invalid credentials |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (duplicate username/email/punch position) |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

#### Validation Errors (400)

When request validation fails:

```json
{
  "status": 400,
  "error": "Validation Failed",
  "message": "Invalid request parameters",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": {
    "username": "Username must be 3-50 characters",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Unauthorized (401)

When authentication is required but missing or invalid:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid username or password",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### Forbidden (403)

When authenticated but lacking permissions:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "You do not have permission to perform this action",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### Not Found (404)

When a resource doesn't exist:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### Conflict (409)

When trying to create a duplicate resource:

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "User with username 'johndoe' already exists",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

### Punch Card Error Scenarios

#### PunchCardNotFoundException (404)

When a punch card doesn't exist:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Punch card not found with id: 456e7890-e89b-12d3-a456-426614174001",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### CardFullException (400)

When trying to add a punch to a card that is already complete:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Punch card is already complete (10/10 punches)",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### DuplicatePunchException (409)

When trying to punch a position that has already been punched:

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Position 5 has already been punched on this card",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

#### InvalidPunchPositionException (400)

When trying to punch an invalid position (out of range):

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid punch position: 15. Must be between 1 and 10",
  "timestamp": "2024-12-22T10:30:00Z",
  "errors": null
}
```

---

## Pagination

List endpoints support pagination via query parameters:

- `page`: Page number (0-indexed, default: 0)
- `size`: Items per page (default: 20)

**Example:**
```
GET /api/users?page=1&size=10
```

This returns the second page with 10 items per page.

---

## Rate Limiting

Currently, the API does not implement rate limiting. This is a known limitation and may be added in future versions.

---

## Related Documentation

- [AUTHENTICATION.md](AUTHENTICATION.md) - Complete authentication guide
- [TESTING.md](TESTING.md) - Testing documentation
- [README.md](../README.md) - Project overview and setup
