import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { EntityManager, MovementSystem, RotationSystem, RenderSystem, TransformComponent, MeshComponent, RotationComponent } from './ecs.js';

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
    }

    createCube() {
        // Create cube using ECS
        const cubeEntity = this.entityManager.createEntity();
        
        // Add components
        cubeEntity.addComponent(new TransformComponent(0, 0, 0));
        cubeEntity.addComponent(new MeshComponent(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({ color: 0x00ff00 })
        ));
        cubeEntity.addComponent(new RotationComponent(0.01));
        
        // Setup mesh properties
        const meshComponent = cubeEntity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        // Store reference for backward compatibility
        this.cube = meshComponent.mesh;

        // Add lighting
        this.setupLighting();
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
}

export { GameEngine };
