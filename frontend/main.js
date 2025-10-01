import { GameEngine } from './game-engine.js';
import { PhysicsExample } from './physics-example.js';

// Initialize the game
const game = new GameEngine();

// Initialize physics example
const physicsExample = new PhysicsExample();

// Make physics example globally available for console access
window.physicsExample = physicsExample;
window.game = game;



// === PHYSICS EXAMPLE CONTROLS ===
// You can use these in the browser console or add UI controls:

// Physics Example Controls:
// P - Add random physics object
// T - Create physics tower
// D - Create physics dominoes
// S - Show physics stats
// C - Toggle camera collision
// R - Reset camera position

// Console commands:
// physicsExample.addRandomPhysicsObject();  // Add random physics object
// physicsExample.createPhysicsTower();      // Create physics tower
// physicsExample.createPhysicsDominoes();   // Create physics dominoes
// physicsExample.getPhysicsStats();         // Get physics performance stats

// Game engine controls:
// game.addPhysicsCube(x, y, z, color, size, options);     // Add physics cube
// game.addPhysicsSphere(x, y, z, color, radius, options); // Add physics sphere
// game.applyForce(entity, force, worldPoint);             // Apply force
// game.applyImpulse(entity, impulse, worldPoint);        // Apply impulse

// Camera collision controls:
// game.enableCameraCollision();                           // Enable camera collision
// game.disableCameraCollision();                          // Disable camera collision
// game.setCameraCollisionRadius(0.5);                     // Set collision radius
// game.setCameraCollisionHeight(1.8);                     // Set collision height
// game.testCameraCollision();                             // Test camera collision debug