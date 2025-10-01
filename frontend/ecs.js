import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RigidBodyComponent, ColliderComponent, PhysicsMaterialComponent, PhysicsShapeFactory } from './physics.js';

// Object pool for Vector3 reuse to reduce garbage collection
class Vector3Pool {
    constructor(initialSize = 10) {
        this.pool = [];
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new THREE.Vector3());
        }
    }

    get() {
        return this.pool.pop() || new THREE.Vector3();
    }

    release(vector) {
        vector.set(0, 0, 0);
        this.pool.push(vector);
    }
}

// Global vector pool instance
const vectorPool = new Vector3Pool();

// Geometry and Material pools for performance
class GeometryPool {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
    }

    getBoxGeometry(size = 1) {
        const key = `box_${size}`;
        if (!this.geometries.has(key)) {
            this.geometries.set(key, new THREE.BoxGeometry(size, size, size));
        }
        return this.geometries.get(key);
    }

    getSphereGeometry(radius = 0.5, segments = 16) {
        const key = `sphere_${radius}_${segments}`;
        if (!this.geometries.has(key)) {
            this.geometries.set(key, new THREE.SphereGeometry(radius, segments, segments));
        }
        return this.geometries.get(key);
    }

    getPlaneGeometry(width = 1, height = 1) {
        const key = `plane_${width}_${height}`;
        if (!this.geometries.has(key)) {
            this.geometries.set(key, new THREE.PlaneGeometry(width, height));
        }
        return this.geometries.get(key);
    }

    getMaterial(color = 0x00ff00) {
        if (!this.materials.has(color)) {
            this.materials.set(color, new THREE.MeshLambertMaterial({ color }));
        }
        return this.materials.get(color);
    }
}

// Global geometry pool
const geometryPool = new GeometryPool();

// Component pool for reusing components
class ComponentPool {
    constructor() {
        this.transformPool = [];
        this.movementPool = [];
        this.rotationPool = [];
        this.rigidBodyPool = [];
        this.colliderPool = [];
    }

    getTransformComponent(x = 0, y = 0, z = 0) {
        if (this.transformPool.length > 0) {
            const component = this.transformPool.pop();
            component.position.set(x, y, z);
            component.rotation.set(0, 0, 0);
            component.scale.set(1, 1, 1);
            return component;
        }
        return new TransformComponent(x, y, z);
    }

    getMovementComponent(speed = 0.02) {
        if (this.movementPool.length > 0) {
            const component = this.movementPool.pop();
            component.speed = speed;
            component.velocity.set(0, 0, 0);
            return component;
        }
        return new MovementComponent(speed);
    }

    getRotationComponent(rotationSpeed = 0.01) {
        if (this.rotationPool.length > 0) {
            const component = this.rotationPool.pop();
            component.rotationSpeed = rotationSpeed;
            return component;
        }
        return new RotationComponent(rotationSpeed);
    }

    releaseTransformComponent(component) {
        this.transformPool.push(component);
    }

    releaseMovementComponent(component) {
        this.movementPool.push(component);
    }

    releaseRotationComponent(component) {
        this.rotationPool.push(component);
    }

    getRigidBodyComponent(options = {}) {
        if (this.rigidBodyPool.length > 0) {
            const component = this.rigidBodyPool.pop();
            Object.assign(component, options);
            return component;
        }
        return new RigidBodyComponent(options);
    }

    getColliderComponent(shape, options = {}) {
        if (this.colliderPool.length > 0) {
            const component = this.colliderPool.pop();
            component.shape = shape;
            Object.assign(component, options);
            return component;
        }
        return new ColliderComponent(shape, options);
    }

    releaseRigidBodyComponent(component) {
        this.rigidBodyPool.push(component);
    }

    releaseColliderComponent(component) {
        this.colliderPool.push(component);
    }
}

// Global component pool
const componentPool = new ComponentPool();

// GLB Model loader and cache
class ModelLoader {
    constructor() {
        this.loader = new GLTFLoader();
        this.cache = new Map();
    }

    async loadModel(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const gltf = await this.loader.loadAsync(url);
            this.cache.set(url, gltf);
            return gltf;
        } catch (error) {
            console.error(`Failed to load model: ${url}`, error);
            return null;
        }
    }

    cloneModel(gltf) {
        if (!gltf) return null;
        
        const clonedScene = gltf.scene.clone();
        return clonedScene;
    }
}

// Global model loader
const modelLoader = new ModelLoader();

// Entity Component System
class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
        this.active = true;
        // Cache component lookups for performance
        this._componentCache = new Map();
    }

    addComponent(component) {
        const componentName = component.constructor.name;
        this.components.set(componentName, component);
        // Cache the component for faster access
        this._componentCache.set(componentName, component);
        return this;
    }

    getComponent(componentType) {
        const componentName = componentType.name;
        // Use cache for faster lookups
        if (this._componentCache.has(componentName)) {
            return this._componentCache.get(componentName);
        }
        const component = this.components.get(componentName);
        if (component) {
            this._componentCache.set(componentName, component);
        }
        return component;
    }

    hasComponent(componentType) {
        return this.components.has(componentType.name);
    }

    removeComponent(componentType) {
        const componentName = componentType.name;
        this.components.delete(componentName);
        this._componentCache.delete(componentName);
        return this;
    }
}

// Base Component class
class Component {
    constructor() {
        this.active = true;
    }
}

// Specific component types
class TransformComponent extends Component {
    constructor(x = 0, y = 0, z = 0) {
        super();
        this.position = new THREE.Vector3(x, y, z);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);
    }
}

class MeshComponent extends Component {
    constructor(geometry, material) {
        super();
        this.mesh = new THREE.Mesh(geometry, material);
    }
}

class ModelComponent extends Component {
    constructor(modelUrl) {
        super();
        this.modelUrl = modelUrl;
        this.model = null;
        this.isLoaded = false;
    }

    async loadModel() {
        if (this.isLoaded) return this.model;
        
        const gltf = await modelLoader.loadModel(this.modelUrl);
        if (gltf) {
            this.model = modelLoader.cloneModel(gltf);
            this.isLoaded = true;
        }
        return this.model;
    }
}

class MovementComponent extends Component {
    constructor(speed = 0.02) {
        super();
        this.speed = speed;
        this.velocity = new THREE.Vector3(0, 0, 0);
    }
}

class RotationComponent extends Component {
    constructor(rotationSpeed = 0.01) {
        super();
        this.rotationSpeed = rotationSpeed;
        this.rotationAxis = new THREE.Vector3(0, 1, 0);
    }
}

// Base System class
class System {
    constructor() {
        this.entities = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    update(deltaTime) {
        // Override in subclasses
    }
}

// Specific systems
class MovementSystem extends System {
    update(deltaTime) {
        // Use object pool to avoid garbage collection
        const tempVector = vectorPool.get();
        
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            const transform = entity.getComponent(TransformComponent);
            const movement = entity.getComponent(MovementComponent);
            
            if (transform && movement) {
                // Use pooled vector to avoid allocations
                tempVector.copy(movement.velocity).multiplyScalar(deltaTime);
                transform.position.add(tempVector);
            }
        }
        
        // Return vector to pool
        vectorPool.release(tempVector);
    }
}

class RotationSystem extends System {
    update(deltaTime) {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            const transform = entity.getComponent(TransformComponent);
            const rotation = entity.getComponent(RotationComponent);
            const mesh = entity.getComponent(MeshComponent);
            
            if (transform && rotation && mesh) {
                transform.rotation.y += rotation.rotationSpeed * deltaTime;
                mesh.mesh.rotation.copy(transform.rotation);
            }
        }
    }
}

class RenderSystem extends System {
    constructor(scene) {
        super();
        this.scene = scene;
    }

    update(deltaTime) {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            const transform = entity.getComponent(TransformComponent);
            const mesh = entity.getComponent(MeshComponent);
            const model = entity.getComponent(ModelComponent);
            
            if (transform && mesh) {
                mesh.mesh.position.copy(transform.position);
                mesh.mesh.scale.copy(transform.scale);
            }
            
            if (transform && model && model.isLoaded) {
                model.model.position.copy(transform.position);
                model.model.scale.copy(transform.scale);
                model.model.rotation.copy(transform.rotation);
            }
        }
    }
}

// Entity Manager
class EntityManager {
    constructor() {
        this.entities = [];
        this.systems = [];
        this.nextEntityId = 0;
        // Use Set for O(1) entity removal
        this.entitySet = new Set();
    }

    createEntity() {
        const entity = new Entity(this.nextEntityId++);
        this.entities.push(entity);
        this.entitySet.add(entity);
        
        // Add entity to all systems
        for (let i = 0; i < this.systems.length; i++) {
            this.systems[i].addEntity(entity);
        }
        
        return entity;
    }

    removeEntity(entity) {
        if (this.entitySet.has(entity)) {
            this.entitySet.delete(entity);
            const index = this.entities.indexOf(entity);
            if (index > -1) {
                this.entities.splice(index, 1);
            }
            // Remove from all systems
            for (let i = 0; i < this.systems.length; i++) {
                this.systems[i].removeEntity(entity);
            }
        }
    }

    notifyPhysicsComponentsAdded(entity) {
        // Notify physics system that this entity now has physics components
        for (let i = 0; i < this.systems.length; i++) {
            if (this.systems[i].constructor.name === 'PhysicsSystem') {
                console.log('Notifying physics system about entity with physics components:', entity.id);
                this.systems[i].addEntity(entity);
            }
        }
    }

    addSystem(system) {
        this.systems.push(system);
        // Add all existing entities to the new system
        this.entities.forEach(entity => system.addEntity(entity));
    }

    update(deltaTime) {
        // Use for loop instead of forEach for better performance
        for (let i = 0; i < this.systems.length; i++) {
            this.systems[i].update(deltaTime);
        }
    }

    getEntitiesWithComponents(...componentTypes) {
        // Use for loop for better performance
        const result = [];
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            let hasAllComponents = true;
            for (let j = 0; j < componentTypes.length; j++) {
                if (!entity.hasComponent(componentTypes[j])) {
                    hasAllComponents = false;
                    break;
                }
            }
            if (hasAllComponents) {
                result.push(entity);
            }
        }
        return result;
    }
}

// Entity Factory for easy entity creation
class EntityFactory {
    constructor(entityManager, scene) {
        this.entityManager = entityManager;
        this.scene = scene;
        this.batchQueue = []; // For batch operations
        this.instancedMeshes = new Map(); // For instanced rendering
    }

    // Create a basic cube entity (optimized with pooling)
    createCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1) {
        const entity = this.entityManager.createEntity();
        
        // Add components using pools
        entity.addComponent(componentPool.getTransformComponent(x, y, z));
        
        // Use pooled geometry and material
        const geometry = geometryPool.getBoxGeometry(size);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        // Setup mesh properties
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a rotating cube (optimized with pooling)
    createRotatingCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, rotationSpeed = 0.01) {
        const entity = this.createCube(x, y, z, color, size);
        entity.addComponent(componentPool.getRotationComponent(rotationSpeed));
        return entity;
    }

    // Create a moving cube (optimized with pooling)
    createMovingCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, speed = 0.02) {
        const entity = this.createCube(x, y, z, color, size);
        entity.addComponent(componentPool.getMovementComponent(speed));
        return entity;
    }

    // Create a sphere (optimized with pooling)
    createSphere(x = 0, y = 0, z = 0, color = 0xff0000, radius = 0.5) {
        const entity = this.entityManager.createEntity();
        
        entity.addComponent(new TransformComponent(x, y, z));
        
        // Use pooled geometry and material
        const geometry = geometryPool.getSphereGeometry(radius, 16);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a plane (ground) - optimized with pooling
    createPlane(x = 0, y = 0, z = 0, color = 0x888888, width = 10, height = 10) {
        const entity = this.entityManager.createEntity();
        
        entity.addComponent(new TransformComponent(x, y, z));
        
        // Use pooled geometry and material
        const geometry = geometryPool.getPlaneGeometry(width, height);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Generic entity creator with custom geometry and material
    createEntity(geometry, material, x = 0, y = 0, z = 0) {
        const entity = this.entityManager.createEntity();
        
        entity.addComponent(new TransformComponent(x, y, z));
        entity.addComponent(new MeshComponent(geometry, material));
        
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create entity with GLB model
    async createModelEntity(modelUrl, x = 0, y = 0, z = 0) {
        const entity = this.entityManager.createEntity();
        
        entity.addComponent(new TransformComponent(x, y, z));
        entity.addComponent(new ModelComponent(modelUrl));
        
        const modelComponent = entity.getComponent(ModelComponent);
        const model = await modelComponent.loadModel();
        
        if (model) {
            // Enable shadows for all meshes in the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.scene.add(model);
        }
        
        return entity;
    }

    // Remove entity and its mesh from scene
    destroyEntity(entity) {
        const meshComponent = entity.getComponent(MeshComponent);
        const modelComponent = entity.getComponent(ModelComponent);
        
        if (meshComponent) {
            this.scene.remove(meshComponent.mesh);
        }
        
        if (modelComponent && modelComponent.model) {
            this.scene.remove(modelComponent.model);
        }
        
        this.entityManager.removeEntity(entity);
    }

    // HIGH PERFORMANCE: Batch create multiple entities at once
    createBatch(type, count, positions, colors, sizes) {
        const entities = [];
        
        for (let i = 0; i < count; i++) {
            const pos = positions[i] || [0, 0, 0];
            const color = colors[i] || 0x00ff00;
            const size = sizes[i] || 1;
            
            let entity;
            switch(type) {
                case 'cube':
                    entity = this.createCube(pos[0], pos[1], pos[2], color, size);
                    break;
                case 'sphere':
                    entity = this.createSphere(pos[0], pos[1], pos[2], color, size);
                    break;
                case 'rotatingCube':
                    entity = this.createRotatingCube(pos[0], pos[1], pos[2], color, size);
                    break;
            }
            entities.push(entity);
        }
        
        return entities;
    }

    // HIGH PERFORMANCE: Create instanced mesh for repeated objects
    createInstancedMesh(geometry, material, count, positions) {
        const instancedMesh = new THREE.InstancedMesh(geometry, material, count);
        
        // Set positions for each instance
        const matrix = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
            const pos = positions[i];
            matrix.setPosition(pos[0], pos[1], pos[2]);
            instancedMesh.setMatrixAt(i, matrix);
        }
        
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;
        this.scene.add(instancedMesh);
        
        return instancedMesh;
    }

    // HIGH PERFORMANCE: Create many cubes efficiently
    createCubeField(count, spacing = 2, color = 0x00ff00, size = 1) {
        const positions = [];
        const colors = [];
        const sizes = [];
        
        const gridSize = Math.ceil(Math.sqrt(count));
        
        for (let i = 0; i < count; i++) {
            const x = (i % gridSize) * spacing - (gridSize * spacing) / 2;
            const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2;
            
            positions.push([x, 0, z]);
            colors.push(color);
            sizes.push(size);
        }
        
        return this.createBatch('cube', count, positions, colors, sizes);
    }

    // PHYSICS-ENABLED ENTITY CREATION METHODS

    // Create a physics-enabled cube
    createPhysicsCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, options = {}) {
        const entity = this.entityManager.createEntity();
        
        // Add transform component
        entity.addComponent(componentPool.getTransformComponent(x, y, z));
        
        // Add visual mesh
        const geometry = geometryPool.getBoxGeometry(size);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        // Add physics components
        const rigidBody = componentPool.getRigidBodyComponent({
            type: options.type || 'dynamic',
            mass: options.mass || 1,
            ...options
        });
        console.log('Adding rigidBody component to cube entity:', entity.id, rigidBody);
        entity.addComponent(rigidBody);
        
        const colliderShape = PhysicsShapeFactory.createBoxShape(size, size, size);
        const collider = componentPool.getColliderComponent(colliderShape, options.collider || {});
        console.log('Adding collider component to cube entity:', entity.id, collider);
        entity.addComponent(collider);
        
        // Debug: Check what components are on the entity
        console.log('Cube entity components after adding physics:', {
            rigidBody: !!entity.getComponent(RigidBodyComponent),
            collider: !!entity.getComponent(ColliderComponent),
            transform: !!entity.getComponent(TransformComponent),
            mesh: !!entity.getComponent(MeshComponent)
        });
        
        // Notify physics system that this entity now has physics components
        this.entityManager.notifyPhysicsComponentsAdded(entity);
        
        // Setup mesh properties
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a physics-enabled sphere
    createPhysicsSphere(x = 0, y = 0, z = 0, color = 0xff0000, radius = 0.5, options = {}) {
        const entity = this.entityManager.createEntity();
        
        // Add transform component
        entity.addComponent(componentPool.getTransformComponent(x, y, z));
        
        // Add visual mesh
        const geometry = geometryPool.getSphereGeometry(radius, 16);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        // Add physics components
        const rigidBody = componentPool.getRigidBodyComponent({
            type: options.type || 'dynamic',
            mass: options.mass || 1,
            ...options
        });
        entity.addComponent(rigidBody);
        
        const colliderShape = PhysicsShapeFactory.createSphereShape(radius);
        const collider = componentPool.getColliderComponent(colliderShape, options.collider || {});
        entity.addComponent(collider);
        
        // Setup mesh properties
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a physics-enabled plane (ground)
    createPhysicsPlane(x = 0, y = 0, z = 0, color = 0x888888, width = 10, height = 10, options = {}) {
        const entity = this.entityManager.createEntity();
        
        // Add transform component
        entity.addComponent(componentPool.getTransformComponent(x, y, z));
        
        // Add visual mesh
        const geometry = geometryPool.getPlaneGeometry(width, height);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        // Add physics components (static by default for ground)
        const rigidBody = componentPool.getRigidBodyComponent({
            type: 'static',
            mass: 0,
            ...options
        });
        console.log('Adding rigidBody component to entity:', entity.id, rigidBody);
        entity.addComponent(rigidBody);
        
        // Use a box shape for the ground instead of a plane shape for better physics
        const colliderShape = PhysicsShapeFactory.createBoxShape(width, 0.1, height);
        const collider = componentPool.getColliderComponent(colliderShape, options.collider || {});
        console.log('Adding collider component to entity:', entity.id, collider);
        entity.addComponent(collider);
        
        // Debug: Check what components are on the entity
        console.log('Entity components after adding physics:', {
            rigidBody: !!entity.getComponent(RigidBodyComponent),
            collider: !!entity.getComponent(ColliderComponent),
            transform: !!entity.getComponent(TransformComponent),
            mesh: !!entity.getComponent(MeshComponent)
        });
        
        // Notify physics system that this entity now has physics components
        this.entityManager.notifyPhysicsComponentsAdded(entity);
        
        // Setup mesh properties
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a physics-enabled cylinder
    createPhysicsCylinder(x = 0, y = 0, z = 0, color = 0x0000ff, radius = 0.5, height = 2, options = {}) {
        const entity = this.entityManager.createEntity();
        
        // Add transform component
        entity.addComponent(componentPool.getTransformComponent(x, y, z));
        
        // Add visual mesh (using box for now, could be replaced with cylinder geometry)
        const geometry = geometryPool.getBoxGeometry(radius * 2, height, radius * 2);
        const material = geometryPool.getMaterial(color);
        entity.addComponent(new MeshComponent(geometry, material));
        
        // Add physics components
        const rigidBody = componentPool.getRigidBodyComponent({
            type: options.type || 'dynamic',
            mass: options.mass || 1,
            ...options
        });
        entity.addComponent(rigidBody);
        
        const colliderShape = PhysicsShapeFactory.createCylinderShape(radius, radius, height);
        const collider = componentPool.getColliderComponent(colliderShape, options.collider || {});
        entity.addComponent(collider);
        
        // Setup mesh properties
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a physics-enabled model entity
    async createPhysicsModelEntity(modelUrl, x = 0, y = 0, z = 0, options = {}) {
        const entity = this.entityManager.createEntity();
        
        // Add transform component
        entity.addComponent(componentPool.getTransformComponent(x, y, z));
        
        // Add model component
        entity.addComponent(new ModelComponent(modelUrl));
        
        // Add physics components
        const rigidBody = componentPool.getRigidBodyComponent({
            type: options.type || 'dynamic',
            mass: options.mass || 1,
            ...options
        });
        entity.addComponent(rigidBody);
        
        // For models, we'll use a box collider as default
        // In a real implementation, you'd want to generate colliders from the model geometry
        const colliderShape = PhysicsShapeFactory.createBoxShape(
            options.width || 1,
            options.height || 1,
            options.depth || 1
        );
        const collider = componentPool.getColliderComponent(colliderShape, options.collider || {});
        entity.addComponent(collider);
        
        // Load model
        const modelComponent = entity.getComponent(ModelComponent);
        const model = await modelComponent.loadModel();
        
        if (model) {
            // Enable shadows for all meshes in the model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            this.scene.add(model);
        }
        
        return entity;
    }

    // Create a physics-enabled batch of objects
    createPhysicsBatch(type, count, positions, colors, sizes, physicsOptions = {}) {
        const entities = [];
        
        for (let i = 0; i < count; i++) {
            const pos = positions[i] || [0, 0, 0];
            const color = colors[i] || 0x00ff00;
            const size = sizes[i] || 1;
            const options = physicsOptions[i] || {};
            
            let entity;
            switch(type) {
                case 'physicsCube':
                    entity = this.createPhysicsCube(pos[0], pos[1], pos[2], color, size, options);
                    break;
                case 'physicsSphere':
                    entity = this.createPhysicsSphere(pos[0], pos[1], pos[2], color, size, options);
                    break;
                case 'physicsCylinder':
                    entity = this.createPhysicsCylinder(pos[0], pos[1], pos[2], color, size, size * 2, options);
                    break;
            }
            entities.push(entity);
        }
        
        return entities;
    }

    // Create a physics-enabled cube field
    createPhysicsCubeField(count, spacing = 2, color = 0x00ff00, size = 1, physicsOptions = {}) {
        const positions = [];
        const colors = [];
        const sizes = [];
        const options = [];
        
        const gridSize = Math.ceil(Math.sqrt(count));
        
        for (let i = 0; i < count; i++) {
            const x = (i % gridSize) * spacing - (gridSize * spacing) / 2;
            const z = Math.floor(i / gridSize) * spacing - (gridSize * spacing) / 2;
            
            positions.push([x, 0, z]);
            colors.push(color);
            sizes.push(size);
            options.push(physicsOptions);
        }
        
        return this.createPhysicsBatch('physicsCube', count, positions, colors, sizes, options);
    }
}

export {
    Entity,
    Component,
    TransformComponent,
    MeshComponent,
    ModelComponent,
    MovementComponent,
    RotationComponent,
    RigidBodyComponent,
    ColliderComponent,
    PhysicsMaterialComponent,
    System,
    MovementSystem,
    RotationSystem,
    RenderSystem,
    EntityManager,
    EntityFactory,
    ModelLoader
};
