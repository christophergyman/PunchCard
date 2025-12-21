# PunchCard

A social media clone backend API built with Spring Boot 4.0.

## Prerequisites

- **Java 21** - Required for Spring Boot 4.0
- **Gradle** - Included via wrapper (`./gradlew`)
- **Docker** - Required for PostgreSQL database

### Installing Java 21 (macOS)

```bash
brew install openjdk@21
```

Add to your `~/.zshrc`:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

Then reload: `source ~/.zshrc`

## Quick Start

1. Start the PostgreSQL database:

```bash
docker-compose up -d
```

2. Run the application:

```bash
./gradlew bootRun
```

The server starts at `http://localhost:8080`

## API Endpoints

### Hello Endpoint

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/hello` | Returns "Hello World" | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users` | Create a new user | No |
| GET | `/api/users` | Get all users (paginated) | No |
| GET | `/api/users/{id}` | Get user by ID | No |
| PUT | `/api/users/{id}` | Update user | No |
| DELETE | `/api/users/{id}` | Delete user | No |

### Examples

**Create User:**
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com"
  }'
```

**Get All Users (with pagination):**
```bash
curl "http://localhost:8080/api/users?page=0&size=20"
```

**Get User by ID:**
```bash
curl http://localhost:8080/api/users/{user-id}
```

**Update User:**
```bash
curl -X PUT http://localhost:8080/api/users/{user-id} \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername"
  }'
```

**Delete User:**
```bash
curl -X DELETE http://localhost:8080/api/users/{user-id}
```

## Running Tests

```bash
./gradlew test
```

## Database

### PostgreSQL (Production/Development)

Start the database with Docker:

```bash
docker-compose up -d
```

Connection details:
- Host: `localhost:5432`
- Database: `punchcard`
- Username: `punchcard`
- Password: `punchcard`

### Environment Variables

You can override database settings with environment variables:

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/punchcard
export DATABASE_USER=punchcard
export DATABASE_PASSWORD=punchcard
```

## Development

### Useful Commands

```bash
# Start PostgreSQL database
docker-compose up -d

# Stop PostgreSQL database
docker-compose down

# Run the application
./gradlew bootRun

# Run tests
./gradlew test

# Build JAR file
./gradlew build

# Clean build artifacts
./gradlew clean
```

## Tech Stack

- Spring Boot 4.0.1
- Spring Security
- Spring Data JPA
- PostgreSQL
- Lombok
- Docker Compose

## License

See [LICENSE](LICENSE) for details.
