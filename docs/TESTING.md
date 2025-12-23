# Testing Documentation

Complete guide to testing the PunchCard API.

---

## Table of Contents

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
│   ├── TestSecurityConfig.java          # Permits all for unit tests
│   └── SecurityTestConfig.java          # Enforces security for integration tests
├── controller/
│   ├── AuthControllerTest.java          # Authentication endpoint tests
│   ├── UserControllerTest.java          # User endpoint tests (unit)
│   ├── UserControllerAuthTest.java      # User authorization tests
│   └── HelloControllerTest.java         # Hello endpoint tests
├── repository/
│   └── UserRepositoryTest.java          # Database repository tests
├── security/
│   ├── CustomUserDetailsServiceTest.java # UserDetailsService tests
│   ├── JwtServiceTest.java              # JWT token generation/validation tests
│   └── TestJwtUtils.java                # Test utilities for JWT tokens
└── PunchCardApplicationTests.java       # Application context tests
```

### Test Types

#### Unit Tests

Test individual components in isolation with mocked dependencies.

**Characteristics:**
- Fast execution
- No database access
- Mocked dependencies
- Test single class/method

**Examples:**
- `JwtServiceTest` - Tests JWT service logic
- `CustomUserDetailsServiceTest` - Tests user loading logic
- `UserControllerTest` - Controller tests with mocked service

#### Integration Tests

Test components working together with real dependencies.

**Characteristics:**
- Slower execution
- May use in-memory database (H2)
- Real dependencies (or minimal mocking)
- Test component interactions

**Examples:**
- `UserRepositoryTest` - Tests database operations
- `UserControllerAuthTest` - Tests security integration
- `AuthControllerTest` - Tests authentication flow

---

## Test Categories

### Repository Tests

**File:** `src/test/java/com/punchard/api/repository/UserRepositoryTest.java`

Tests database operations using Spring Data JPA repositories.

**Key Features:**
- Uses `@SpringBootTest` for full context
- Uses in-memory H2 database
- Tests CRUD operations
- Tests custom query methods

**Example:**
```java
@SpringBootTest
@Transactional
class UserRepositoryTest {
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void findByUsername_shouldReturnUser_whenExists() {
        User user = User.builder()
            .username("testuser")
            .email("test@example.com")
            .password("hashed")
            .build();
        userRepository.save(user);
        
        Optional<User> found = userRepository.findByUsername("testuser");
        
        assertThat(found).isPresent();
    }
}
```

### Service Tests

#### JWT Service Tests

**File:** `src/test/java/com/punchard/api/security/JwtServiceTest.java`

Tests JWT token generation, validation, and expiration.

**Test Coverage:**
- Token generation with correct claims
- Token validation
- Expired token handling
- Malformed token handling
- Token with wrong secret rejection

**Example:**
```java
class JwtServiceTest {
    
    @Test
    void generateToken_shouldIncludeCorrectClaims() {
        String token = jwtService.generateToken(testUser);
        
        assertThat(jwtService.extractUsername(token))
            .isEqualTo("testuser");
        assertThat(jwtService.extractUserId(token))
            .isEqualTo(testUser.getId());
        assertThat(jwtService.extractRole(token))
            .isEqualTo("USER");
    }
}
```

#### UserDetailsService Tests

**File:** `src/test/java/com/punchard/api/security/CustomUserDetailsServiceTest.java`

Tests user loading for Spring Security authentication.

**Test Coverage:**
- Loading user by username
- Handling non-existent users
- Correct authorities/roles
- UserPrincipal creation

### Controller Tests

#### Authentication Controller Tests

**File:** `src/test/java/com/punchard/api/controller/AuthControllerTest.java`

Tests authentication endpoints (register, login).

**Test Coverage:**
- Successful registration
- Registration validation errors
- Duplicate username/email handling
- Successful login
- Invalid credentials
- Login validation errors

**Configuration:**
- Uses `@WebMvcTest` for lightweight controller testing
- Mocks `AuthService`
- Uses `@AutoConfigureMockMvc(addFilters = false)` to bypass security

**Example:**
```java
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({TestSecurityConfig.class, GlobalExceptionHandler.class})
class AuthControllerTest {
    
    @MockitoBean
    private AuthService authService;
    
    @Test
    void register_shouldReturn201_whenSuccessful() {
        // Test implementation
    }
}
```

#### User Controller Tests

**File:** `src/test/java/com/punchard/api/controller/UserControllerTest.java`

Unit tests for user endpoints with mocked service.

**Test Coverage:**
- CRUD operations
- Validation errors
- Error handling
- Pagination

#### User Controller Authorization Tests

**File:** `src/test/java/com/punchard/api/controller/UserControllerAuthTest.java`

Integration tests for authorization and role-based access.

**Test Coverage:**
- Admin-only endpoints
- Owner-only operations
- Role-based access control
- 401/403 error scenarios

**Configuration:**
- Uses `@SpringBootTest` for full security context
- Uses `@WithMockUser` for role-based testing
- Tests actual security enforcement

**Example:**
```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerAuthTest {
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void createUser_shouldReturn201_whenAdmin() {
        // Test admin access
    }
    
    @Test
    void updateUser_shouldReturn403_whenNotOwner() {
        // Test ownership check
    }
}
```

---

## Writing Tests

### Test Utilities

#### TestJwtUtils

**File:** `src/test/java/com/punchard/api/security/TestJwtUtils.java`

Utility class for generating test JWT tokens.

**Usage:**
```java
// Generate token for regular user
String token = TestJwtUtils.generateUserToken(userId, "testuser");

// Generate token for admin
String adminToken = TestJwtUtils.generateAdminToken(userId, "admin");

// Create Bearer header value
String header = TestJwtUtils.bearerToken(token);
```

### Mocking with @MockitoBean

Use `@MockitoBean` to mock Spring beans in `@WebMvcTest`:

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

### Security Test Configuration

#### TestSecurityConfig

**File:** `src/test/java/com/punchard/api/config/TestSecurityConfig.java`

Configuration that permits all requests. Used for unit tests that mock the service layer.

**When to use:**
- Controller unit tests with mocked services
- Tests that don't need security enforcement
- Fast, isolated tests

#### SecurityTestConfig

**File:** `src/test/java/com/punchard/api/config/SecurityTestConfig.java`

Configuration that enforces authentication. Used for integration tests.

**When to use:**
- Testing `@PreAuthorize` annotations
- Testing security filter chain
- Integration tests with real security

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
# H2 in-memory database for testing
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver

# JPA settings for testing
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop

# JWT Configuration for tests
jwt.secret=test-secret-key-for-jwt-testing-must-be-at-least-32-characters-long
jwt.expiration=28800000
```

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

- ✅ Repository layer (UserRepository)
- ✅ Service layer (JWT, UserDetails)
- ✅ Controller layer (Auth, User, Hello)
- ✅ Security/Authorization
- ✅ Error handling
- ✅ Validation

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

### Database Issues in Tests

**Problem:** Tests interfere with each other

**Solution:**
- Use `@Transactional` for automatic rollback
- Clean up in `@BeforeEach`
- Use unique test data

### Mock Not Working

**Problem:** Mocked service not being used

**Solution:**
- Ensure `@MockitoBean` is used (not `@Mock`)
- Check test configuration imports
- Verify mock setup in test method

---

## Related Documentation

- [API.md](API.md) - API reference for endpoint examples
- [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication details
- [README.md](../README.md) - Project overview

