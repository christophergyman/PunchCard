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
│   ├── models/         # GLB/GLTF model files
│   ├── scene1/         # Modular scene system
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

**GLB/GLTF Models (With Textures and UV Mapping):**
```javascript
// Load your custom GLB models
const character = await this.game.addModel('./models/character.glb', x, y, z);
this.addEntity(character);

// Add movement to models
const movingModel = await this.game.addModel('./models/weirdCube.glb', x, y, z);
movingModel.addComponent(new MovementComponent(0.02));
this.addEntity(movingModel);

// Add rotation to models
const spinningModel = await this.game.addModel('./models/table.glb', x, y, z);
spinningModel.addComponent(new RotationComponent(0.01));
this.addEntity(spinningModel);
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

**GLB Models (With Textures and UV Mapping):**
```javascript
// Load your custom GLB models
const character = await this.game.addModel('./models/character.glb', 0, 0, 0);
this.addEntity(character);

// Add movement to models
const movingCharacter = await this.game.addModel('./models/character.glb', 5, 0, 0);
movingCharacter.addComponent(new MovementComponent(0.02));
this.addEntity(movingCharacter);

// Add rotation to models
const spinningModel = await this.game.addModel('./models/weirdCube.glb', -5, 0, 0);
spinningModel.addComponent(new RotationComponent(0.01));
this.addEntity(spinningModel);
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

### GLB Model Usage Guide

#### **Setting Up Your Models**
1. **Place GLB files** in `frontend/models/` directory
2. **Use relative paths** when loading: `'./models/yourModel.glb'`
3. **Models are cached** automatically for performance

#### **Basic Model Loading**
```javascript
async load() {
    // Load a single model
    const character = await this.game.addModel('./models/character.glb', 0, 0, 0);
    this.addEntity(character);
}
```

#### **Multiple Model Instances**
```javascript
async load() {
    // Create multiple characters in a circle
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 10;
        const z = Math.sin(angle) * 10;
        
        const character = await this.game.addModel('./models/character.glb', x, 0, z);
        this.addEntity(character);
    }
}
```

#### **Models with Movement and Rotation**
```javascript
async load() {
    // Moving model
    const movingCharacter = await this.game.addModel('./models/character.glb', 0, 0, 10);
    movingCharacter.addComponent(new MovementComponent(0.02));
    this.addEntity(movingCharacter);
    
    // Spinning model
    const spinningCube = await this.game.addModel('./models/weirdCube.glb', 5, 0, 0);
    spinningCube.addComponent(new RotationComponent(0.01));
    this.addEntity(spinningCube);
}
```

#### **What's Supported in GLB Models**
✅ **Textures** - All texture types (diffuse, normal, roughness, etc.)  
✅ **UV Mapping** - Preserved from your 3D software  
✅ **Materials** - PBR, standard, custom materials  
✅ **Animations** - Model animations (if present)  
✅ **Shadows** - Automatic shadow casting/receiving  
✅ **Performance** - Model caching and efficient cloning  

### Example Complete Scene

```javascript
async loadMyAwesomeScene() {
    // Ground
    this.addToCurrentScene(
        this.game.addPlane(0, -1, 0, 0x666666, 30, 30)
    );
    
    // Player spawn (GLB character model)
    const player = await this.game.addModel('./models/character.glb', 0, 0, 0);
    this.addEntity(player);
    
    // Enemies in circle (GLB models)
    const enemyPositions = this.createCirclePositions(8, 5);
    for (let i = 0; i < enemyPositions.length; i++) {
        const pos = enemyPositions[i];
        const enemy = await this.game.addModel('./models/weirdCube.glb', pos[0], 0, pos[2]);
        enemy.addComponent(new RotationComponent(0.02));
        this.addEntity(enemy);
    }
    
    // Furniture scattered around (GLB table models)
    const furniturePositions = this.createRandomPositions(10, 8);
    for (let i = 0; i < furniturePositions.length; i++) {
        const pos = furniturePositions[i];
        const table = await this.game.addModel('./models/table.glb', pos[0], 0, pos[2]);
        this.addEntity(table);
    }
    
    // Moving obstacles (GLB models with movement)
    for (let i = 0; i < 5; i++) {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        const obstacle = await this.game.addModel('./models/weirdCube.glb', x, 0, z);
        obstacle.addComponent(new MovementComponent(0.01));
        this.addEntity(obstacle);
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

**GLB Model Issues:**
- **Model not loading**: Check file path is correct (`./models/filename.glb`)
- **Model appears black**: Check if textures are embedded in GLB file
- **Model too large/small**: Adjust scale using `transform.scale.set(x, y, z)`
- **Model not responding to lighting**: Ensure materials support lighting
- **Performance with many models**: Models are automatically cached for reuse

**Model Loading Best Practices:**
```javascript
// ✅ Good: Use relative paths
const model = await this.game.addModel('./models/character.glb', 0, 0, 0);

// ❌ Bad: Absolute paths won't work
const model = await this.game.addModel('/Users/.../character.glb', 0, 0, 0);

// ✅ Good: Handle loading errors
try {
    const model = await this.game.addModel('./models/character.glb', 0, 0, 0);
    this.addEntity(model);
} catch (error) {
    console.error('Failed to load model:', error);
}
```

**Objects not appearing?**
- Check Y position (objects might be underground)
- Verify colors are valid hex values
- Make sure objects are added to current scene
