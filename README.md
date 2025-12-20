# PunchCard

A social media clone backend API built with Spring Boot 4.0.

## Prerequisites

- **Java 21** - Required for Spring Boot 4.0
- **Gradle** - Included via wrapper (`./gradlew`)

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

## Running the Application

```bash
./gradlew bootRun
```

The server starts at `http://localhost:8080`

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/hello` | Returns "Hello World" | No |

### Example

```bash
curl http://localhost:8080/api/hello
# Response: Hello World
```

## Running Tests

```bash
./gradlew test
```

## Development

### H2 Console

Access the in-memory database at: `http://localhost:8080/h2-console`

- JDBC URL: `jdbc:h2:mem:punchcard`
- Username: `sa`
- Password: *(empty)*

### Useful Commands

```bash
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
- H2 Database (dev)
- PostgreSQL (prod)
- Lombok

## License

See [LICENSE](LICENSE) for details.

