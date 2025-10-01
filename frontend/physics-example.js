import { GameEngine } from './game-engine.js';

// Example usage of the physics integration
class PhysicsExample {
    constructor() {
        this.gameEngine = new GameEngine();
        
        this.setupPhysicsDemo();
        
        // Initialize camera collision system AFTER physics objects are created
        this.gameEngine.initializeCameraCollision();
        
        // Debug: Test if camera collision system is working
        console.log('Camera collision system initialized:', !!this.gameEngine.cameraCollisionSystem);
        console.log('Camera collision enabled:', this.gameEngine.cameraCollisionSystem?.cameraCollision?.active);
        console.log('Physics bodies after setup:', this.gameEngine.physicsWorld.world.bodies.length);
    }

    setupPhysicsDemo() {
        // Create a physics ground plane
        const ground = this.gameEngine.addPhysicsPlane(0, -2, 0, 0x888888, 20, 20, {
            type: 'static',
            mass: 0
        });
        console.log('Ground created:', ground);
        console.log('Physics bodies after ground creation:', this.gameEngine.physicsWorld.world.bodies.length);
        
        // Debug: Check if ground has physics components
        const groundRigidBody = ground.getComponent('RigidBodyComponent');
        const groundCollider = ground.getComponent('ColliderComponent');
        console.log('Ground physics components:', {
            rigidBody: !!groundRigidBody,
            collider: !!groundCollider,
            rigidBodyType: groundRigidBody?.type,
            rigidBodyMass: groundRigidBody?.mass
        });

        // Create physics cubes with different properties - spread them out
        const cube1 = this.gameEngine.addPhysicsCube(-3, 5, -2, 0xff0000, 1, {
            mass: 1,
            type: 'dynamic',
            linearDamping: 0.01,
            angularDamping: 0.01
        });
        console.log('Cube1 created:', cube1);
        console.log('Physics bodies after cube1 creation:', this.gameEngine.physicsWorld.world.bodies.length);

        const cube2 = this.gameEngine.addPhysicsCube(3, 8, 2, 0x00ff00, 0.8, {
            mass: 0.5,
            type: 'dynamic',
            linearDamping: 0.02,
            angularDamping: 0.02
        });

        // Create physics spheres - spread them out
        const sphere1 = this.gameEngine.addPhysicsSphere(-5, 6, 3, 0x0000ff, 0.5, {
            mass: 0.8,
            type: 'dynamic'
        });

        const sphere2 = this.gameEngine.addPhysicsSphere(5, 10, -3, 0xffff00, 0.3, {
            mass: 0.3,
            type: 'dynamic'
        });

        // Create physics cylinders - spread them out
        const cylinder1 = this.gameEngine.addPhysicsCylinder(6, 3, 4, 0xff00ff, 0.4, 2, {
            mass: 1.5,
            type: 'dynamic'
        });

        const cylinder2 = this.gameEngine.addPhysicsCylinder(-6, 3, -4, 0x00ffff, 0.4, 2, {
            mass: 1.5,
            type: 'dynamic'
        });

        // Add collision handlers
        this.gameEngine.addCollisionHandler(cube1, sphere1, (entityA, entityB, type, event) => {
            if (type === 'begin') {
                // Change color on collision
                const meshA = entityA.getComponent('MeshComponent');
                const meshB = entityB.getComponent('MeshComponent');
                if (meshA) meshA.mesh.material.color.setHex(0xff8800);
                if (meshB) meshB.mesh.material.color.setHex(0x8800ff);
            }
        });

        // Apply forces after a delay
        setTimeout(() => {
            this.gameEngine.applyForce(cube1, { x: 0, y: 0, z: -5 }, { x: 0, y: 0, z: 0 });
            this.gameEngine.applyImpulse(sphere1, { x: 2, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        }, 2000);

        // Create a physics cube field
        const cubeField = this.gameEngine.addPhysicsCubeField(25, 1.5, 0x00ff00, 0.3, {
            mass: 0.2,
            type: 'dynamic'
        });

        // Add some random forces to the cube field
        setTimeout(() => {
            cubeField.forEach((cube, index) => {
                if (index % 3 === 0) {
                    const force = {
                        x: (Math.random() - 0.5) * 10,
                        y: Math.random() * 5,
                        z: (Math.random() - 0.5) * 10
                    };
                    this.gameEngine.applyForce(cube, force, { x: 0, y: 0, z: 0 });
                }
            });
        }, 3000);
    }

    // Method to add more physics objects dynamically
    addRandomPhysicsObject() {
        const x = (Math.random() - 0.5) * 10;
        const z = (Math.random() - 0.5) * 10;
        const y = Math.random() * 5 + 5;
        const color = Math.random() * 0xffffff;
        const size = Math.random() * 0.5 + 0.3;

        const object = this.gameEngine.addPhysicsCube(x, y, z, color, size, {
            mass: Math.random() * 2 + 0.5,
            type: 'dynamic'
        });

        // Apply random initial velocity
        const velocity = {
            x: (Math.random() - 0.5) * 5,
            y: Math.random() * 2,
            z: (Math.random() - 0.5) * 5
        };
        this.gameEngine.setVelocity(object, velocity);

        return object;
    }

    // Method to create a physics tower
    createPhysicsTower() {
        const tower = [];
        const startX = (Math.random() - 0.5) * 8; // Random X position
        const startZ = (Math.random() - 0.5) * 8; // Random Z position
        for (let i = 0; i < 10; i++) {
            const cube = this.gameEngine.addPhysicsCube(startX, i * 1.1, startZ, 0x888888, 1, {
                mass: 1,
                type: 'dynamic'
            });
            tower.push(cube);
        }
        return tower;
    }

    // Method to create physics dominoes
    createPhysicsDominoes() {
        const dominoes = [];
        const startX = (Math.random() - 0.5) * 6; // Random starting X position
        const startZ = (Math.random() - 0.5) * 6; // Random starting Z position
        for (let i = 0; i < 10; i++) {
            const domino = this.gameEngine.addPhysicsCube(startX + i * 1.2, 0.5, startZ, 0xffffff, 0.2, {
                mass: 0.5,
                type: 'dynamic'
            });
            dominoes.push(domino);
        }
        return dominoes;
    }

    // Get physics performance stats
    getPhysicsStats() {
        return this.gameEngine.getPerformanceStats();
    }

    // Camera collision methods
    toggleCameraCollision() {
        if (this.gameEngine.cameraCollisionSystem && this.gameEngine.cameraCollisionSystem.cameraCollision) {
            const isActive = this.gameEngine.cameraCollisionSystem.cameraCollision.active;
            if (isActive) {
                this.gameEngine.disableCameraCollision();
            } else {
                this.gameEngine.enableCameraCollision();
            }
        }
    }

    resetCameraPosition() {
        // Reset camera to initial position
        this.gameEngine.camera.position.set(0, 2, 5);
        this.gameEngine.camera.lookAt(0, 0, 0);
        
        // Update camera collision system
        if (this.gameEngine.cameraCollisionSystem) {
            this.gameEngine.cameraCollisionSystem.updateCameraPosition(this.gameEngine.camera.position);
        }
        
    }

    setCameraCollisionSize(radius, height) {
        this.gameEngine.setCameraCollisionRadius(radius);
        this.gameEngine.setCameraCollisionHeight(height);
    }

    testCameraCollision() {
        this.gameEngine.testCameraCollision();
    }
}

// Export for use in other files
export { PhysicsExample };

// Auto-start example if this file is run directly
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const physicsExample = new PhysicsExample();
        
        // Add some interactive controls
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyP':
                    physicsExample.addRandomPhysicsObject();
                    break;
                case 'KeyT':
                    physicsExample.createPhysicsTower();
                    break;
                case 'KeyD':
                    physicsExample.createPhysicsDominoes();
                    break;
                case 'KeyS':
                    physicsExample.getPhysicsStats();
                    break;
                case 'KeyC':
                    physicsExample.toggleCameraCollision();
                    break;
                case 'KeyR':
                    physicsExample.resetCameraPosition();
                    break;
                case 'KeyQ':
                    physicsExample.testCameraCollision();
                    break;
            }
        });

    });
}
