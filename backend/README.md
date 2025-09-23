# PunchCard Backend

A Go Gin web server with SQLite database for user management.

## Features

- SQLite database integration
- User management with CRUD operations
- RESTful API endpoints
- Input validation
- Structured project layout

## Database Schema

### Users Table
- `id` - Primary key (auto-increment)
- `username` - Unique username
- `password` - User password (hashed in production)
- `first_name` - User's first name
- `last_name` - User's last name
- `email` - Unique email address
- `created_at` - Timestamp when user was created
- `updated_at` - Timestamp when user was last updated

## API Endpoints

### Health Check
- `GET /ping` - Health check endpoint

### User Management
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user by ID
- `DELETE /api/v1/users/:id` - Delete user by ID

## Example Usage

### Create a User
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  }'
```

### Get All Users
```bash
curl http://localhost:8080/api/v1/users
```

### Get User by ID
```bash
curl http://localhost:8080/api/v1/users/1
```

### Update User
```bash
curl -X PUT http://localhost:8080/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "email": "jane.doe@example.com"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:8080/api/v1/users/1
```

## Running the Application

1. Install dependencies:
   ```bash
   go mod tidy
   ```

2. Build the application:
   ```bash
   go build -o punchcard-backend .
   ```

3. Run the application:
   ```bash
   ./punchcard-backend
   ```

The server will start on port 8080 and create a SQLite database file (`punchcard.db`) in the current directory.

## Project Structure

```
backend/
├── main.go                 # Application entry point
├── models/
│   └── user.go            # User model and request structs
├── database/
│   └── database.go        # Database connection and table creation
├── services/
│   └── user_service.go    # Business logic for user operations
├── handlers/
│   └── user_handler.go    # HTTP request handlers
├── go.mod                 # Go module dependencies
├── go.sum                 # Go module checksums
└── README.md              # This file
```

## Security Notes

- Passwords are stored in plain text in this implementation. In production, use proper password hashing (bcrypt, scrypt, etc.)
- Add authentication and authorization middleware
- Implement rate limiting
- Add input sanitization
- Use HTTPS in production
