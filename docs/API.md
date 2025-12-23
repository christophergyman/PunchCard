# PunchCard API Reference

Complete API reference for the PunchCard social media backend.

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
      "createdAt": "2024-12-22T10:30:00Z",
      "updatedAt": "2024-12-22T10:30:00Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "username": "janedoe",
      "email": "jane@example.com",
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

All user IDs are UUIDs (Universally Unique Identifiers) in the format:
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
| 409 | Conflict | Resource already exists (duplicate username/email) |
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

