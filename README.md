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

### Installing Docker (macOS)

**Option 1: Colima (CLI-only, lightweight)**

```bash
brew install colima docker docker-compose
```

**Option 2: Docker Desktop**

```bash
brew install --cask docker
```

### Starting Docker

**With Colima:**

```bash
# Start Docker daemon
colima start

# Stop when done
colima stop
```

**With Docker Desktop:**

Open Docker Desktop from Applications and wait for it to start.

## Quick Start

1. Start Docker (if using Colima: `colima start`)

2. Start the PostgreSQL database:

```bash
docker-compose up -d
```

3. Set the JWT secret (required):

```bash
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

4. Run the application:

```bash
./gradlew bootRun
```

The server starts at `http://localhost:8080`

> **Note:** The application requires `JWT_SECRET` to be set. See [AUTHENTICATION.md](docs/AUTHENTICATION.md) for details.

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[API.md](docs/API.md)** - Complete API reference with all endpoints, request/response schemas, and examples
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - JWT authentication guide, token usage, roles, and troubleshooting
- **[TESTING.md](docs/TESTING.md)** - Testing documentation, test structure, and best practices
- **[SPRING_BOOT_SETUP.md](docs/SPRING_BOOT_SETUP.md)** - Spring Boot setup and dependency reference

## API Endpoints

### Quick Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/hello` | Returns "Hello World" | No |
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| POST | `/api/users` | Create user (admin only) | Yes (ADMIN) |
| GET | `/api/users` | Get all users (paginated) | Yes |
| GET | `/api/users/{id}` | Get user by ID | Yes |
| PUT | `/api/users/{id}` | Update user | Yes (owner or ADMIN) |
| DELETE | `/api/users/{id}` | Delete user | Yes (owner or ADMIN) |

> **Note:** Most endpoints require authentication. See [AUTHENTICATION.md](docs/AUTHENTICATION.md) for details.

### Quick Examples

**Register a user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com"
  }'
```

**Login and get token:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

**Get users (authenticated):**
```bash
curl "http://localhost:8080/api/users?page=0&size=20" \
  -H "Authorization: Bearer <your-token>"
```

For complete API documentation with all endpoints, request/response schemas, and detailed examples, see [API.md](docs/API.md).

## Running Tests

```bash
./gradlew test
```

View test reports at `build/reports/tests/test/index.html`

For detailed testing documentation, see [TESTING.md](docs/TESTING.md).

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

**Required:** You must also set the JWT secret:

```bash
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

The application will fail to start if `JWT_SECRET` is not set. See [AUTHENTICATION.md](docs/AUTHENTICATION.md) for details.

## Development

### Useful Commands

```bash
# Start Docker daemon (Colima)
colima start

# Stop Docker daemon (Colima)
colima stop

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
- Spring Security (JWT authentication)
- Spring Data JPA
- PostgreSQL
- Lombok
- Docker Compose / Colima
- JJWT (JWT library)

## License

See [LICENSE](LICENSE) for details.
