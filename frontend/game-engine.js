import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { EntityManager, MovementSystem, RotationSystem, RenderSystem, TransformComponent, MeshComponent, ModelComponent, RotationComponent, EntityFactory } from './ecs.js';
import { PhysicsWorld, PhysicsSystem, CollisionSystem, CameraCollisionSystem } from './physics.js';

class GameEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.cube = null;
        this.isPointerLocked = false;
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };
        this.moveSpeed = 0.02;
        
        // ECS
        this.entityManager = new EntityManager();
        this.entityFactory = null; // Will be initialized after scene setup
        this.lastTime = 0;
        
        // Physics
        this.physicsWorld = null;
        this.physicsSystem = null;
        this.collisionSystem = null;
        this.cameraCollisionSystem = null;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupControls();
        this.setupECS();
        this.createCube();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }

    setupScene() {
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    }

    setupCamera() {
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);
    }

    setupControls() {
        // Free camera movement with pointer lock
        this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
        // Don't add controls object to scene - it manages the camera directly
    }

    setupECS() {
        // Initialize physics world
        this.physicsWorld = new PhysicsWorld({
            gravity: -9.82,
            solverIterations: 10,
            allowSleep: true
        });
        
        // Initialize physics systems
        this.physicsSystem = new PhysicsSystem(this.physicsWorld);
        this.collisionSystem = new CollisionSystem(this.physicsWorld);
        
        // Initialize camera collision system after controls are set up
        this.cameraCollisionSystem = null;
        
        // Add ECS systems
        this.entityManager.addSystem(new MovementSystem());
        this.entityManager.addSystem(new RotationSystem());
        this.entityManager.addSystem(new RenderSystem(this.scene));
        this.entityManager.addSystem(this.physicsSystem);
        console.log('Physics system added to entity manager:', !!this.physicsSystem);
        
        // Initialize entity factory
        this.entityFactory = new EntityFactory(this.entityManager, this.scene);
    }

    initializeCameraCollision() {
        this.cameraCollisionSystem = new CameraCollisionSystem(this.physicsWorld, this.camera, this.controls);
        
        // Add camera collision system to entity manager so it gets updated every frame
        this.entityManager.addSystem(this.cameraCollisionSystem);
    }

    createCube() {
        // Create cube using EntityFactory (much simpler!)
        const cubeEntity = this.entityFactory.createRotatingCube(0, 0, 0, 0x00ff00, 1, 0.01);
        
        // Store reference for backward compatibility
        const meshComponent = cubeEntity.getComponent(MeshComponent);
        this.cube = meshComponent.mesh;

        // Example: Add some more objects to demonstrate the factory
        this.setupExampleScene();

        // Add lighting
        this.setupLighting();
        
        // Initialize camera collision system after everything is set up
        this.initializeCameraCollision();
    }

    setupExampleScene() {
        // Add a physics ground plane
        this.entityFactory.createPhysicsPlane(0, -1, 0, 0x888888, 20, 20);
        
        // Add some physics cubes in a circle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const z = Math.sin(angle) * 3;
            const color = new THREE.Color().setHSL(i / 8, 0.7, 0.5).getHex();
            this.entityFactory.createPhysicsCube(x, 2, z, color, 0.5, {
                mass: 1,
                type: 'dynamic'
            });
        }
        
        // Add some physics spheres
        this.entityFactory.createPhysicsSphere(0, 5, 0, 0xff0000, 0.3, {
            mass: 0.5,
            type: 'dynamic'
        });
        this.entityFactory.createPhysicsSphere(2, 3, 2, 0x0000ff, 0.4, {
            mass: 0.8,
            type: 'dynamic'
        });
        this.entityFactory.createPhysicsSphere(-2, 3, -2, 0xffff00, 0.4, {
            mass: 0.8,
            type: 'dynamic'
        });
        
        // Add some physics cylinders
        this.entityFactory.createPhysicsCylinder(4, 1, 0, 0x00ff00, 0.3, 2, {
            mass: 2,
            type: 'dynamic'
        });
        this.entityFactory.createPhysicsCylinder(-4, 1, 0, 0xff00ff, 0.3, 2, {
            mass: 2,
            type: 'dynamic'
        });
    }

    // Add more entities to your world
    addMoreCubes() {
        // Add some random cubes
        for (let i = 0; i < 5; i++) {
            const x = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 20;
            const color = Math.random() * 0xffffff;
            this.addCube(x, 0, z, color, Math.random() * 0.5 + 0.5);
        }
    }

    addMoreSpinningCubes() {
        // Add spinning cubes in a pattern
        const positions = [
            [5, 0, 0], [-5, 0, 0], [0, 0, 5], [0, 0, -5],
            [3, 1, 3], [-3, 1, -3], [3, 1, -3], [-3, 1, 3]
        ];
        
        positions.forEach((pos, i) => {
            const color = new THREE.Color().setHSL(i / positions.length, 0.8, 0.6).getHex();
            this.addRotatingCube(pos[0], pos[1], pos[2], color, 0.8, 0.03);
        });
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        document.addEventListener('keyup', (event) => this.onKeyUp(event));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Pointer lock for FPS-style controls
        this.renderer.domElement.addEventListener('click', () => this.requestPointerLock());
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
                this.moveState.forward = true;
                break;
            case 'KeyS':
                this.moveState.backward = true;
                break;
            case 'KeyA':
                this.moveState.left = true;
                break;
            case 'KeyD':
                this.moveState.right = true;
                break;
            case 'Space':
                this.moveState.up = true;
                event.preventDefault(); // Prevent page scroll
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.moveState.down = true;
                break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
                this.moveState.forward = false;
                break;
            case 'KeyS':
                this.moveState.backward = false;
                break;
            case 'KeyA':
                this.moveState.left = false;
                break;
            case 'KeyD':
                this.moveState.right = false;
                break;
            case 'Space':
                this.moveState.up = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.moveState.down = false;
                break;
        }
    }

    onWindowResize() {
        this.camera.aspect = (window.innerWidth - 20) / (window.innerHeight - 20);
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth - 20, window.innerHeight - 20);
    }

    requestPointerLock() {
        this.renderer.domElement.requestPointerLock();
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    }

    updateMovement() {
        if (!this.isPointerLocked) return;

        // Store current position for collision checking
        const currentPosition = this.camera.position.clone();
        const newPosition = this.camera.position.clone();

        // Calculate new position based on movement
        if (this.moveState.forward) {
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0; // Keep movement horizontal
            forward.normalize();
            newPosition.add(forward.multiplyScalar(this.moveSpeed));
        }
        if (this.moveState.backward) {
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            forward.y = 0; // Keep movement horizontal
            forward.normalize();
            newPosition.add(forward.multiplyScalar(-this.moveSpeed));
        }
        if (this.moveState.left) {
            const right = new THREE.Vector3();
            this.camera.getWorldDirection(right);
            right.y = 0; // Keep movement horizontal
            right.cross(this.camera.up).normalize();
            newPosition.add(right.multiplyScalar(-this.moveSpeed));
        }
        if (this.moveState.right) {
            const right = new THREE.Vector3();
            this.camera.getWorldDirection(right);
            right.y = 0; // Keep movement horizontal
            right.cross(this.camera.up).normalize();
            newPosition.add(right.multiplyScalar(this.moveSpeed));
        }
        
        // Vertical movement
        if (this.moveState.up) newPosition.y += this.moveSpeed;
        if (this.moveState.down) newPosition.y -= this.moveSpeed;

        // Update camera collision system with new position
        if (this.cameraCollisionSystem) {
            this.cameraCollisionSystem.updateCameraPosition(newPosition);
        } else {
            // Fallback: update camera position directly
            this.camera.position.copy(newPosition);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Calculate delta time
        const currentTime = performance.now();
        const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
        this.lastTime = currentTime;
        
        this.updateMovement();
        
        // Update ECS systems
        this.entityManager.update(deltaTime);
        
        // Update camera collision system
        if (this.cameraCollisionSystem) {
            this.cameraCollisionSystem.update(deltaTime);
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    // Public methods for easy entity creation
    addCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1) {
        return this.entityFactory.createCube(x, y, z, color, size);
    }

    addRotatingCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, rotationSpeed = 0.01) {
        return this.entityFactory.createRotatingCube(x, y, z, color, size, rotationSpeed);
    }

    addMovingCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, speed = 0.02) {
        return this.entityFactory.createMovingCube(x, y, z, color, size, speed);
    }

    addSphere(x = 0, y = 0, z = 0, color = 0xff0000, radius = 0.5) {
        return this.entityFactory.createSphere(x, y, z, color, radius);
    }

    addPlane(x = 0, y = 0, z = 0, color = 0x888888, width = 10, height = 10) {
        return this.entityFactory.createPlane(x, y, z, color, width, height);
    }

    addCustomEntity(geometry, material, x = 0, y = 0, z = 0) {
        return this.entityFactory.createEntity(geometry, material, x, y, z);
    }

    removeEntity(entity) {
        this.entityFactory.destroyEntity(entity);
    }

    // HIGH PERFORMANCE: Batch operations for creating many objects
    addCubeField(count = 100, spacing = 2, color = 0x00ff00, size = 1) {
        return this.entityFactory.createCubeField(count, spacing, color, size);
    }

    addInstancedCubes(count, positions, color = 0x00ff00, size = 1) {
        const geometry = this.entityFactory.geometryPool.getBoxGeometry(size);
        const material = this.entityFactory.geometryPool.getMaterial(color);
        return this.entityFactory.createInstancedMesh(geometry, material, count, positions);
    }

    // HIGH PERFORMANCE: Create many objects in one call
    addBatch(type, count, positions, colors, sizes) {
        return this.entityFactory.createBatch(type, count, positions, colors, sizes);
    }

    // Add GLB model to scene
    async addModel(modelUrl, x = 0, y = 0, z = 0) {
        return await this.entityFactory.createModelEntity(modelUrl, x, y, z);
    }

    // PHYSICS-ENABLED ENTITY CREATION METHODS

    // Create physics-enabled entities
    addPhysicsCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, options = {}) {
        return this.entityFactory.createPhysicsCube(x, y, z, color, size, options);
    }

    addPhysicsSphere(x = 0, y = 0, z = 0, color = 0xff0000, radius = 0.5, options = {}) {
        return this.entityFactory.createPhysicsSphere(x, y, z, color, radius, options);
    }

    addPhysicsPlane(x = 0, y = 0, z = 0, color = 0x888888, width = 10, height = 10, options = {}) {
        return this.entityFactory.createPhysicsPlane(x, y, z, color, width, height, options);
    }

    addPhysicsCylinder(x = 0, y = 0, z = 0, color = 0x0000ff, radius = 0.5, height = 2, options = {}) {
        return this.entityFactory.createPhysicsCylinder(x, y, z, color, radius, height, options);
    }

    async addPhysicsModel(modelUrl, x = 0, y = 0, z = 0, options = {}) {
        return await this.entityFactory.createPhysicsModelEntity(modelUrl, x, y, z, options);
    }

    // Create physics-enabled batch operations
    addPhysicsCubeField(count = 100, spacing = 2, color = 0x00ff00, size = 1, physicsOptions = {}) {
        return this.entityFactory.createPhysicsCubeField(count, spacing, color, size, physicsOptions);
    }

    addPhysicsBatch(type, count, positions, colors, sizes, physicsOptions = {}) {
        return this.entityFactory.createPhysicsBatch(type, count, positions, colors, sizes, physicsOptions);
    }

    // Physics control methods
    applyForce(entity, force, worldPoint) {
        if (this.physicsSystem) {
            this.physicsSystem.applyForce(entity, force, worldPoint);
        }
    }

    applyImpulse(entity, impulse, worldPoint) {
        if (this.physicsSystem) {
            this.physicsSystem.applyImpulse(entity, impulse, worldPoint);
        }
    }

    setVelocity(entity, velocity) {
        if (this.physicsSystem) {
            this.physicsSystem.setVelocity(entity, velocity);
        }
    }

    getVelocity(entity) {
        if (this.physicsSystem) {
            return this.physicsSystem.getVelocity(entity);
        }
        return new THREE.Vector3(0, 0, 0);
    }

    // Add collision handler between two entities
    addCollisionHandler(entityA, entityB, handler) {
        if (this.collisionSystem) {
            this.collisionSystem.addCollisionHandler(entityA, entityB, handler);
        }
    }

    // Remove collision handler between two entities
    removeCollisionHandler(entityA, entityB, handler) {
        if (this.collisionSystem) {
            this.collisionSystem.removeCollisionHandler(entityA, entityB, handler);
        }
    }

    // Camera collision methods
    enableCameraCollision() {
        if (this.cameraCollisionSystem) {
            this.cameraCollisionSystem.cameraCollision.active = true;
            console.log('Camera collision enabled:', this.cameraCollisionSystem.cameraCollision.active);
        }
    }

    disableCameraCollision() {
        if (this.cameraCollisionSystem) {
            this.cameraCollisionSystem.cameraCollision.active = false;
        }
    }

    setCameraCollisionRadius(radius) {
        if (this.cameraCollisionSystem && this.cameraCollisionSystem.cameraCollision) {
            this.cameraCollisionSystem.cameraCollision.radius = radius;
        }
    }

    setCameraCollisionHeight(height) {
        if (this.cameraCollisionSystem && this.cameraCollisionSystem.cameraCollision) {
            this.cameraCollisionSystem.cameraCollision.height = height;
        }
    }

    // Debug method to test camera collision
    testCameraCollision() {
        if (this.cameraCollisionSystem) {
            // Manually trigger collision detection
            this.cameraCollisionSystem.checkCameraCollisions();
            
            // Check distances to all bodies
            for (let i = 0; i < this.physicsWorld.world.bodies.length; i++) {
                const body = this.physicsWorld.world.bodies[i];
                if (body.type !== CANNON.Body.KINEMATIC) {
                    const distance = this.camera.position.distanceTo(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
                    console.log(`Distance to body ${i}:`, distance.toFixed(3));
                }
            }
        }
    }

    // Performance monitoring
    getPerformanceStats() {
        const stats = {
            entityCount: this.entityManager.entities.length,
            systemCount: this.entityManager.systems.length,
            renderCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures
        };

        // Add physics stats if available
        if (this.physicsWorld) {
            const physicsStats = this.physicsWorld.getPerformanceStats();
            stats.physics = physicsStats;
        }

        return stats;
    }
}

export { GameEngine };
