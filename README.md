# PunchCard
Its easier then making bread; Get someone to punch in everytime you give them a gift

## Project Structure
```
PunchCard/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── handlers/          # HTTP handlers
│   ├── models/           # Data models
│   ├── database/         # Database connection and migrations
│   ├── middleware/       # Custom middleware
│   └── static/           # React build files (served statically)
├── frontend/             # React application
└── database/             # SQLite database file
```

## Dependancies
Dependencies to install you might consider:
 - github.com/gin-gonic/gin          // Web framework
 - github.com/mattn/go-sqlite3       // SQLite driver
 - github.com/jmoiron/sqlx           // SQL extensions
 - github.com/gin-contrib/cors       // CORS middleware
 - github.com/gin-contrib/static     // Static file serving
