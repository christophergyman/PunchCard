# PunchCard Backend

A Go backend API for the PunchCard application with SQLite database support.

## Features

- User management with username, password, email, and timestamps
- Secure password hashing using Argon2id
- SQLite database with automatic migrations
- RESTful API endpoints
- CORS support for frontend integration

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Authentication
- `POST /api/auth/login` - User login

## User Model

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Running the Server

1. Install dependencies:
   ```bash
   go mod tidy
   ```

2. Build the application:
   ```bash
   go build -o punchcard-backend .
   ```

3. Run the server:
   ```bash
   ./punchcard-backend
   ```

The server will start on port 8080 by default. You can set the `PORT` environment variable to use a different port.

## Environment Variables

- `PORT` - Server port (default: 8080)
- `GIN_MODE` - Gin mode (release/debug, default: release)

## Database

The application uses SQLite and automatically creates the database file at `../../database/punchcard.db`. The database schema is automatically created on startup.

## Dependencies

- [Gin](https://github.com/gin-gonic/gin) - Web framework
- [SQLx](https://github.com/jmoiron/sqlx) - SQL extensions
- [SQLite3](https://github.com/mattn/go-sqlite3) - SQLite driver
- [Argon2](https://golang.org/x/crypto/argon2) - Password hashing
- [CORS](https://github.com/gin-contrib/cors) - CORS middleware
