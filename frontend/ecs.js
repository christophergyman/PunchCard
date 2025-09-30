import * as THREE from 'three';

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
}

// Global component pool
const componentPool = new ComponentPool();

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
            
            if (transform && mesh) {
                mesh.mesh.position.copy(transform.position);
                mesh.mesh.scale.copy(transform.scale);
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
            this.systems.forEach(system => system.removeEntity(entity));
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

    // Remove entity and its mesh from scene
    destroyEntity(entity) {
        const meshComponent = entity.getComponent(MeshComponent);
        if (meshComponent) {
            this.scene.remove(meshComponent.mesh);
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
}

export {
    Entity,
    Component,
    TransformComponent,
    MeshComponent,
    MovementComponent,
    RotationComponent,
    System,
    MovementSystem,
    RotationSystem,
    RenderSystem,
    EntityManager,
    EntityFactory
};
