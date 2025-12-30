# Testing Documentation

Complete guide to testing the PunchCard API.

---

## Table of Contents

- [Test Frameworks and Dependencies](#test-frameworks-and-dependencies)
- [Running Tests](#running-tests)
  - [Run All Tests](#run-all-tests)
  - [Run Specific Test Class](#run-specific-test-class)
  - [Run Tests Matching a Pattern](#run-tests-matching-a-pattern)
  - [Run Tests with Coverage](#run-tests-with-coverage)
  - [View Test Reports](#view-test-reports)
- [Test Structure](#test-structure)
  - [Organization by Layer](#organization-by-layer)
  - [Test Types](#test-types)
- [Test Categories](#test-categories)
  - [Repository Tests](#repository-tests)
  - [Service Tests](#service-tests)
  - [Controller Tests](#controller-tests)
- [Writing Tests](#writing-tests)
  - [Test Utilities](#test-utilities)
  - [Mocking with @MockitoBean](#mocking-with-mockitobean)
  - [Security Test Configuration](#security-test-configuration)
  - [Using @WithMockUser](#using-withmockuser)
  - [Using user() Request Post Processor](#using-user-request-post-processor)
  - [Test Data Setup](#test-data-setup)
  - [Assertion Patterns](#assertion-patterns)
- [Test Configuration](#test-configuration)
  - [Test Application Properties](#test-application-properties)
  - [Test Isolation](#test-isolation)
- [Best Practices](#best-practices)
  - [Test Naming](#test-naming)
  - [Test Organization](#test-organization)
  - [Test Independence](#test-independence)
  - [Mocking Guidelines](#mocking-guidelines)
  - [Assertion Guidelines](#assertion-guidelines)
  - [Performance](#performance)
- [Test Coverage](#test-coverage)
  - [Current Coverage](#current-coverage)
  - [Running Coverage Reports](#running-coverage-reports)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## Test Frameworks and Dependencies

The project uses the following test frameworks and libraries, configured in `build.gradle`:

### Core Test Dependencies

| Dependency | Purpose |
|------------|---------|
| `spring-boot-starter-test` | Core Spring Boot testing support (includes JUnit 5, AssertJ, Mockito, Hamcrest) |
| `spring-boot-starter-webmvc-test` | MockMvc support for testing web layer |
| `spring-security-test` | Security testing utilities (`@WithMockUser`, `SecurityMockMvcRequestPostProcessors`) |
| `junit-platform-launcher` | JUnit 5 platform for test execution |
| `jackson-databind` | JSON serialization/deserialization for tests |
| `jackson-datatype-jsr310` | Java 8 date/time support for Jackson |

### Test Framework Versions

The project uses Spring Boot 4.0.1 with the following test stack:
- **JUnit 5** (Jupiter) - Test framework
- **Mockito** - Mocking framework (via `@MockitoBean` annotation)
- **AssertJ** - Fluent assertions library
- **H2 Database** - In-memory database for integration tests

### Gradle Test Configuration

```groovy
tasks.named('test') {
    useJUnitPlatform()
}
```

---

## Running Tests

### Run All Tests

```bash
./gradlew test
```

This runs all tests in the project and generates a test report.

### Run Specific Test Class

```bash
./gradlew test --tests "com.punchard.api.controller.AuthControllerTest"
```

### Run Tests Matching a Pattern

```bash
# Run all controller tests
./gradlew test --tests "com.punchard.api.controller.*"

# Run all security tests
./gradlew test --tests "com.punchard.api.security.*"
```

### Run Tests with Coverage

```bash
# Note: Requires JaCoCo plugin (not currently configured)
./gradlew test jacocoTestReport
```

### View Test Reports

After running tests, view the HTML report:

```
build/reports/tests/test/index.html
```

Open in your browser to see detailed test results.

---

## Test Structure

### Organization by Layer

Tests are organized to mirror the main source structure:

```
src/test/java/com/punchard/api/
├── config/
│   ├── TestSecurityConfig.java           # Test config for unit tests (provides beans, security bypassed)
│   └── SecurityTestConfig.java           # Test config that enforces authentication
├── controller/
│   ├── AuthControllerTest.java           # Authentication endpoint tests
│   ├── UserControllerTest.java           # User endpoint tests (unit)
│   ├── UserControllerAuthTest.java       # User authorization tests
│   └── HelloControllerTest.java          # Hello endpoint tests
├── repository/
│   └── UserRepositoryTest.java           # User database tests
├── security/
│   ├── CustomUserDetailsServiceTest.java # UserDetailsService tests
│   ├── JwtServiceTest.java               # JWT token generation/validation tests
│   └── TestJwtUtils.java                 # Test utilities for JWT tokens
└── PunchCardApplicationTests.java        # Application context tests

src/test/resources/
└── application.properties                # Test-specific configuration
```

### Test Types

#### Unit Tests

Test individual components in isolation with mocked dependencies.

**Characteristics:**
- Fast execution
- No database access
- Mocked dependencies using `@MockitoBean`
- Test single class/method

**Examples:**
- `JwtServiceTest` - Tests JWT service logic with no Spring context
- `CustomUserDetailsServiceTest` - Tests user loading logic with mocked repository
- `UserControllerTest` - Controller tests with mocked service layer

#### Integration Tests

Test components working together with real dependencies.

**Characteristics:**
- Slower execution
- Uses in-memory H2 database
- Real dependencies (or minimal mocking)
- Test component interactions

**Examples:**
- `UserRepositoryTest` - Tests database operations with real H2
- `PunchCardApplicationTests` - Tests application context loads correctly

---

## Test Categories

### Repository Tests

**File:** `src/test/java/com/punchard/api/repository/UserRepositoryTest.java`

Tests database operations using Spring Data JPA repositories.

**Key Features:**
- Uses `@SpringBootTest` for full context
- Uses in-memory H2 database
- Uses `@Transactional` for automatic rollback after each test
- Tests CRUD operations and custom query methods

**Test Coverage:**
- Default role assignment (USER)
- Role persistence (USER and ADMIN)
- `findByUsername` query method
- Empty result handling

**Example:**
```java
@SpringBootTest
@Transactional
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .password("hashedpassword")
                .build();
    }

    @Test
    @DisplayName("findByUsername should return user when exists")
    void findByUsernameShouldReturnUserWhenExists() {
        userRepository.save(testUser);

        Optional<User> foundUser = userRepository.findByUsername("testuser");

        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo("testuser");
    }
}
```

### Service Tests

#### JWT Service Tests

**File:** `src/test/java/com/punchard/api/security/JwtServiceTest.java`

Tests JWT token generation, validation, and expiration. This is a pure unit test without Spring context.

**Test Coverage:**
- Token generation with correct claims (username, userId, role)
- Token validation for valid tokens
- Handling of malformed, null, and empty tokens
- Token rejection with wrong secret
- Token expiration detection
- Constructor validation (secret length, null checks)
- Different tokens for different users

**Example:**
```java
class JwtServiceTest {

    private static final String TEST_SECRET = "test-secret-key-for-jwt-testing-must-be-at-least-32-characters-long";
    private static final long TEST_EXPIRATION = 28800000L;

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(TEST_SECRET, TEST_EXPIRATION);
        testUser = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("test@example.com")
                .password("hashedpassword")
                .role(Role.USER)
                .build();
    }

    @Test
    @DisplayName("generateToken should include correct username in token")
    void generateToken_shouldIncludeCorrectUsername() {
        String token = jwtService.generateToken(testUser);

        String username = jwtService.extractUsername(token);
        assertThat(username).isEqualTo("testuser");
    }
}
```

#### UserDetailsService Tests

**File:** `src/test/java/com/punchard/api/security/CustomUserDetailsServiceTest.java`

Tests user loading for Spring Security authentication using Mockito extensions.

**Test Coverage:**
- Loading user by username returns correct `UserPrincipal`
- Correct authorities for USER and ADMIN roles
- `UsernameNotFoundException` for non-existent users
- UserPrincipal exposes user ID, email, and role
- Account status flags (non-expired, non-locked, enabled)

**Example:**
```java
@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("loadUserByUsername should return UserPrincipal when user exists")
    void loadUserByUsername_shouldReturnUserPrincipal_whenUserExists() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("testuser");

        assertThat(userDetails).isNotNull();
        assertThat(userDetails.getUsername()).isEqualTo("testuser");
    }
}
```

### Controller Tests

#### Authentication Controller Tests

**File:** `src/test/java/com/punchard/api/controller/AuthControllerTest.java`

Tests authentication endpoints (register, login) with mocked services.

**Test Coverage:**
- Successful registration (201 response)
- Registration validation errors (blank username, invalid email, short password)
- Duplicate username/email handling (409 response)
- Successful login (200 response with JWT token)
- Invalid credentials (401 response)
- Login validation errors (blank username/password)

**Configuration:**
- Uses `@WebMvcTest(AuthController.class)` for lightweight controller testing
- Uses `@AutoConfigureMockMvc(addFilters = false)` to bypass security filters
- Mocks `AuthService`, `UserService`, and `JwtAuthenticationFilter`
- Imports `TestSecurityConfig` and `GlobalExceptionHandler`

**Example:**
```java
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Nested
    @DisplayName("POST /api/auth/register")
    class RegisterTests {

        @Test
        @DisplayName("should return 201 and user response when registration is successful")
        void register_shouldReturn201_whenSuccessful() throws Exception {
            CreateUserRequest request = new CreateUserRequest("testuser", "password123", "test@example.com");
            UserResponse response = new UserResponse(TEST_USER_ID, "testuser", "test@example.com", "USER", NOW, NOW);

            when(authService.register(any(CreateUserRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username").value("testuser"));
        }
    }
}
```

#### User Controller Tests

**File:** `src/test/java/com/punchard/api/controller/UserControllerTest.java`

Unit tests for user endpoints with mocked service.

**Test Coverage:**
- Create user (201 response, validation errors, duplicate handling)
- Get all users (pagination support, empty list handling)
- Get user by ID (200 response, 404 for not found)
- Update user (200 response, 404 not found, 409 duplicate, validation errors)
- Delete user (204 response, 404 for not found)

**Configuration:**
- Uses `@WebMvcTest(UserController.class)`
- Mocks `UserService`
- Imports `TestSecurityConfig` and `GlobalExceptionHandler`

#### User Controller Authorization Tests

**File:** `src/test/java/com/punchard/api/controller/UserControllerAuthTest.java`

Tests for authorization and role-based access control.

**Test Coverage:**
- Admin-only user creation (201 with admin role)
- Authenticated user can list users (200)
- Authenticated user can view any profile (200)
- Owner can update their own profile (200)
- Admin can update any profile (200)
- Owner can delete their own account (204)
- Admin can delete any account (204)

**Configuration:**
- Uses `@WebMvcTest` with `@AutoConfigureMockMvc(addFilters = false)`
- Uses `@WithMockUser(roles = "ADMIN")` for role-based testing
- Uses `user()` post processor with `UserPrincipal` for owner testing
- Mocks `UserService`, `JwtAuthenticationFilter`, and `UserSecurityService`

**Example:**
```java
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class UserControllerAuthTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private UserSecurityService userSecurityService;

    private UserPrincipal regularUser;
    private UserPrincipal adminUser;

    @BeforeEach
    void setUp() {
        regularUser = new UserPrincipal(USER_ID, "testuser", Role.USER);
        adminUser = new UserPrincipal(USER_ID, "adminuser", Role.ADMIN);
    }

    @Test
    @DisplayName("should return 200 when user updates their own profile (owner)")
    void updateUser_shouldReturn200_whenOwner() throws Exception {
        when(userSecurityService.isOwner(eq(USER_ID), any())).thenReturn(true);
        when(userService.updateUser(eq(USER_ID), any())).thenReturn(response);

        mockMvc.perform(put("/api/users/{id}", USER_ID)
                        .with(user(regularUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
```

#### Hello Controller Test

**File:** `src/test/java/com/punchard/api/controller/HelloControllerTest.java`

Simple test for the hello endpoint.

**Test Coverage:**
- GET `/api/hello` returns "Hello World"

**Example:**
```java
@WebMvcTest(HelloController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(TestSecurityConfig.class)
class HelloControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void hello_shouldReturnHelloWorld() throws Exception {
        mockMvc.perform(get("/api/hello"))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello World"));
    }
}
```

---

## Writing Tests

### Test Utilities

#### TestJwtUtils

**File:** `src/test/java/com/punchard/api/security/TestJwtUtils.java`

Utility class for generating test JWT tokens. Uses the same secret and expiration as test configuration.

**Available Methods:**
- `generateToken(UUID userId, String username, Role role)` - Generate token with specific role
- `generateUserToken(UUID userId, String username)` - Generate token for USER role
- `generateAdminToken(UUID userId, String username)` - Generate token for ADMIN role
- `bearerToken(String token)` - Create "Bearer {token}" header value

**Usage:**
```java
// Generate token for regular user
String token = TestJwtUtils.generateUserToken(userId, "testuser");

// Generate token for admin
String adminToken = TestJwtUtils.generateAdminToken(userId, "admin");

// Create Bearer header value
String header = TestJwtUtils.bearerToken(token);
// Returns: "Bearer eyJ..."
```

### Mocking with @MockitoBean

Use `@MockitoBean` (from `org.springframework.test.context.bean.override.mockito`) to mock Spring beans in `@WebMvcTest`:

```java
@WebMvcTest(SomeController.class)
class SomeControllerTest {

    @MockitoBean
    private SomeService someService;

    @Test
    void testMethod() {
        when(someService.doSomething()).thenReturn(result);
        // Test implementation
    }
}
```

**Note:** In Spring Boot 4.x, the annotation is `@MockitoBean` from the `bean.override.mockito` package. For pure unit tests without Spring context, use `@Mock` from Mockito with `@ExtendWith(MockitoExtension.class)`.

### Security Test Configuration

#### TestSecurityConfig

**File:** `src/test/java/com/punchard/api/config/TestSecurityConfig.java`

Configuration that provides common test beans. Security is bypassed via `@AutoConfigureMockMvc(addFilters = false)` on tests.

**Beans Provided:**
- `PasswordEncoder` - BCryptPasswordEncoder for password operations
- `ObjectMapper` - Jackson mapper with Java 8 time module support
- `JwtService` - Pre-configured JWT service for token operations

**When to use:**
- Controller unit tests with mocked services
- Tests that don't need security enforcement
- Fast, isolated tests

**Example:**
```java
@WebMvcTest(SomeController.class)
@AutoConfigureMockMvc(addFilters = false)  // Bypasses security filters
@Import(TestSecurityConfig.class)
class SomeControllerTest {
    // ...
}
```

#### SecurityTestConfig

**File:** `src/test/java/com/punchard/api/config/SecurityTestConfig.java`

Configuration that enforces authentication with method security enabled.

**Features:**
- `@EnableWebSecurity` - Enables web security
- `@EnableMethodSecurity` - Enables `@PreAuthorize` annotations
- Stateless session management
- All requests require authentication

**When to use:**
- Testing `@PreAuthorize` annotations
- Testing security filter chain
- Integration tests with real security enforcement

### Using @WithMockUser

Test role-based access with `@WithMockUser`:

```java
@Test
@WithMockUser(roles = "ADMIN")
void testAdminEndpoint() {
    // Test admin-only functionality
}

@Test
@WithMockUser(username = "testuser")
void testUserEndpoint() {
    // Test user-specific functionality
}
```

### Using user() Request Post Processor

For more control, use the `user()` request post processor:

```java
UserPrincipal admin = new UserPrincipal(userId, "admin", Role.ADMIN);

mockMvc.perform(get("/api/users")
    .with(user(admin)))
    .andExpect(status().isOk());
```

### Test Data Setup

Use `@BeforeEach` for test data setup:

```java
@BeforeEach
void setUp() {
    // Create test data
    testUser = User.builder()
        .username("testuser")
        .email("test@example.com")
        .password("hashed")
        .build();
    
    // Clean up before each test
    userRepository.deleteAll();
}
```

### Assertion Patterns

Use AssertJ for readable assertions:

```java
import static org.assertj.core.api.Assertions.assertThat;

// Object assertions
assertThat(user).isNotNull();
assertThat(user.getUsername()).isEqualTo("testuser");

// Collection assertions
assertThat(users).hasSize(2);
assertThat(users).contains(user1, user2);

// Optional assertions
assertThat(optionalUser).isPresent();
assertThat(optionalUser).isEmpty();

// Exception assertions
assertThatThrownBy(() -> service.doSomething())
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("error message");
```

---

## Test Configuration

### Test Application Properties

**File:** `src/test/resources/application.properties`

Test-specific configuration:

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

**Key Configuration Notes:**
- `DB_CLOSE_DELAY=-1` keeps the database alive between tests
- `DB_CLOSE_ON_EXIT=FALSE` prevents premature database closure
- `create-drop` recreates schema for each test run
- `show-sql=true` enables SQL logging for debugging

### Test Isolation

**Best Practices:**
- Use `@Transactional` for repository tests (auto-rollback)
- Clean up test data in `@BeforeEach` or `@AfterEach`
- Use unique test data to avoid conflicts
- Use `@DirtiesContext` sparingly (slows tests)

**Example:**
```java
@SpringBootTest
@Transactional  // Each test runs in a transaction that rolls back
class UserRepositoryTest {
    
    @BeforeEach
    void setUp() {
        userRepository.deleteAll();  // Clean slate
    }
}
```

---

## Best Practices

### Test Naming

Use descriptive test method names:

```java
// Good
@Test
void createUser_shouldReturn201_whenValidRequest() { }

@Test
void createUser_shouldReturn400_whenUsernameBlank() { }

// Bad
@Test
void test1() { }

@Test
void createUser() { }
```

### Test Organization

Use nested test classes for grouping:

```java
@Nested
@DisplayName("POST /api/auth/register")
class RegisterTests {
    
    @Test
    void shouldReturn201_whenSuccessful() { }
    
    @Test
    void shouldReturn400_whenValidationFails() { }
}
```

### Test Independence

Each test should be independent:

- ✅ Don't rely on test execution order
- ✅ Don't share mutable state between tests
- ✅ Clean up after each test
- ✅ Use fresh test data for each test

### Mocking Guidelines

- ✅ Mock external dependencies (databases, APIs)
- ✅ Mock slow operations
- ✅ Don't mock the class under test
- ✅ Don't over-mock (prefer real objects when possible)

### Assertion Guidelines

- ✅ Use specific assertions (not just `assertTrue`)
- ✅ Test one thing per test
- ✅ Use descriptive assertion messages
- ✅ Verify both success and error cases

### Performance

- ✅ Keep unit tests fast (< 100ms each)
- ✅ Use `@WebMvcTest` for controller unit tests
- ✅ Use `@SpringBootTest` only when needed
- ✅ Avoid `@DirtiesContext` unless necessary

---

## Test Coverage

### Current Coverage

The project includes tests for:

**Repository Layer:**
- UserRepository (role persistence, findByUsername queries)

**Service/Security Layer:**
- JwtService (token generation, validation, expiration, claims extraction)
- CustomUserDetailsService (user loading, role authorities, UserPrincipal creation)

**Controller Layer:**
- AuthController (registration, login, validation, error handling)
- UserController (CRUD operations, pagination, validation)
- UserController Authorization (role-based access, owner operations)
- HelloController (basic endpoint)

**Application Context:**
- PunchCardApplicationTests (context loads successfully)

**Areas Without Tests (Opportunities for Improvement):**
- PunchCard and Punch repositories
- PunchCard and Punch controllers
- CardSecurityService
- AuthService
- UserService

### Running Coverage Reports

To generate coverage reports, add JaCoCo plugin to `build.gradle`:

```groovy
plugins {
    id 'jacoco'
}

jacoco {
    toolVersion = "0.8.11"
}

test {
    finalizedBy jacocoTestReport
}

jacocoTestReport {
    reports {
        xml.required = true
        html.required = true
    }
}
```

Then run:
```bash
./gradlew test jacocoTestReport
```

View report at: `build/reports/jacoco/test/html/index.html`

---

## Troubleshooting

### Tests Failing Due to Security

**Problem:** Tests fail with 401/403 errors

**Solution:**
- Use `@AutoConfigureMockMvc(addFilters = false)` for unit tests
- Use `@WithMockUser` for integration tests
- Check test security configuration
- Ensure `JwtAuthenticationFilter` is mocked with `@MockitoBean`

### Database Issues in Tests

**Problem:** Tests interfere with each other

**Solution:**
- Use `@Transactional` for automatic rollback
- Clean up in `@BeforeEach` with `repository.deleteAll()`
- Use unique test data (e.g., `UUID.randomUUID()`)

### Mock Not Working

**Problem:** Mocked service not being used

**Solution:**
- Ensure `@MockitoBean` is used (not `@Mock`) for Spring context tests
- For pure unit tests, use `@Mock` with `@ExtendWith(MockitoExtension.class)`
- Check test configuration imports
- Verify mock setup with `when()` before calling the method

### Missing Beans in WebMvcTest

**Problem:** Tests fail due to missing beans (e.g., JwtService, PasswordEncoder)

**Solution:**
- Import `TestSecurityConfig` which provides common beans
- Mock any additional dependencies with `@MockitoBean`

### Tests Running Slowly

**Problem:** Tests take too long to execute

**Solution:**
- Use `@WebMvcTest` instead of `@SpringBootTest` for controller tests
- Avoid `@DirtiesContext` unless absolutely necessary
- Use mocks instead of real database operations where possible

---

## Frontend Testing

The frontend (React/TypeScript with Vite) currently does not have a testing setup configured. The `package.json` does not include test frameworks like Vitest or Jest.

**Recommended Setup for Future:**
- **Vitest** - Fast unit test framework for Vite projects
- **React Testing Library** - For testing React components
- **MSW (Mock Service Worker)** - For mocking API calls

---

## Related Documentation

- [API.md](API.md) - API reference for endpoint examples
- [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication details
- [README.md](../README.md) - Project overview

