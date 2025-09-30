import * as THREE from 'three';

// Entity Component System
class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
        this.active = true;
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component);
        return this;
    }

    getComponent(componentType) {
        return this.components.get(componentType.name);
    }

    hasComponent(componentType) {
        return this.components.has(componentType.name);
    }

    removeComponent(componentType) {
        this.components.delete(componentType.name);
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
        this.entities.forEach(entity => {
            const transform = entity.getComponent(TransformComponent);
            const movement = entity.getComponent(MovementComponent);
            
            if (transform && movement) {
                transform.position.add(movement.velocity.clone().multiplyScalar(deltaTime));
            }
        });
    }
}

class RotationSystem extends System {
    update(deltaTime) {
        this.entities.forEach(entity => {
            const transform = entity.getComponent(TransformComponent);
            const rotation = entity.getComponent(RotationComponent);
            const mesh = entity.getComponent(MeshComponent);
            
            if (transform && rotation && mesh) {
                transform.rotation.y += rotation.rotationSpeed * deltaTime;
                mesh.mesh.rotation.copy(transform.rotation);
            }
        });
    }
}

class RenderSystem extends System {
    constructor(scene) {
        super();
        this.scene = scene;
    }

    update(deltaTime) {
        this.entities.forEach(entity => {
            const transform = entity.getComponent(TransformComponent);
            const mesh = entity.getComponent(MeshComponent);
            
            if (transform && mesh) {
                mesh.mesh.position.copy(transform.position);
                mesh.mesh.scale.copy(transform.scale);
            }
        });
    }
}

// Entity Manager
class EntityManager {
    constructor() {
        this.entities = [];
        this.systems = [];
        this.nextEntityId = 0;
    }

    createEntity() {
        const entity = new Entity(this.nextEntityId++);
        this.entities.push(entity);
        return entity;
    }

    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
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
        this.systems.forEach(system => system.update(deltaTime));
    }

    getEntitiesWithComponents(...componentTypes) {
        return this.entities.filter(entity => 
            componentTypes.every(componentType => entity.hasComponent(componentType))
        );
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
    EntityManager
};
