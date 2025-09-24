# PunchCard
It's easier than making bread; Get someone to punch in every time you give them a gift

## Project Structure
```
PunchCard/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   ├── handlers/          # HTTP handlers
│   ├── models/           # Data models
│   ├── database/         # Database connection and migrations
│   ├── middleware/       # Custom middleware
│   └── static/           # React build files (served statically)
├── frontend/             # React application
└── database/             # SQLite database file
```

## Backend Setup

### Prerequisites
- Go 1.24.0 or later
- Git

### Installation & Running

#### Quick Start (Recommended)
```bash
cd backend
./run
```

#### Manual Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   go mod tidy
   ```

3. Build the application:
   ```bash
   go build -o punchcard-backend .
   ```

4. Run the server:
   ```bash
   ./punchcard-backend
   ```

#### Cross-Platform Support
- **Linux/macOS**: Use `./run`
- **Windows**: Use `run.bat`

The server will start on port 8080 by default. You can set the `PORT` environment variable to use a different port:
```bash
PORT=8081 ./run
```

### API Endpoints

#### Health Check
- `GET /health` - Check if the API is running

#### Users
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Authentication
- `POST /api/auth/login` - User login

### Key Dependencies
- [Gin](https://github.com/gin-gonic/gin) - Web framework
- [SQLx](https://github.com/jmoiron/sqlx) - SQL extensions
- [SQLite3](https://github.com/mattn/go-sqlite3) - SQLite driver
- [Argon2](https://golang.org/x/crypto/argon2) - Password hashing
- [CORS](https://github.com/gin-contrib/cors) - CORS middleware

### Features
- User management with secure password hashing
- SQLite database with automatic migrations
- RESTful API endpoints
- CORS support for frontend integration
- Automatic timestamp tracking (created_at, updated_at)
