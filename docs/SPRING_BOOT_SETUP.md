# PunchCard - Spring Boot Setup Guide

A reference guide for setting up the Spring Boot backend for the PunchCard social media clone.

---

## Table of Contents

- [Spring Initializr Settings](#spring-initializr-settings)
- [Dependencies Overview](#dependencies-overview)
  - [Core API](#core-api)
  - [Security & Authentication](#security--authentication)
  - [Database & Persistence](#database--persistence)
  - [Developer Experience](#developer-experience)
  - [Monitoring & Operations](#monitoring--operations)
- [Dependency Details](#dependency-details)
- [Project Structure](#project-structure)
- [Next Steps](#next-steps)
- [Glossary](#glossary)

---

## Spring Initializr Settings

Visit [start.spring.io](https://start.spring.io) and configure:

| Setting | Recommended Value | Notes |
|---------|-------------------|-------|
| **Project** | Gradle - Groovy | Build tool (Maven also works) |
| **Language** | Java | |
| **Spring Boot** | 4.0.1 or 3.5.9 | 3.5.9 is more stable if you encounter issues |
| **Group** | `com.punchcard` | Your organization/domain |
| **Artifact** | `api` | The project name |
| **Name** | `PunchCard` | Display name |
| **Description** | `Social media clone backend API` | |
| **Package name** | `com.punchcard.api` | Base package for your code |
| **Packaging** | Jar | Standard for Spring Boot |
| **Java** | 17 or 21 | Both are LTS versions |

---

## Dependencies Overview

### Core API

| Dependency | Purpose | Required? |
|------------|---------|-----------|
| Spring Web | REST API endpoints, `@RestController`, `@GetMapping`, etc. | ✅ Yes |
| Validation | Input validation with `@Valid`, `@NotBlank`, `@Email`, etc. | ✅ Yes |

### Security & Authentication

| Dependency | Purpose | Required? |
|------------|---------|-----------|
| Spring Security | Authentication & authorization framework | ✅ Yes |
| OAuth2 Resource Server | JWT token validation for stateless API auth | ✅ Yes |

### Database & Persistence

| Dependency | Purpose | Required? |
|------------|---------|-----------|
| Spring Data JPA | ORM framework, `@Entity`, repositories | ✅ Yes |
| PostgreSQL Driver | Production database connection | ✅ Yes |
| H2 Database | In-memory database for local dev/testing | ⚡ Recommended |

### Developer Experience

| Dependency | Purpose | Required? |
|------------|---------|-----------|
| Lombok | Reduces boilerplate with `@Data`, `@Builder`, `@Getter` | ⚡ Recommended |
| Spring Boot DevTools | Hot reload during development | ⚡ Recommended |

### Monitoring & Operations

| Dependency | Purpose | Required? |
|------------|---------|-----------|
| Spring Boot Actuator | Health checks, metrics, monitoring endpoints | 📋 Optional |
| Spring Configuration Processor | Better IDE autocomplete for config files | 📋 Optional |

---

## Dependency Details

### Spring Web

**What it does:** Provides everything needed to build RESTful web services.

**Key annotations you'll use:**
```java
@RestController      // Marks a class as a REST API controller
@RequestMapping      // Maps HTTP requests to handler methods
@GetMapping          // Handles GET requests
@PostMapping         // Handles POST requests
@PutMapping          // Handles PUT requests
@DeleteMapping       // Handles DELETE requests
@PathVariable        // Extracts values from URL path
@RequestBody         // Deserializes JSON request body to object
@RequestParam        // Extracts query parameters
```

**Example:**
```java
@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @GetMapping
    public List<Post> getAllPosts() {
        return postService.findAll();
    }
    
    @PostMapping
    public Post createPost(@RequestBody CreatePostRequest request) {
        return postService.create(request);
    }
}
```

---

### Validation

**What it does:** Validates incoming data before processing.

**Key annotations you'll use:**
```java
@Valid              // Triggers validation on an object
@NotNull            // Field cannot be null
@NotBlank           // String cannot be null, empty, or whitespace
@NotEmpty           // Collection/String cannot be null or empty
@Email              // Must be valid email format
@Size(min, max)     // String/Collection size constraints
@Min / @Max         // Numeric value constraints
@Pattern            // Regex pattern matching
```

**Example:**
```java
public class CreateUserRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
```

---

### Spring Security

**What it does:** Handles authentication (who are you?) and authorization (what can you do?).

**Key concepts:**
- **SecurityFilterChain** - Configures security rules for your endpoints
- **UserDetailsService** - Loads user data for authentication
- **PasswordEncoder** - Hashes passwords (use BCrypt)
- **@PreAuthorize** - Method-level security

**Example configuration:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())  // Disable for REST APIs
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .build();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

### OAuth2 Resource Server (JWT)

**What it does:** Validates JWT tokens for API authentication.

**How it works:**
1. Client logs in → receives JWT token
2. Client includes token in `Authorization: Bearer <token>` header
3. Spring validates token automatically on each request
4. User info is available via `@AuthenticationPrincipal`

**Required configuration in `application.properties`:**
```properties
# For JWT validation
spring.security.oauth2.resourceserver.jwt.secret-key=your-256-bit-secret-key-here
# OR use issuer-uri for external auth providers
# spring.security.oauth2.resourceserver.jwt.issuer-uri=https://your-auth-server.com
```

---

### Spring Data JPA

**What it does:** Object-Relational Mapping (ORM) - maps Java objects to database tables.

**Key annotations you'll use:**
```java
@Entity             // Marks class as a database table
@Table              // Customize table name
@Id                 // Primary key field
@GeneratedValue     // Auto-generate ID values
@Column             // Customize column properties
@OneToMany          // One-to-many relationship
@ManyToOne          // Many-to-one relationship
@ManyToMany         // Many-to-many relationship
@JoinColumn         // Foreign key column
@CreatedDate        // Auto-set creation timestamp
@LastModifiedDate   // Auto-set update timestamp
```

**Example Entity:**
```java
@Entity
@Table(name = "users")
@Data  // Lombok
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String passwordHash;
    
    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private List<Post> posts = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
}
```

**Example Repository:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
```

---

### PostgreSQL Driver

**What it does:** Connects your app to a PostgreSQL database.

**Configuration in `application.properties`:**
```properties
# PostgreSQL connection
spring.datasource.url=jdbc:postgresql://localhost:5432/punchcard
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
```

**`ddl-auto` options:**
- `none` - No schema changes (production)
- `validate` - Validate schema matches entities
- `update` - Update schema to match entities (dev)
- `create` - Drop and recreate on startup
- `create-drop` - Create on startup, drop on shutdown

---

### H2 Database

**What it does:** In-memory database for development and testing.

**Configuration for dev profile (`application-dev.properties`):**
```properties
# H2 in-memory database
spring.datasource.url=jdbc:h2:mem:punchcard
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Enable H2 console (access at /h2-console)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA settings for H2
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```

---

### Lombok

**What it does:** Generates boilerplate code at compile time.

**Key annotations:**
```java
@Data               // Generates getters, setters, toString, equals, hashCode
@Getter             // Generates getter methods
@Setter             // Generates setter methods
@NoArgsConstructor  // Generates no-args constructor
@AllArgsConstructor // Generates all-args constructor
@Builder            // Generates builder pattern
@Slf4j              // Creates a logger field
@RequiredArgsConstructor // Constructor for final fields (great for DI)
```

**Example:**
```java
// Without Lombok: ~50 lines of boilerplate
// With Lombok:
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
}
```

**IDE Setup Required:**
- IntelliJ: Install "Lombok" plugin, enable annotation processing
- VS Code: Install "Lombok Annotations Support" extension

---

### Spring Boot DevTools

**What it does:** Improves development experience with automatic restarts and live reload.

**Features:**
- Auto-restart when code changes
- LiveReload browser integration
- Disables template caching
- Enhanced development-time error pages

**No configuration needed** - just add the dependency and it works!

---

### Spring Boot Actuator

**What it does:** Adds production-ready monitoring and management endpoints.

**Key endpoints:**
```
GET /actuator/health     # Application health status
GET /actuator/info       # Application information
GET /actuator/metrics    # Application metrics
GET /actuator/env        # Environment properties
```

**Configuration:**
```properties
# Expose specific endpoints
management.endpoints.web.exposure.include=health,info,metrics

# Customize health endpoint
management.endpoint.health.show-details=when_authorized
```

---

## Project Structure

After generating and extracting, your project should look like:

```
punchcard-api/
├── build.gradle                 # Dependencies and build config
├── settings.gradle              # Project settings
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/punchcard/api/
│   │   │       ├── PunchCardApplication.java    # Main entry point
│   │   │       ├── config/                      # Configuration classes
│   │   │       │   ├── SecurityConfig.java
│   │   │       │   └── JwtConfig.java
│   │   │       ├── controller/                  # REST controllers
│   │   │       │   ├── AuthController.java
│   │   │       │   ├── UserController.java
│   │   │       │   └── PostController.java
│   │   │       ├── dto/                         # Data Transfer Objects
│   │   │       │   ├── request/
│   │   │       │   └── response/
│   │   │       ├── entity/                      # JPA entities
│   │   │       │   ├── User.java
│   │   │       │   ├── Post.java
│   │   │       │   └── Comment.java
│   │   │       ├── repository/                  # JPA repositories
│   │   │       │   ├── UserRepository.java
│   │   │       │   └── PostRepository.java
│   │   │       ├── service/                     # Business logic
│   │   │       │   ├── AuthService.java
│   │   │       │   ├── UserService.java
│   │   │       │   └── PostService.java
│   │   │       └── exception/                   # Custom exceptions
│   │   │           └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       ├── application.properties           # Main config
│   │       ├── application-dev.properties       # Dev profile
│   │       └── application-prod.properties      # Prod profile
│   └── test/
│       └── java/
│           └── com/punchcard/api/
│               └── PunchCardApplicationTests.java
└── gradlew / gradlew.bat        # Gradle wrapper scripts
```

---

## Next Steps

After generating your Spring Boot project:

1. [ ] Extract the downloaded ZIP to your project directory
2. [ ] Open in your IDE (IntelliJ IDEA recommended)
3. [ ] If using Lombok, install the IDE plugin and enable annotation processing
4. [ ] Create the package structure (controller, service, entity, etc.)
5. [ ] Configure `application.properties` for your database
6. [ ] Create your first entity (User)
7. [ ] Set up Spring Security configuration
8. [ ] Create authentication endpoints (register, login)
9. [ ] Add JWT token generation and validation
10. [ ] Build out social media features (posts, comments, likes, follows)

---

## Useful Commands

```bash
# Run the application
./gradlew bootRun

# Run tests
./gradlew test

# Build JAR file
./gradlew build

# Clean build artifacts
./gradlew clean

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'
```

---

## Glossary

Spring has a lot of terminology that can be confusing at first. Here's a quick reference:

| Term | Definition |
|------|------------|
| **Annotation** | Special markers (starting with `@`) that add metadata to your code. Spring uses these to configure behavior automatically. Example: `@RestController`, `@Autowired` |
| **Application Context** | The Spring container that holds all your beans and manages their lifecycle. Think of it as a smart object factory that creates and wires everything together. |
| **Autowiring** | Spring's automatic dependency injection. When you use `@Autowired` (or constructor injection), Spring automatically provides the required dependency. |
| **Bean** | Any object that Spring manages for you. When you mark a class with `@Component`, `@Service`, `@Repository`, or `@Controller`, Spring creates a bean from it. |
| **Component Scan** | The process where Spring automatically finds and registers beans in your package. Starts from your main application class's package. |
| **Controller** | A class that handles incoming HTTP requests. Use `@Controller` for views or `@RestController` for JSON APIs. |
| **CRUD** | Create, Read, Update, Delete - the four basic database operations. |
| **Dependency Injection (DI)** | A design pattern where objects receive their dependencies from an external source rather than creating them. Spring does this automatically. |
| **DTO (Data Transfer Object)** | A simple object used to transfer data between layers. Separates your API contract from your database entities. |
| **Entity** | A Java class that maps to a database table. Marked with `@Entity`. Each instance represents a row in the table. |
| **Filter** | Code that intercepts HTTP requests/responses before they reach your controller. Used for authentication, logging, etc. |
| **Hibernate** | The default ORM (Object-Relational Mapping) implementation used by Spring Data JPA. Translates between Java objects and SQL. |
| **IoC (Inversion of Control)** | The principle that Spring controls object creation and lifecycle instead of you doing it manually with `new`. |
| **JPA (Java Persistence API)** | A specification for ORM in Java. Spring Data JPA is Spring's implementation. |
| **JWT (JSON Web Token)** | A compact, URL-safe token format for securely transmitting information. Used for stateless authentication. |
| **Middleware** | Code that runs between receiving a request and sending a response. In Spring, this is often done via Filters or Interceptors. |
| **ORM (Object-Relational Mapping)** | A technique to convert data between Java objects and relational database tables. |
| **Profile** | A way to have different configurations for different environments (dev, test, prod). Activated with `spring.profiles.active`. |
| **Repository** | An interface that provides database operations. Extend `JpaRepository<Entity, IdType>` and Spring implements it automatically. |
| **REST (Representational State Transfer)** | An architectural style for APIs using HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources. |
| **Scope** | Defines how many instances of a bean are created. Default is `singleton` (one instance), but can be `prototype` (new instance each time), `request`, `session`, etc. |
| **Service** | A class containing business logic. Marked with `@Service`. Sits between controllers and repositories. |
| **Singleton** | The default bean scope - only one instance exists in the application context, shared by all who need it. |
| **Spring Boot** | An opinionated framework that makes it easy to create Spring applications with minimal configuration. |
| **Spring Container** | See Application Context. The core of Spring that manages beans. |
| **Starter** | Pre-packaged dependencies that bundle everything you need for a feature. Example: `spring-boot-starter-web` includes Spring MVC, embedded Tomcat, Jackson, etc. |
| **Stereotype Annotations** | Annotations that mark a class's role: `@Component` (generic), `@Service` (business logic), `@Repository` (data access), `@Controller` (web layer). |
| **Transaction** | A unit of work that either completely succeeds or completely fails. Managed with `@Transactional`. |

---

## Resources

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Baeldung Spring Tutorials](https://www.baeldung.com/spring-tutorial)

---

*Last updated: December 2024*

