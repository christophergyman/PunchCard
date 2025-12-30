# PunchCard

A full-stack punch card loyalty system that lets users create and manage virtual punch cards with interactive 3D visualization. Built with Spring Boot 4.0 on the backend and React with Three.js on the frontend.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a high-level system overview.

## Features

- **User Authentication** - Secure JWT-based authentication with role-based access control (USER/ADMIN)
- **Punch Card Management** - Create, edit, and delete customizable punch cards
- **Interactive 3D Cards** - Beautiful 3D punch card visualization using Three.js
- **Customizable Styles** - Personalize cards with colors, textures, and punch shapes (circle, star, heart)
- **Progress Tracking** - Track punches toward rewards with visual indicators
- **RESTful API** - Complete REST API with comprehensive documentation
- **Responsive Design** - Modern UI with Tailwind CSS

## Tech Stack

### Backend
- **Spring Boot 4.0.1** - Modern Java framework
- **Spring Security** - JWT authentication and authorization
- **Spring Data JPA** - Database abstraction layer
- **PostgreSQL** - Production database
- **H2** - In-memory database for development
- **Lombok** - Reduces boilerplate code
- **JJWT 0.12.6** - JWT token handling
- **Java 21** - Latest LTS version

### Frontend
- **React 19.2** - UI library
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7.2** - Fast build tool
- **Three.js / React Three Fiber** - 3D visualization
- **React Three Drei** - Three.js helpers
- **Zustand 5.0** - State management
- **TanStack Query 5.90** - Server state management
- **React Router 7.11** - Client-side routing
- **Tailwind CSS 4.1** - Utility-first styling
- **Axios** - HTTP client
- **Framer Motion** - Animations

## Prerequisites

- **Java 21** - Required for Spring Boot 4.0
- **Gradle** - Included via wrapper (`./gradlew`)
- **Bun** or **Node.js** - Required for frontend
- **Docker** - Required for PostgreSQL database (optional with dev profile)

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

### Option 1: One Command (Recommended)

Run both backend and frontend with a single command:

```bash
./run.sh
```

This will:
1. Run backend tests
2. Install frontend dependencies
3. Start backend with H2 dev profile (no PostgreSQL needed)
4. Start frontend dev server

Access the app at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **H2 Console:** http://localhost:8080/h2-console

### Option 2: Manual Setup (with PostgreSQL)

1. Start Docker (if using Colima: `colima start`)

2. Start the PostgreSQL database:

```bash
docker-compose up -d
```

3. Set the JWT secret (required):

```bash
export JWT_SECRET="your-secret-key-at-least-32-characters-long"
```

4. Run the backend:

```bash
./gradlew bootRun
```

5. Run the frontend (in another terminal):

```bash
cd frontend && bun install && bun dev
```

> **Note:** The application requires `JWT_SECRET` to be set when not using the dev profile. See [AUTHENTICATION.md](docs/AUTHENTICATION.md) for details.

## Project Structure

```
PunchCard/
├── src/                          # Backend source code
│   ├── main/java/com/punchard/api/
│   │   ├── config/               # Security and app configuration
│   │   ├── controller/           # REST API controllers
│   │   ├── dto/                  # Data transfer objects
│   │   ├── exception/            # Custom exceptions and handlers
│   │   ├── model/                # JPA entities (User, PunchCard, Punch)
│   │   ├── repository/           # Spring Data repositories
│   │   ├── security/             # JWT and auth services
│   │   └── service/              # Business logic services
│   └── test/                     # Backend unit and integration tests
├── frontend/                     # React frontend application
│   └── src/
│       ├── api/                  # API client and hooks
│       ├── components/           # Reusable UI components
│       │   ├── auth/             # Authentication components
│       │   ├── cards/            # Punch card components
│       │   ├── layout/           # Layout components
│       │   └── ui/               # Generic UI elements
│       ├── hooks/                # Custom React hooks
│       ├── pages/                # Page components (Dashboard, CardView, etc.)
│       ├── stores/               # Zustand state stores
│       ├── three/                # Three.js 3D components
│       ├── types/                # TypeScript type definitions
│       └── utils/                # Utility functions
├── docs/                         # Detailed documentation
├── postman/                      # Postman collection for API testing
├── build.gradle                  # Gradle build configuration
├── docker-compose.yml            # PostgreSQL container setup
└── run.sh                        # One-command startup script
```

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - High-level system architecture overview

Detailed documentation in the `docs/` folder:

- **[API.md](docs/API.md)** - Complete API reference with all endpoints, request/response schemas, and examples
- **[AUTHENTICATION.md](docs/AUTHENTICATION.md)** - JWT authentication guide, token usage, roles, and troubleshooting
- **[FRONTEND.md](docs/FRONTEND.md)** - React/Three.js frontend architecture, components, and state management
- **[TESTING.md](docs/TESTING.md)** - Testing documentation, test structure, and best practices
- **[SPRING_BOOT_SETUP.md](docs/SPRING_BOOT_SETUP.md)** - Spring Boot setup and dependency reference

### Postman Collection

Import the files from `postman/` into Postman for easy API testing:

1. Open Postman and click **Import**
2. Select both files from `postman/`:
   - `PunchCard-API.postman_collection.json` - All endpoints with tests
   - `PunchCard-API.postman_environment.json` - Environment variables
3. Select **PunchCard API** environment (top right)
4. Run **Login** request - JWT token auto-saves for authenticated requests

## API Endpoints

### Quick Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/cards` | Create punch card | Yes |
| GET | `/api/cards` | List my punch cards | Yes |
| GET | `/api/cards/{id}` | Get punch card by ID | Yes |
| PUT | `/api/cards/{id}` | Update punch card | Yes (owner) |
| DELETE | `/api/cards/{id}` | Delete punch card | Yes (owner) |
| POST | `/api/cards/{id}/punches` | Add punch to card | Yes (owner) |
| GET | `/api/cards/{id}/punches` | List punches on card | Yes |
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

# Frontend commands
cd frontend && bun install    # Install dependencies
cd frontend && bun dev        # Start dev server
cd frontend && bun run build  # Production build
cd frontend && bun run lint   # Run linter
```

### Frontend Development

The frontend uses Vite with a proxy configuration that forwards `/api` requests to the backend at `localhost:8080`. This allows seamless development without CORS issues.

Environment variables can be configured in `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

## License

MIT License - See [LICENSE](LICENSE) for details.
