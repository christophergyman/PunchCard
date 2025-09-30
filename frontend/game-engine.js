import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { EntityManager, MovementSystem, RotationSystem, RenderSystem, TransformComponent, MeshComponent, RotationComponent, EntityFactory } from './ecs.js';

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
        // Add ECS systems
        this.entityManager.addSystem(new MovementSystem());
        this.entityManager.addSystem(new RotationSystem());
        this.entityManager.addSystem(new RenderSystem(this.scene));
        
        // Initialize entity factory
        this.entityFactory = new EntityFactory(this.entityManager, this.scene);
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
    }

    setupExampleScene() {
        // Add a ground plane
        this.entityFactory.createPlane(0, -1, 0, 0x888888, 20, 20);
        
        // Add some rotating cubes in a circle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const z = Math.sin(angle) * 3;
            const color = new THREE.Color().setHSL(i / 8, 0.7, 0.5).getHex();
            this.entityFactory.createRotatingCube(x, 0, z, color, 0.5, 0.02);
        }
        
        // Add some spheres
        this.entityFactory.createSphere(0, 2, 0, 0xff0000, 0.3);
        this.entityFactory.createSphere(2, 1, 2, 0x0000ff, 0.4);
        this.entityFactory.createSphere(-2, 1, -2, 0xffff00, 0.4);
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

        if (this.moveState.forward) this.controls.moveForward(this.moveSpeed);
        if (this.moveState.backward) this.controls.moveForward(-this.moveSpeed);
        if (this.moveState.left) this.controls.moveRight(-this.moveSpeed);
        if (this.moveState.right) this.controls.moveRight(this.moveSpeed);
        
        // Vertical movement - move camera directly
        if (this.moveState.up) this.camera.position.y += this.moveSpeed;
        if (this.moveState.down) this.camera.position.y -= this.moveSpeed;
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

    // Performance monitoring
    getPerformanceStats() {
        return {
            entityCount: this.entityManager.entities.length,
            systemCount: this.entityManager.systems.length,
            renderCalls: this.renderer.info.render.calls,
            triangles: this.renderer.info.render.triangles,
            geometries: this.renderer.info.memory.geometries,
            textures: this.renderer.info.memory.textures
        };
    }
}

export { GameEngine };
