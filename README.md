# PunchCard
It's easier than making bread; Get someone to punch in every time you give them a gift

## Project Structure
```
PunchCard/
├── backend/              # Go backend API
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   ├── handlers/         # HTTP handlers
│   ├── models/          # Data models
│   ├── database/        # Database connection and migrations
│   └── middleware/      # Custom middleware
├── frontend/            # 3D Game Engine (Three.js + ECS)
│   ├── main.js         # Game initialization
│   ├── game-engine.js  # Core game engine
│   ├── ecs.js          # Entity Component System
│   ├── scene-manager.js # Scene management system
│   ├── index.html      # Game container
│   └── package.json    # Dependencies
└── database/           # SQLite database file
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

## Frontend Setup (3D Game Engine)

### Prerequisites
- Node.js 16+ 
- Modern web browser with WebGL support

### Installation & Running

#### Quick Start
```bash
cd frontend
npm install
# Open index.html in your browser or use a local server
```

#### Using a Local Server (Recommended)
```bash
cd frontend
npm install
npx http-server . -p 8080
# Open http://localhost:8080 in your browser
```

### Game Engine Architecture

#### Core Components
- **GameEngine** (`game-engine.js`) - Main game loop, camera controls, rendering
- **ECS System** (`ecs.js`) - Entity Component System for game objects
- **SceneManager** (`scene-manager.js`) - Scene loading and management
- **EntityFactory** - Easy object creation with performance optimizations

#### Key Features
- **High Performance**: Object pooling, batch operations, instanced rendering
- **Easy Scene Creation**: Simple API for designers to create scenes
- **Optimized ECS**: Entity Component System with caching and pooling
- **Scene Management**: Load, cache, and switch between scenes instantly
- **3D Controls**: FPS-style camera movement with WASD + mouse

### For Designers: Creating Scenes

#### 1. Basic Scene Setup
Open `frontend/scene-manager.js` and add your scene:

```javascript
// In setupDefaultScenes() method, add:
this.scenes.set('myScene', {
    name: 'My Awesome Scene',
    description: 'A beautiful 3D scene',
    load: () => this.loadMyScene()
});
```

#### 2. Create Scene Content
Add a scene loading method:

```javascript
loadMyScene() {
    // Add ground
    this.addToCurrentScene(
        this.game.addPlane(0, -1, 0, 0x888888, 20, 20)
    );
    
    // Add objects
    this.addToCurrentScene(
        this.game.addCube(0, 0, 0, 0xff0000, 1)           // Red cube
    );
    
    this.addToCurrentScene(
        this.game.addSphere(2, 1, 0, 0x00ff00, 0.5)      // Green sphere
    );
    
    this.addToCurrentScene(
        this.game.addRotatingCube(-2, 0, 0, 0x0000ff, 1, 0.02) // Blue spinning cube
    );
}
```

#### 3. Available Object Types

**Basic Shapes:**
```javascript
// Cubes
this.game.addCube(x, y, z, color, size)
this.game.addRotatingCube(x, y, z, color, size, rotationSpeed)
this.game.addMovingCube(x, y, z, color, size, speed)

// Spheres
this.game.addSphere(x, y, z, color, radius)

// Ground
this.game.addPlane(x, y, z, color, width, height)
```

**Colors:**
```javascript
0xff0000  // Red
0x00ff00  // Green  
0x0000ff  // Blue
0xffff00  // Yellow
0xff00ff  // Magenta
0x00ffff  // Cyan
0xffffff  // White
0x000000  // Black
```

**Batch Operations (For Many Objects):**
```javascript
// Create many cubes at once
const cubeField = this.game.addCubeField(100, 2, 0x00ff00, 0.8);
cubeField.forEach(cube => this.addToCurrentScene(cube));
```

#### 4. Helper Methods for Patterns

**Circle Pattern:**
```javascript
const positions = this.createCirclePositions(8, 5); // 8 objects in circle, radius 5
positions.forEach((pos, i) => {
    this.addToCurrentScene(
        this.game.addCube(pos[0], 0, pos[2], 0xff0000, 1)
    );
});
```

**Grid Pattern:**
```javascript
const positions = this.createGridPositions(5, 5, 2); // 5x5 grid, spacing 2
positions.forEach((pos, i) => {
    this.addToCurrentScene(
        this.game.addCube(pos[0], 0, pos[2], 0x00ff00, 1)
    );
});
```

**Random Pattern:**
```javascript
const positions = this.createRandomPositions(20, 10); // 20 objects, spread 10 units
positions.forEach((pos, i) => {
    this.addToCurrentScene(
        this.game.addCube(pos[0], 0, pos[2], 0x0000ff, 1)
    );
});
```

#### 5. Testing Your Scene

**In Browser Console:**
```javascript
// Load your scene
sceneManager.loadScene('myScene');

// Check available scenes
console.log(sceneManager.getAvailableScenes());

// Get performance stats
console.log(sceneManager.getScenePerformanceStats());
```

**Navigation:**
```javascript
sceneManager.nextScene();     // Go to next scene
sceneManager.previousScene(); // Go to previous scene
```

### Controls
- **WASD** - Move camera
- **Space** - Move up
- **Shift** - Move down
- **Mouse** - Look around (click to enable)
- **ESC** - Exit mouse lock

### Performance Tips for Designers

1. **Use Batch Operations**: For 50+ objects, use `addCubeField()` or `addBatch()`
2. **Lazy Loading**: For large scenes, use `sceneManager.loadSceneOptimized(sceneName, true)`
3. **Reuse Colors**: Define colors once and reuse them
4. **Test Performance**: Use `sceneManager.getScenePerformanceStats()` to monitor

### Example Complete Scene

```javascript
loadMyAwesomeScene() {
    // Ground
    this.addToCurrentScene(
        this.game.addPlane(0, -1, 0, 0x666666, 30, 30)
    );
    
    // Player spawn (green cube)
    this.addToCurrentScene(
        this.game.addCube(0, 0, 0, 0x00ff00, 1)
    );
    
    // Enemies in circle (red spinning cubes)
    const enemyPositions = this.createCirclePositions(8, 5);
    enemyPositions.forEach((pos, i) => {
        this.addToCurrentScene(
            this.game.addRotatingCube(pos[0], 0, pos[2], 0xff0000, 0.8, 0.02)
        );
    });
    
    // Collectibles scattered around (yellow spheres)
    const collectiblePositions = this.createRandomPositions(15, 8);
    collectiblePositions.forEach((pos, i) => {
        this.addToCurrentScene(
            this.game.addSphere(pos[0], 0.5, pos[2], 0xffff00, 0.3)
        );
    });
    
    // Moving obstacles (blue moving cubes)
    for (let i = 0; i < 5; i++) {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        this.addToCurrentScene(
            this.game.addMovingCube(x, 0, z, 0x0000ff, 0.6, 0.01)
        );
    }
}
```

### Troubleshooting

**Scene not loading?**
- Check console for errors
- Make sure scene name matches in `setupDefaultScenes()`
- Verify all objects are added with `addToCurrentScene()`

**Performance issues?**
- Use batch operations for many objects
- Enable lazy loading for large scenes
- Check performance stats in console

**Objects not appearing?**
- Check Y position (objects might be underground)
- Verify colors are valid hex values
- Make sure objects are added to current scene
