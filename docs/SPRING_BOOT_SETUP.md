# PunchCard - Spring Boot Setup Guide

A comprehensive guide for the PunchCard Spring Boot backend API - a punch card tracking application.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Application Configuration](#application-configuration)
  - [Main Configuration](#main-configuration)
  - [Development Profile](#development-profile)
  - [Test Configuration](#test-configuration)
- [Database Setup](#database-setup)
  - [PostgreSQL (Production)](#postgresql-production)
  - [H2 (Development)](#h2-development)
- [Security Configuration](#security-configuration)
  - [JWT Authentication](#jwt-authentication)
  - [Role-Based Access Control](#role-based-access-control)
  - [Security Filter Chain](#security-filter-chain)
- [API Endpoints](#api-endpoints)
- [Domain Model](#domain-model)
- [Build and Run](#build-and-run)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Glossary](#glossary)
- [Resources](#resources)

---

## Project Overview

PunchCard is a backend API for tracking punch cards (loyalty cards). It provides:

- User registration and authentication with JWT tokens
- Role-based access control (USER and ADMIN roles)
- CRUD operations for punch cards and punches
- RESTful API design with proper validation

| Setting | Value |
|---------|-------|
| **Spring Boot Version** | 4.0.1 |
| **Java Version** | 21 |
| **Build Tool** | Gradle (Groovy) |
| **Group** | `com.punchard` |
| **Artifact** | `api` |
| **Package Name** | `com.punchard.api` |

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Spring Boot | 4.0.1 |
| **Language** | Java | 21 |
| **Build Tool** | Gradle | 8.x |
| **Database** | PostgreSQL | 16 |
| **Database (Dev)** | H2 | Runtime |
| **JWT Library** | jjwt (io.jsonwebtoken) | 0.12.6 |
| **ORM** | Spring Data JPA / Hibernate | |
| **Security** | Spring Security | |

---

## Project Structure

```
PunchCard/
├── build.gradle                    # Gradle build configuration
├── settings.gradle                 # Project settings (rootProject.name = 'api')
├── docker-compose.yml              # PostgreSQL container setup
├── run.sh                          # Full-stack build & run script
├── gradlew / gradlew.bat           # Gradle wrapper scripts
├── src/
│   ├── main/
│   │   ├── java/com/punchard/api/
│   │   │   ├── PunchCardApplication.java     # Main entry point
│   │   │   ├── config/
│   │   │   │   └── SecurityConfig.java       # Security configuration
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java       # Auth endpoints (/api/auth/*)
│   │   │   │   ├── HelloController.java      # Health check endpoint
│   │   │   │   ├── PunchCardController.java  # Punch card CRUD (/api/cards/*)
│   │   │   │   ├── PunchController.java      # Punch operations (/api/cards/{id}/punches)
│   │   │   │   └── UserController.java       # User management (/api/users/*)
│   │   │   ├── dto/
│   │   │   │   ├── AuthResponse.java
│   │   │   │   ├── CardStyleDto.java
│   │   │   │   ├── CreatePunchCardRequest.java
│   │   │   │   ├── CreatePunchRequest.java
│   │   │   │   ├── CreateUserRequest.java
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── PunchCardResponse.java
│   │   │   │   ├── PunchResponse.java
│   │   │   │   ├── UpdatePunchCardRequest.java
│   │   │   │   ├── UpdateUserRequest.java
│   │   │   │   └── UserResponse.java
│   │   │   ├── exception/
│   │   │   │   ├── CardFullException.java
│   │   │   │   ├── DuplicatePunchException.java
│   │   │   │   ├── DuplicateUserException.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── InvalidPunchPositionException.java
│   │   │   │   ├── PunchCardNotFoundException.java
│   │   │   │   └── UserNotFoundException.java
│   │   │   ├── model/
│   │   │   │   ├── CardStyle.java            # Embeddable
│   │   │   │   ├── Punch.java                # Entity
│   │   │   │   ├── PunchCard.java            # Entity
│   │   │   │   ├── PunchShape.java           # Enum
│   │   │   │   ├── Role.java                 # Enum (USER, ADMIN)
│   │   │   │   └── User.java                 # Entity
│   │   │   ├── repository/
│   │   │   │   ├── PunchCardRepository.java
│   │   │   │   ├── PunchRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   ├── security/
│   │   │   │   ├── CardSecurityService.java      # Card-level authorization
│   │   │   │   ├── CustomUserDetailsService.java # User loading for auth
│   │   │   │   ├── JwtAuthenticationFilter.java  # JWT filter
│   │   │   │   ├── JwtService.java               # JWT generation/validation
│   │   │   │   ├── UserPrincipal.java            # Authentication principal
│   │   │   │   └── UserSecurityService.java      # User-level authorization
│   │   │   └── service/
│   │   │       ├── AuthService.java
│   │   │       ├── PunchCardService.java
│   │   │       ├── PunchService.java
│   │   │       └── UserService.java
│   │   └── resources/
│   │       ├── application.properties            # Main config (PostgreSQL)
│   │       └── application-dev.properties        # Dev profile (H2)
│   └── test/
│       ├── java/com/punchard/api/
│       │   ├── PunchCardApplicationTests.java
│       │   ├── config/
│       │   │   ├── SecurityTestConfig.java
│       │   │   └── TestSecurityConfig.java
│       │   ├── controller/
│       │   │   ├── AuthControllerTest.java
│       │   │   ├── HelloControllerTest.java
│       │   │   ├── UserControllerAuthTest.java
│       │   │   └── UserControllerTest.java
│       │   ├── repository/
│       │   │   └── UserRepositoryTest.java
│       │   └── security/
│       │       ├── CustomUserDetailsServiceTest.java
│       │       ├── JwtServiceTest.java
│       │       └── TestJwtUtils.java
│       └── resources/
│           └── application.properties            # Test config (H2)
└── frontend/                        # React frontend (separate)
```

---

## Dependencies

### build.gradle

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '4.0.1'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.punchard'
version = '0.0.1-SNAPSHOT'
description = 'Track your bread progress'

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

dependencies {
    // Core
    implementation 'org.springframework.boot:spring-boot-starter-webmvc'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // Security
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-security-oauth2-resource-server'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'

    // Database
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    runtimeOnly 'org.postgresql:postgresql'
    runtimeOnly 'com.h2database:h2'
    implementation 'org.springframework.boot:spring-boot-h2console'

    // Monitoring
    implementation 'org.springframework.boot:spring-boot-starter-actuator'

    // Developer Tools
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    annotationProcessor 'org.springframework.boot:spring-boot-configuration-processor'
    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    // Testing
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.boot:spring-boot-starter-webmvc-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testImplementation 'com.fasterxml.jackson.core:jackson-databind'
    testImplementation 'com.fasterxml.jackson.datatype:jackson-datatype-jsr310'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}
```

---

## Application Configuration

### Main Configuration

**`src/main/resources/application.properties`** - PostgreSQL production configuration:

```properties
spring.application.name=PunchCard

# PostgreSQL Database Configuration
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/punchcard}
spring.datasource.username=${DATABASE_USER:punchcard}
spring.datasource.password=${DATABASE_PASSWORD:punchcard}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA settings
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console disabled (using PostgreSQL)
spring.h2.console.enabled=false

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=28800000
```

### Development Profile

**`src/main/resources/application-dev.properties`** - H2 in-memory database for development:

```properties
spring.application.name=PunchCard

# H2 in-memory database for development
spring.datasource.url=jdbc:h2:mem:punchcard;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA settings
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console enabled for debugging
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT Configuration (with dev default)
jwt.secret=${JWT_SECRET:dev-secret-key-for-local-testing-must-be-at-least-32-characters}
jwt.expiration=28800000
```

### Test Configuration

**`src/test/resources/application.properties`**:

```properties
spring.application.name=PunchCard

# H2 in-memory database for testing
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA settings for testing
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# Disable H2 console in tests
spring.h2.console.enabled=false

# JWT Configuration for tests
jwt.secret=test-secret-key-for-jwt-testing-must-be-at-least-32-characters-long
jwt.expiration=28800000
```

---

## Database Setup

### PostgreSQL (Production)

Use Docker Compose to start PostgreSQL:

```bash
docker-compose up -d
```

**`docker-compose.yml`**:
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: punchcard-postgres
    environment:
      POSTGRES_DB: punchcard
      POSTGRES_USER: punchcard
      POSTGRES_PASSWORD: punchcard
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U punchcard -d punchcard"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
```

### H2 (Development)

H2 is automatically used when running with the `dev` profile. Access the H2 console at:
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:punchcard`
- Username: `sa`
- Password: (empty)

---

## Security Configuration

### JWT Authentication

The application uses JWT (JSON Web Tokens) for stateless authentication via the jjwt library.

**JWT Token Structure:**
- Subject: username
- Claims: userId, role
- Expiration: 8 hours (28800000 ms)

**JwtService** handles token generation and validation:
```java
// Token generation includes:
- subject (username)
- userId claim
- role claim
- issuedAt timestamp
- expiration timestamp
- HMAC-SHA signature
```

### Role-Based Access Control

The application implements role-based authorization with two roles:

| Role | Capabilities |
|------|--------------|
| **USER** | View own cards, view own punches, update/delete own profile |
| **ADMIN** | All USER capabilities + create/update/delete punch cards, add punches, manage all users, promote users to admin |

### Security Filter Chain

**Public Endpoints (no authentication required):**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/hello` - Health check
- `GET /h2-console/**` - H2 console (dev only)
- `GET /actuator/health` - Health status

**Authenticated Endpoints:**
- All other `/api/**` endpoints require a valid JWT token

**Security Configuration:**
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/hello").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

**CORS Configuration:**
- Allowed Origins: `http://localhost:5173`, `http://127.0.0.1:5173`
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Credentials: Enabled

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/users` | Create user | Yes | ADMIN |
| GET | `/api/users` | List all users (paginated) | Yes | Any |
| GET | `/api/users/{id}` | Get user by ID | Yes | Any |
| PUT | `/api/users/{id}` | Update user | Yes | Owner or ADMIN |
| DELETE | `/api/users/{id}` | Delete user | Yes | Owner or ADMIN |
| POST | `/api/users/{id}/promote` | Promote user to ADMIN | Yes | ADMIN |

### Punch Cards (`/api/cards`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/cards` | Create punch card | Yes | ADMIN |
| GET | `/api/cards` | Get my cards (paginated) | Yes | Any |
| GET | `/api/cards/{id}` | Get card by ID | Yes | Owner or ADMIN |
| PUT | `/api/cards/{id}` | Update card | Yes | ADMIN |
| DELETE | `/api/cards/{id}` | Delete card | Yes | ADMIN |

### Punches (`/api/cards/{cardId}/punches`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/api/cards/{cardId}/punches` | Add punch to card | Yes | ADMIN |
| GET | `/api/cards/{cardId}/punches` | Get punches for card | Yes | Owner or ADMIN |

---

## Domain Model

### User Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
```

### PunchCard Entity

```java
@Entity
@Table(name = "punch_cards")
public class PunchCard {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private int totalSlots;

    @Column(nullable = false, length = 255)
    private String reward;

    @Embedded
    private CardStyle cardStyle = new CardStyle();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Punch> punches = new ArrayList<>();

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    // Computed methods
    public int getCurrentPunches() { return punches != null ? punches.size() : 0; }
    public boolean isFull() { return getCurrentPunches() >= totalSlots; }
}
```

### Punch Entity

```java
@Entity
@Table(name = "punches")
public class Punch {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private PunchCard card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "punched_by", nullable = false)
    private User punchedBy;

    @Column(nullable = false)
    private int position;

    @CreationTimestamp
    private Instant punchedAt;
}
```

### CardStyle (Embeddable)

```java
@Embeddable
public class CardStyle {
    @Column(length = 7)
    private String backgroundColor = "#FFFFFF";

    @Column(length = 7)
    private String textColor = "#000000";

    @Column(length = 255)
    private String texture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PunchShape punchShape = PunchShape.CIRCLE;
}
```

### Enums

```java
public enum Role {
    USER,
    ADMIN
}

public enum PunchShape {
    CIRCLE,
    STAR,
    HEART,
    CUSTOM
}
```

---

## Build and Run

### Quick Start (Development)

Use the provided run script for the full stack:

```bash
./run.sh
```

This script:
1. Runs backend tests
2. Installs frontend dependencies
3. Starts backend with dev profile (H2 database)
4. Starts frontend development server
5. Waits for both services to be ready

**Services available after startup:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console

### Manual Commands

```bash
# Run the application (default - PostgreSQL)
./gradlew bootRun

# Run with dev profile (H2)
./gradlew bootRun --args='--spring.profiles.active=dev'

# Run tests
./gradlew test

# Build JAR file
./gradlew build

# Clean build artifacts
./gradlew clean

# Build without tests
./gradlew build -x test
```

### Production with PostgreSQL

1. Start PostgreSQL:
   ```bash
   docker-compose up -d
   ```

2. Set environment variables:
   ```bash
   export JWT_SECRET="your-production-secret-key-at-least-32-characters"
   export DATABASE_URL="jdbc:postgresql://localhost:5432/punchcard"
   export DATABASE_USER="punchcard"
   export DATABASE_PASSWORD="punchcard"
   ```

3. Run the application:
   ```bash
   ./gradlew bootRun
   ```

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | Yes (prod) | Dev default provided |
| `DATABASE_URL` | PostgreSQL JDBC URL | No | `jdbc:postgresql://localhost:5432/punchcard` |
| `DATABASE_USER` | Database username | No | `punchcard` |
| `DATABASE_PASSWORD` | Database password | No | `punchcard` |

---

## Testing

The project includes comprehensive tests:

- **Unit Tests**: Service and repository layer tests
- **Integration Tests**: Controller tests with MockMvc
- **Security Tests**: JWT and authentication tests

```bash
# Run all tests
./gradlew test

# Run with test output
./gradlew test --info

# Run specific test class
./gradlew test --tests "AuthControllerTest"
```

Test configuration uses H2 in-memory database automatically.

---

## Glossary

| Term | Definition |
|------|------------|
| **JWT** | JSON Web Token - compact, URL-safe token for stateless authentication |
| **BCrypt** | Password hashing algorithm used for secure password storage |
| **DTO** | Data Transfer Object - separates API contract from database entities |
| **Entity** | Java class mapped to a database table via JPA annotations |
| **Embeddable** | A reusable component that is embedded within an entity |
| **Repository** | Interface extending JpaRepository for database operations |
| **Service** | Business logic layer between controllers and repositories |
| **SecurityFilterChain** | Configures HTTP security rules and filter order |
| **@PreAuthorize** | Method-level security annotation for authorization checks |
| **Profile** | Environment-specific configuration (dev, test, prod) |

---

## Resources

- [Spring Boot 4.0 Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [jjwt Library Documentation](https://github.com/jwtk/jjwt)
- [Baeldung Spring Tutorials](https://www.baeldung.com/spring-tutorial)

---

*Last updated: December 2024*

