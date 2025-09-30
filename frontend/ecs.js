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
    }

    // Create a basic cube entity
    createCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1) {
        const entity = this.entityManager.createEntity();
        
        // Add components
        entity.addComponent(new TransformComponent(x, y, z));
        entity.addComponent(new MeshComponent(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshLambertMaterial({ color })
        ));
        
        // Setup mesh properties
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a rotating cube
    createRotatingCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, rotationSpeed = 0.01) {
        const entity = this.createCube(x, y, z, color, size);
        entity.addComponent(new RotationComponent(rotationSpeed));
        return entity;
    }

    // Create a moving cube
    createMovingCube(x = 0, y = 0, z = 0, color = 0x00ff00, size = 1, speed = 0.02) {
        const entity = this.createCube(x, y, z, color, size);
        entity.addComponent(new MovementComponent(speed));
        return entity;
    }

    // Create a sphere
    createSphere(x = 0, y = 0, z = 0, color = 0xff0000, radius = 0.5) {
        const entity = this.entityManager.createEntity();
        
        entity.addComponent(new TransformComponent(x, y, z));
        entity.addComponent(new MeshComponent(
            new THREE.SphereGeometry(radius, 16, 16),
            new THREE.MeshLambertMaterial({ color })
        ));
        
        const meshComponent = entity.getComponent(MeshComponent);
        meshComponent.mesh.castShadow = true;
        meshComponent.mesh.receiveShadow = true;
        this.scene.add(meshComponent.mesh);
        
        return entity;
    }

    // Create a plane (ground)
    createPlane(x = 0, y = 0, z = 0, color = 0x888888, width = 10, height = 10) {
        const entity = this.entityManager.createEntity();
        
        entity.addComponent(new TransformComponent(x, y, z));
        entity.addComponent(new MeshComponent(
            new THREE.PlaneGeometry(width, height),
            new THREE.MeshLambertMaterial({ color })
        ));
        
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
