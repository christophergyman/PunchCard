# Physics Integration Documentation

## Overview

This document describes the Cannon.js physics integration for the ECS-based game engine. The integration provides a modular, performance-focused physics system that seamlessly works with the existing Entity Component System.

## Architecture

### Core Components

1. **Physics Components**
   - `RigidBodyComponent` - Manages physics body properties
   - `ColliderComponent` - Defines collision shapes
   - `PhysicsMaterialComponent` - Controls material properties

2. **Physics Systems**
   - `PhysicsWorld` - Manages Cannon.js world and physics simulation
   - `PhysicsSystem` - Handles physics updates and entity synchronization
   - `CollisionSystem` - Manages collision detection and events

3. **Shape Factory**
   - `PhysicsShapeFactory` - Creates common physics shapes (box, sphere, plane, etc.)

## Usage

### Basic Physics Entity Creation

```javascript
// Create a physics-enabled cube
const cube = gameEngine.addPhysicsCube(0, 5, 0, 0xff0000, 1, {
    mass: 1,
    type: 'dynamic',
    linearDamping: 0.01,
    angularDamping: 0.01
});

// Create a physics sphere
const sphere = gameEngine.addPhysicsSphere(0, 3, 0, 0x0000ff, 0.5, {
    mass: 0.8,
    type: 'dynamic'
});

// Create a static ground plane
const ground = gameEngine.addPhysicsPlane(0, -1, 0, 0x888888, 20, 20, {
    type: 'static',
    mass: 0
});
```

### Physics Body Types

- **`dynamic`** - Full physics simulation (default)
- **`kinematic`** - Moved by code, affects other bodies
- **`static`** - Immovable, affects other bodies

### Physics Options

```javascript
const options = {
    // Body type
    type: 'dynamic', // 'dynamic', 'kinematic', 'static'
    
    // Mass (0 for static bodies)
    mass: 1,
    
    // Damping
    linearDamping: 0.01,   // Air resistance
    angularDamping: 0.01,   // Rotational resistance
    
    // Sleep settings
    allowSleep: true,
    sleepSpeedLimit: 0.1,
    sleepTimeLimit: 1,
    
    // Collider options
    collider: {
        isTrigger: false,
        collisionFilterGroup: 1,
        collisionFilterMask: -1
    }
};
```

### Applying Forces and Impulses

```javascript
// Apply a force to an entity
gameEngine.applyForce(entity, { x: 0, y: 10, z: 0 }, { x: 0, y: 0, z: 0 });

// Apply an impulse (instant velocity change)
gameEngine.applyImpulse(entity, { x: 5, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });

// Set velocity directly
gameEngine.setVelocity(entity, { x: 2, y: 0, z: 1 });

// Get current velocity
const velocity = gameEngine.getVelocity(entity);
```

### Collision Detection

```javascript
// Add collision handler between two entities
gameEngine.addCollisionHandler(entityA, entityB, (entityA, entityB, type, event) => {
    if (type === 'begin') {
        console.log('Collision started!');
        // Handle collision start
    } else if (type === 'end') {
        console.log('Collision ended!');
        // Handle collision end
    }
});

// Remove collision handler
gameEngine.removeCollisionHandler(entityA, entityB, handler);
```

### Batch Physics Operations

```javascript
// Create multiple physics objects at once
const positions = [[0, 5, 0], [2, 5, 0], [-2, 5, 0]];
const colors = [0xff0000, 0x00ff00, 0x0000ff];
const sizes = [1, 0.8, 1.2];
const physicsOptions = [
    { mass: 1, type: 'dynamic' },
    { mass: 0.5, type: 'dynamic' },
    { mass: 2, type: 'dynamic' }
];

const entities = gameEngine.addPhysicsBatch('physicsCube', 3, positions, colors, sizes, physicsOptions);

// Create a physics cube field
const cubeField = gameEngine.addPhysicsCubeField(100, 1.5, 0x00ff00, 0.3, {
    mass: 0.2,
    type: 'dynamic'
});
```

## Performance Features

### Object Pooling

The physics integration uses object pooling for components to minimize garbage collection:

```javascript
// Components are automatically pooled
const rigidBody = componentPool.getRigidBodyComponent(options);
const collider = componentPool.getColliderComponent(shape, options);

// Release components back to pool when done
componentPool.releaseRigidBodyComponent(rigidBody);
componentPool.releaseColliderComponent(collider);
```

### Material Pooling

Physics materials are cached and reused:

```javascript
// Materials are automatically pooled by name
const material = physicsMaterialPool.getMaterial('bouncy', {
    friction: 0.1,
    restitution: 0.9
});
```

### Performance Monitoring

```javascript
// Get comprehensive performance stats
const stats = gameEngine.getPerformanceStats();
console.log('Physics Stats:', stats.physics);
// Output: { stepCount, lastStepTime, bodyCount, contactCount }
```

## Advanced Usage

### Custom Physics Shapes

```javascript
// Create custom convex shapes
const vertices = [
    { x: -1, y: -1, z: -1 },
    { x: 1, y: -1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: 0, y: 0, z: 1 }
];
const shape = PhysicsShapeFactory.createConvexShape(vertices);

// Create trimesh from geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const shape = PhysicsShapeFactory.createTrimeshShape(
    geometry.attributes.position.array,
    geometry.index.array
);
```

### Physics Materials

```javascript
// Create custom physics material
const bouncyMaterial = new PhysicsMaterialComponent({
    name: 'bouncy',
    friction: 0.1,
    restitution: 0.9,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
});

// Use in entity creation
const entity = gameEngine.addPhysicsCube(0, 5, 0, 0xff0000, 1, {
    material: bouncyMaterial.material
});
```

### Contact Materials

```javascript
// Create contact material for interactions between specific materials
const materialA = physicsMaterialPool.getMaterial('rubber');
const materialB = physicsMaterialPool.getMaterial('metal');
const contactMaterial = physicsMaterialPool.getContactMaterial(materialA, materialB, {
    friction: 0.8,
    restitution: 0.2,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3
});

physicsWorld.addContactMaterial(contactMaterial);
```

## Best Practices

### Performance Optimization

1. **Use object pooling** - Components are automatically pooled
2. **Batch operations** - Create multiple entities at once
3. **Sleep inactive bodies** - Set appropriate sleep parameters
4. **Limit solver iterations** - Balance accuracy vs performance
5. **Use appropriate collision shapes** - Simple shapes are faster

### Memory Management

1. **Release components** - Use component pools for cleanup
2. **Cache materials** - Reuse physics materials
3. **Remove unused entities** - Clean up physics bodies
4. **Monitor performance** - Use performance stats to optimize

### Collision Optimization

1. **Use collision layers** - Filter unnecessary collisions
2. **Optimize shapes** - Use simple shapes when possible
3. **Limit contact points** - Reduce solver complexity
4. **Use triggers** - For non-physical interactions

## Example Scenarios

### Physics Tower

```javascript
// Create a stack of physics cubes
const tower = [];
for (let i = 0; i < 10; i++) {
    const cube = gameEngine.addPhysicsCube(0, i * 1.1, 0, 0x888888, 1, {
        mass: 1,
        type: 'dynamic'
    });
    tower.push(cube);
}
```

### Physics Dominoes

```javascript
// Create a line of physics dominoes
const dominoes = [];
for (let i = 0; i < 10; i++) {
    const domino = gameEngine.addPhysicsCube(i * 1.2, 0.5, 0, 0xffffff, 0.2, {
        mass: 0.5,
        type: 'dynamic'
    });
    dominoes.push(domino);
}

// Knock over the first domino
gameEngine.applyImpulse(dominoes[0], { x: 2, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
```

### Interactive Physics

```javascript
// Add collision handlers for interactive objects
gameEngine.addCollisionHandler(player, collectible, (player, collectible, type) => {
    if (type === 'begin') {
        // Collect item
        gameEngine.removeEntity(collectible);
        score += 10;
    }
});
```

## Troubleshooting

### Common Issues

1. **Bodies not falling** - Check gravity settings
2. **Performance issues** - Reduce solver iterations or body count
3. **Collision not detected** - Verify collision layers and shapes
4. **Bodies passing through** - Increase solver iterations or reduce timestep

### Debug Tips

1. **Use performance stats** - Monitor physics performance
2. **Check body states** - Ensure bodies are active
3. **Verify collision shapes** - Match visual and physics shapes
4. **Test with simple shapes** - Start with basic geometries

## API Reference

### GameEngine Methods

- `addPhysicsCube(x, y, z, color, size, options)` - Create physics cube
- `addPhysicsSphere(x, y, z, color, radius, options)` - Create physics sphere
- `addPhysicsPlane(x, y, z, color, width, height, options)` - Create physics plane
- `addPhysicsCylinder(x, y, z, color, radius, height, options)` - Create physics cylinder
- `addPhysicsModel(modelUrl, x, y, z, options)` - Create physics model
- `applyForce(entity, force, worldPoint)` - Apply force to entity
- `applyImpulse(entity, impulse, worldPoint)` - Apply impulse to entity
- `setVelocity(entity, velocity)` - Set entity velocity
- `getVelocity(entity)` - Get entity velocity
- `addCollisionHandler(entityA, entityB, handler)` - Add collision handler
- `removeCollisionHandler(entityA, entityB, handler)` - Remove collision handler

### Physics Components

- `RigidBodyComponent` - Physics body properties
- `ColliderComponent` - Collision shape definition
- `PhysicsMaterialComponent` - Material properties

### Physics Systems

- `PhysicsWorld` - Cannon.js world management
- `PhysicsSystem` - Physics simulation and sync
- `CollisionSystem` - Collision detection and events

This integration provides a robust, performance-optimized physics system that seamlessly integrates with your ECS architecture while maintaining the modular design principles of your game engine.
