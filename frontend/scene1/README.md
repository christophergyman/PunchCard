# Scene1 - Modular Scene Template

This is a template for creating modular scenes in the PunchCard game engine.

## How to Create a New Scene

### 1. Create Scene Folder
```bash
mkdir scene2
cd scene2
```

### 2. Copy Template File
```bash
cp ../scene1/scene1.js scene2.js
```

### 3. Update Scene Class
Edit `scene2.js` and change:
```javascript
class Scene1 {  // Change to Scene2
    // ... rest of the class
}

export { Scene1 };  // Change to Scene2
```

### 4. Add to SceneManager
In `scene-manager.js`, add:
```javascript
import { Scene2 } from './scene2/scene2.js';

// In setupDefaultScenes():
this.scenes.set('scene2', {
    name: 'Scene 2',
    description: 'Your scene description',
    load: () => this.loadModularScene('scene2', Scene2)
});
```

### 5. Load Your Scene
```javascript
sceneManager.loadScene('scene2');
```

## Scene Structure

Each scene class should have:

- `load()` - Main scene loading method
- `clear()` - Clean up scene entities
- `addEntity(entity)` - Add entity to scene
- `getInfo()` - Get scene information
- `getPerformanceStats()` - Get performance data

## Helper Methods Available

- `createCircle(count, radius, y, objectType, color, size)` - Create circle pattern
- `createGrid(width, height, spacing, y, objectType, color, size)` - Create grid pattern  
- `createRandom(count, spread, y, objectType, color, size)` - Create random pattern

## Object Types

- `'cube'` - Basic cube
- `'rotatingCube'` - Spinning cube
- `'movingCube'` - Moving cube
- `'sphere'` - Sphere

## Example Usage

```javascript
// Create enemies in a circle
this.createCircle(8, 5, 0, 'rotatingCube', 0xff0000, 0.8);

// Create collectibles in a grid
this.createGrid(5, 5, 2, 0, 'sphere', 0xffff00, 0.3);

// Create random obstacles
this.createRandom(10, 8, 0, 'movingCube', 0x0000ff, 0.6);
```

## Benefits of Modular Scenes

1. **Organization** - Each scene in its own file
2. **Reusability** - Easy to copy and modify scenes
3. **Maintainability** - Changes isolated to specific scenes
4. **Collaboration** - Multiple designers can work on different scenes
5. **Performance** - Scenes can be loaded/unloaded independently
