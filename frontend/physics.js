import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { TransformComponent } from './ecs.js';

// Physics Material Pool for performance
class PhysicsMaterialPool {
    constructor() {
        this.materials = new Map();
    }

    getMaterial(name, options = {}) {
        if (!this.materials.has(name)) {
            this.materials.set(name, new CANNON.Material(name));
        }
        return this.materials.get(name);
    }

    getContactMaterial(materialA, materialB, options = {}) {
        const key = `${materialA.name}_${materialB.name}`;
        if (!this.materials.has(key)) {
            const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, options);
            this.materials.set(key, contactMaterial);
        }
        return this.materials.get(key);
    }
}

// Global physics material pool
const physicsMaterialPool = new PhysicsMaterialPool();

// Physics Components
class RigidBodyComponent {
    constructor(options = {}) {
        this.active = true;
        this.body = null;
        this.type = options.type || 'dynamic'; // 'dynamic', 'kinematic', 'static'
        this.mass = options.mass || 1;
        this.material = options.material || physicsMaterialPool.getMaterial('default');
        this.linearDamping = options.linearDamping || 0.01;
        this.angularDamping = options.angularDamping || 0.01;
        this.allowSleep = options.allowSleep !== false;
        this.sleepSpeedLimit = options.sleepSpeedLimit || 0.1;
        this.sleepTimeLimit = options.sleepTimeLimit || 1;
        this.isInitialized = false;
    }

    initialize(shape) {
        if (this.isInitialized) return;

        this.body = new CANNON.Body({
            mass: this.type === 'static' ? 0 : this.mass,
            material: this.material,
            shape: shape,
            linearDamping: this.linearDamping,
            angularDamping: this.angularDamping,
            allowSleep: this.allowSleep,
            sleepSpeedLimit: this.sleepSpeedLimit,
            sleepTimeLimit: this.sleepTimeLimit
        });

        this.isInitialized = true;
    }

    setPosition(x, y, z) {
        if (this.body) {
            this.body.position.set(x, y, z);
        }
    }

    setRotation(x, y, z, w) {
        if (this.body) {
            this.body.quaternion.set(x, y, z, w);
        }
    }

    applyForce(force, worldPoint) {
        if (this.body) {
            this.body.applyForce(force, worldPoint);
        }
    }

    applyImpulse(impulse, worldPoint) {
        if (this.body) {
            this.body.applyImpulse(impulse, worldPoint);
        }
    }

    setVelocity(velocity) {
        if (this.body) {
            this.body.velocity.set(velocity.x, velocity.y, velocity.z);
        }
    }

    getVelocity() {
        if (this.body) {
            return new THREE.Vector3(
                this.body.velocity.x,
                this.body.velocity.y,
                this.body.velocity.z
            );
        }
        return new THREE.Vector3(0, 0, 0);
    }

    wakeUp() {
        if (this.body) {
            this.body.wakeUp();
        }
    }

    sleep() {
        if (this.body) {
            this.body.sleep();
        }
    }
}

class ColliderComponent {
    constructor(shape, options = {}) {
        this.active = true;
        this.shape = shape;
        this.offset = options.offset || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.isTrigger = options.isTrigger || false;
        this.collisionFilterGroup = options.collisionFilterGroup || 1;
        this.collisionFilterMask = options.collisionFilterMask || -1;
    }
}

class PhysicsMaterialComponent {
    constructor(options = {}) {
        this.active = true;
        this.name = options.name || 'default';
        this.friction = options.friction || 0.3;
        this.restitution = options.restitution || 0.3;
        this.contactEquationStiffness = options.contactEquationStiffness || 1e8;
        this.contactEquationRelaxation = options.contactEquationRelaxation || 3;
        this.material = physicsMaterialPool.getMaterial(this.name, {
            friction: this.friction,
            restitution: this.restitution,
            contactEquationStiffness: this.contactEquationStiffness,
            contactEquationRelaxation: this.contactEquationRelaxation
        });
    }
}

// Camera Collision Component
class CameraCollisionComponent {
    constructor(options = {}) {
        this.active = true;
        this.radius = options.radius || 0.5;
        this.height = options.height || 1.8;
        this.offset = options.offset || { x: 0, y: this.height / 2, z: 0 };
        this.collisionBody = null;
        this.isInitialized = false;
        this.lastValidPosition = new THREE.Vector3();
        this.collisionDetected = false;
    }

    initialize(physicsWorld) {
        if (this.isInitialized) return;

        // Create a box shape for the camera collision (much simpler!)
        const shape = new CANNON.Box(new CANNON.Vec3(this.radius, this.height/2, this.radius));
        this.collisionBody = new CANNON.Body({
            mass: 0, // Kinematic body
            type: CANNON.Body.KINEMATIC,
            shape: shape,
            material: physicsMaterialPool.getMaterial('camera')
        });

        this.isInitialized = true;
    }

    setPosition(x, y, z) {
        if (this.collisionBody) {
            this.collisionBody.position.set(x, y, z);
        }
    }

    getPosition() {
        if (this.collisionBody) {
            return {
                x: this.collisionBody.position.x,
                y: this.collisionBody.position.y,
                z: this.collisionBody.position.z
            };
        }
        return { x: 0, y: 0, z: 0 };
    }

    updateLastValidPosition(x, y, z) {
        this.lastValidPosition.set(x, y, z);
    }

    getLastValidPosition() {
        return this.lastValidPosition.clone();
    }
}

// Physics World Manager
class PhysicsWorld {
    constructor(options = {}) {
        this.world = new CANNON.World();
        this.world.gravity.set(0, options.gravity || -9.82, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = options.solverIterations || 10;
        this.world.solver.tolerance = options.solverTolerance || 0.1;
        this.world.allowSleep = options.allowSleep !== false;
        console.log('Physics world initialized with gravity:', this.world.gravity.y);
        
        // Contact material manager
        this.contactMaterials = new Map();
        
        // Collision event handlers
        this.collisionListeners = new Map();
        
        // Performance monitoring
        this.stepCount = 0;
        this.lastStepTime = 0;
    }

    addBody(body) {
        this.world.addBody(body);
    }

    removeBody(body) {
        this.world.removeBody(body);
    }

    addContactMaterial(contactMaterial) {
        this.world.addContactMaterial(contactMaterial);
        const key = `${contactMaterial.materials[0].name}_${contactMaterial.materials[1].name}`;
        this.contactMaterials.set(key, contactMaterial);
    }

    step(deltaTime) {
        const startTime = performance.now();
        this.world.step(deltaTime);
        this.lastStepTime = performance.now() - startTime;
        this.stepCount++;
    }

    addCollisionListener(bodyA, bodyB, callback) {
        const key = `${bodyA.id}_${bodyB.id}`;
        this.collisionListeners.set(key, callback);
    }

    removeCollisionListener(bodyA, bodyB) {
        const key = `${bodyA.id}_${bodyB.id}`;
        this.collisionListeners.delete(key);
    }

    getPerformanceStats() {
        return {
            stepCount: this.stepCount,
            lastStepTime: this.lastStepTime,
            bodyCount: this.world.bodies.length,
            contactCount: this.world.contacts.length
        };
    }
}

// Physics System
class PhysicsSystem {
    constructor(physicsWorld) {
        this.physicsWorld = physicsWorld;
        this.entities = [];
        this.syncEntities = new Map(); // Map physics bodies to entities for syncing
    }

    addEntity(entity) {
        console.log('PhysicsSystem.addEntity called for entity:', entity.id);
        this.entities.push(entity);
        
        const rigidBody = entity.getComponent(RigidBodyComponent);
        const collider = entity.getComponent(ColliderComponent);
        const transform = entity.getComponent(TransformComponent);
        
        console.log('Physics components found:', {
            rigidBody: !!rigidBody,
            collider: !!collider,
            transform: !!transform
        });
        
        
        if (rigidBody && collider) {
            // Initialize rigid body with collider shape
            rigidBody.initialize(collider.shape);
            
            // Set initial position from transform component
            if (transform && rigidBody.body) {
                rigidBody.body.position.set(
                    transform.position.x,
                    transform.position.y,
                    transform.position.z
                );
                
                // Set initial rotation from transform component
                const quaternion = new THREE.Quaternion().setFromEuler(transform.rotation);
                rigidBody.body.quaternion.set(
                    quaternion.x,
                    quaternion.y,
                    quaternion.z,
                    quaternion.w
                );
            }
            
            // Add to physics world
            this.physicsWorld.addBody(rigidBody.body);
            console.log('Physics body added to world. Total bodies:', this.physicsWorld.world.bodies.length);
            console.log('Physics body details:', {
                type: rigidBody.type,
                mass: rigidBody.mass,
                position: rigidBody.body.position,
                shape: rigidBody.body.shapes[0]?.type
            });
            
            // Add to sync map
            this.syncEntities.set(rigidBody.body, entity);
            
        }
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }

        const rigidBody = entity.getComponent(RigidBodyComponent);
        if (rigidBody && rigidBody.body) {
            this.physicsWorld.removeBody(rigidBody.body);
            this.syncEntities.delete(rigidBody.body);
        }
    }

    update(deltaTime) {
        // Step physics simulation
        this.physicsWorld.step(deltaTime);
        
        // Sync physics bodies with visual representations
        this.syncPhysicsToVisual();
    }

    syncPhysicsToVisual() {
        for (const [body, entity] of this.syncEntities) {
            const transform = entity.getComponent(TransformComponent);
            if (transform) {
                // Update position
                transform.position.set(
                    body.position.x,
                    body.position.y,
                    body.position.z
                );
                
                // Update rotation
                transform.rotation.setFromQuaternion(
                    new THREE.Quaternion(
                        body.quaternion.x,
                        body.quaternion.y,
                        body.quaternion.z,
                        body.quaternion.w
                    )
                );
            }
        }
    }

    syncVisualToPhysics() {
        for (const [body, entity] of this.syncEntities) {
            const transform = entity.getComponent(TransformComponent);
            if (transform) {
                // Update physics body position
                body.position.set(
                    transform.position.x,
                    transform.position.y,
                    transform.position.z
                );
                
                // Update physics body rotation
                const quaternion = new THREE.Quaternion().setFromEuler(transform.rotation);
                body.quaternion.set(
                    quaternion.x,
                    quaternion.y,
                    quaternion.z,
                    quaternion.w
                );
            }
        }
    }

    // Apply forces to entities
    applyForce(entity, force, worldPoint) {
        const rigidBody = entity.getComponent(RigidBodyComponent);
        if (rigidBody) {
            rigidBody.applyForce(force, worldPoint);
        }
    }

    applyImpulse(entity, impulse, worldPoint) {
        const rigidBody = entity.getComponent(RigidBodyComponent);
        if (rigidBody) {
            rigidBody.applyImpulse(impulse, worldPoint);
        }
    }

    setVelocity(entity, velocity) {
        const rigidBody = entity.getComponent(RigidBodyComponent);
        if (rigidBody) {
            rigidBody.setVelocity(velocity);
        }
    }

    getVelocity(entity) {
        const rigidBody = entity.getComponent(RigidBodyComponent);
        if (rigidBody) {
            return rigidBody.getVelocity();
        }
        return new THREE.Vector3(0, 0, 0);
    }
}

// Camera Collision System
class CameraCollisionSystem {
    constructor(physicsWorld, camera, controls) {
        this.physicsWorld = physicsWorld;
        this.camera = camera;
        this.controls = controls;
        this.lastValidPosition = new THREE.Vector3();
        this.collisionDetected = false;
        this.cameraRadius = 0.5; // Camera collision radius
        
        // Camera collision properties
        this.cameraCollision = {
            active: true,  // Enable by default
            radius: 0.5,
            height: 1.0
        };
        
        this.setupCameraCollision();
    }

    setupCameraCollision() {
        // Set initial position
        this.lastValidPosition.copy(this.camera.position);
    }

    setupCollisionDetection() {
        // We'll check collisions in the update method instead of using postStep
        // This gives us more control over when collision detection happens
    }

    checkCameraCollisions() {
        // Check if camera collision is active
        if (!this.cameraCollision.active) {
            return;
        }
        
        // Get current camera position
        const currentPos = this.camera.position;
        
        // Debug: Log camera position and body count every 60 frames
        if (Math.floor(Date.now() / 100) % 60 === 0) {
            console.log('Camera pos:', currentPos.x.toFixed(2), currentPos.y.toFixed(2), currentPos.z.toFixed(2));
            console.log('Physics bodies:', this.physicsWorld.world.bodies.length);
        }
        
        // Check for collisions using simple distance-based detection
        let collisionDetected = false;
        
        for (let i = 0; i < this.physicsWorld.world.bodies.length; i++) {
            const body = this.physicsWorld.world.bodies[i];
            
            // Skip kinematic bodies (like camera collision body if it exists)
            if (body.type === CANNON.Body.KINEMATIC) continue;
            
            // Skip ground plane (allow walking on ground)
            if (body.type === CANNON.Body.STATIC && body.position.y < -0.5) continue;
            
            // Calculate distance between camera and physics body
            const distance = currentPos.distanceTo(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
            
            // Get collision radius based on body shape
            let bodyRadius = 0.5; // Default radius
            if (body.shapes && body.shapes.length > 0) {
                const shape = body.shapes[0];
                if (shape.type === CANNON.Shape.types.SPHERE) {
                    bodyRadius = shape.radius;
                } else if (shape.type === CANNON.Shape.types.BOX) {
                    // Use the largest dimension as radius
                    bodyRadius = Math.max(shape.halfExtents.x, shape.halfExtents.z);
                } else if (shape.type === CANNON.Shape.types.CYLINDER) {
                    bodyRadius = Math.max(shape.radiusTop, shape.radiusBottom);
                }
            }
            
            // Check if camera is too close to the body
            const minDistance = this.cameraRadius + bodyRadius + 0.1; // Small buffer
            
            if (distance < minDistance) {
                console.log('🚫 CAMERA COLLISION! Distance:', distance.toFixed(3), 'Min:', minDistance.toFixed(3));
                collisionDetected = true;
                break;
            }
        }

        // If collision detected, revert to last valid position
        if (collisionDetected && !this.collisionDetected) {
            console.log('📍 Reverting camera to safe position');
            this.revertToLastValidPosition();
        } else if (!collisionDetected) {
            // Update last valid position if no collision
            this.lastValidPosition.copy(currentPos);
        }

        this.collisionDetected = collisionDetected;
    }

    revertToLastValidPosition() {
        // Revert camera position
        this.camera.position.copy(this.lastValidPosition);
        
        // Update controls if they exist
        if (this.controls) {
            // For PointerLockControls, we need to update the camera position directly
            this.controls.getObject().position.copy(this.lastValidPosition);
        }
    }

    updateCameraPosition(newPosition) {
        // Only log every 30 frames to reduce spam
        if (Math.floor(Date.now() / 100) % 30 === 0) {
            console.log('Camera collision system called. Active:', this.cameraCollision.active);
            console.log('New position:', newPosition.x.toFixed(2), newPosition.y.toFixed(2), newPosition.z.toFixed(2));
        }
        
        // Check if the new position would cause a collision
        if (this.cameraCollision.active) {
            // Check for collisions at the new position
            const collisionDetected = this.checkPositionForCollision(newPosition);
            
            if (collisionDetected) {
                // Revert to last valid position if collision detected
                console.log('🚫 CAMERA COLLISION! Movement blocked');
                this.camera.position.copy(this.lastValidPosition);
                if (this.controls) {
                    this.controls.getObject().position.copy(this.lastValidPosition);
                }
            } else {
                // Update camera position and last valid position if no collision
                this.camera.position.copy(newPosition);
                this.lastValidPosition.copy(newPosition);
            }
        } else {
            // If collision is disabled, just update the camera position
            this.camera.position.copy(newPosition);
        }
    }

    checkPositionForCollision(position) {
        // Check for collisions at the given position
        for (let i = 0; i < this.physicsWorld.world.bodies.length; i++) {
            const body = this.physicsWorld.world.bodies[i];
            
            // Skip kinematic bodies
            if (body.type === CANNON.Body.KINEMATIC) continue;
            
            // Skip ground plane (allow walking on ground)
            if (body.type === CANNON.Body.STATIC && body.position.y < -0.5) continue;
            
            // Calculate distance between position and physics body
            const distance = position.distanceTo(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
            
            // Get collision radius based on body shape
            let bodyRadius = 0.5; // Default radius
            if (body.shapes && body.shapes.length > 0) {
                const shape = body.shapes[0];
                if (shape.type === CANNON.Shape.types.SPHERE) {
                    bodyRadius = shape.radius;
                } else if (shape.type === CANNON.Shape.types.BOX) {
                    // Use the largest dimension as radius
                    bodyRadius = Math.max(shape.halfExtents.x, shape.halfExtents.z);
                } else if (shape.type === CANNON.Shape.types.CYLINDER) {
                    bodyRadius = Math.max(shape.radiusTop, shape.radiusBottom);
                }
            }
            
            // Check if position is too close to the body
            const minDistance = this.cameraRadius + bodyRadius + 0.1; // Small buffer
            
            if (distance < minDistance) {
                console.log('🚫 COLLISION DETECTED! Distance:', distance.toFixed(3), 'Min:', minDistance.toFixed(3));
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }

    update(deltaTime) {
        // Check for camera collisions every frame
        this.checkCameraCollisions();
        
        // Debug: Log every 60 frames to see if system is running
        if (Math.floor(Date.now() / 100) % 60 === 0) {
            console.log('Camera collision system is running...');
        }
    }

    // ECS system methods (required by EntityManager)
    addEntity(entity) {
        // Camera collision system doesn't need to track entities
        // It works directly with the camera and physics world
    }

    removeEntity(entity) {
        // Camera collision system doesn't need to track entities
        // It works directly with the camera and physics world
    }

    destroy() {
        // Simple camera collision doesn't need cleanup
    }
}

// Collision Detection System
class CollisionSystem {
    constructor(physicsWorld) {
        this.physicsWorld = physicsWorld;
        this.collisionEvents = new Map();
        this.setupCollisionDetection();
    }

    setupCollisionDetection() {
        this.physicsWorld.world.addEventListener('beginContact', (event) => {
            this.handleCollision(event, 'begin');
        });

        this.physicsWorld.world.addEventListener('endContact', (event) => {
            this.handleCollision(event, 'end');
        });
    }

    handleCollision(event, type) {
        const { bi: bodyA, bj: bodyB } = event;
        
        // Find entities associated with these bodies
        const entityA = this.findEntityByBody(bodyA);
        const entityB = this.findEntityByBody(bodyB);
        
        if (entityA && entityB) {
            this.triggerCollisionEvent(entityA, entityB, type, event);
        }
    }

    findEntityByBody(body) {
        // This would need to be implemented based on your entity management
        // For now, we'll assume entities are stored with their physics bodies
        return null; // Placeholder
    }

    triggerCollisionEvent(entityA, entityB, type, event) {
        const eventKey = `${entityA.id}_${entityB.id}`;
        const handlers = this.collisionEvents.get(eventKey);
        
        if (handlers) {
            handlers.forEach(handler => {
                handler(entityA, entityB, type, event);
            });
        }
    }

    addCollisionHandler(entityA, entityB, handler) {
        const eventKey = `${entityA.id}_${entityB.id}`;
        if (!this.collisionEvents.has(eventKey)) {
            this.collisionEvents.set(eventKey, []);
        }
        this.collisionEvents.get(eventKey).push(handler);
    }

    removeCollisionHandler(entityA, entityB, handler) {
        const eventKey = `${entityA.id}_${entityB.id}`;
        const handlers = this.collisionEvents.get(eventKey);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
}

// Shape Factory for common physics shapes
class PhysicsShapeFactory {
    static createBoxShape(width, height, depth) {
        return new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2));
    }

    static createSphereShape(radius) {
        return new CANNON.Sphere(radius);
    }

    static createPlaneShape() {
        return new CANNON.Plane();
    }

    static createCylinderShape(radiusTop, radiusBottom, height, numSegments = 8) {
        return new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
    }

    static createConeShape(radius, height) {
        return new CANNON.Cone(radius, height);
    }

    static createConvexShape(vertices) {
        const cannonVertices = vertices.map(v => new CANNON.Vec3(v.x, v.y, v.z));
        return new CANNON.ConvexPolyhedron(cannonVertices);
    }

    static createTrimeshShape(vertices, indices) {
        const cannonVertices = vertices.map(v => new CANNON.Vec3(v.x, v.y, v.z));
        const cannonIndices = indices.flat();
        return new CANNON.Trimesh(cannonVertices, cannonIndices);
    }
}

export {
    RigidBodyComponent,
    ColliderComponent,
    PhysicsMaterialComponent,
    CameraCollisionComponent,
    PhysicsWorld,
    PhysicsSystem,
    CameraCollisionSystem,
    CollisionSystem,
    PhysicsShapeFactory,
    physicsMaterialPool
};
