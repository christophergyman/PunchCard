import * as THREE from 'three';

/**
 * Scene1 - Example Modular Scene
 * 
 * This is a template for creating modular scenes.
 * Copy this file to create new scenes (scene2/scene2.js, scene3/scene3.js, etc.)
 */

class Scene1 {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.entities = []; // Track entities in this scene
    }

    /**
     * Load the scene - called by SceneManager
     */
    load() {
        console.log('Loading Scene1...');
        
        // Clear any existing entities
        this.clear();
        
        // Add your scene content here
        
        console.log(`Scene1 loaded with ${this.entities.length} entities`);
    }

    /**
     * Clear all entities from this scene
     */
    clear() {
        this.entities.forEach(entity => {
            this.game.removeEntity(entity);
        });
        this.entities = [];
    }

    /**
     * Add entity to scene and track it
     */
    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }

    // === SCENE CONTENT METHODS ===
    // Add your scene content methods here

    // === HELPER METHODS ===

    /**
     * Create a circle of objects
     */
    createCircle(count, radius, y = 0, objectType = 'cube', color = 0xff0000, size = 1) {
        const objects = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            let entity;
            switch (objectType) {
                case 'cube':
                    entity = this.game.addCube(x, y, z, color, size);
                    break;
                case 'rotatingCube':
                    entity = this.game.addRotatingCube(x, y, z, color, size, 0.02);
                    break;
                case 'movingCube':
                    entity = this.game.addMovingCube(x, y, z, color, size, 0.01);
                    break;
                case 'sphere':
                    entity = this.game.addSphere(x, y, z, color, size);
                    break;
            }
            
            objects.push(this.addEntity(entity));
        }
        
        return objects;
    }

    /**
     * Create a grid of objects
     */
    createGrid(width, height, spacing, y = 0, objectType = 'cube', color = 0x00ff00, size = 1) {
        const objects = [];
        
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                const posX = x * spacing - (width * spacing) / 2;
                const posZ = z * spacing - (height * spacing) / 2;
                
                let entity;
                switch (objectType) {
                    case 'cube':
                        entity = this.game.addCube(posX, y, posZ, color, size);
                        break;
                    case 'rotatingCube':
                        entity = this.game.addRotatingCube(posX, y, posZ, color, size, 0.02);
                        break;
                    case 'movingCube':
                        entity = this.game.addMovingCube(posX, y, posZ, color, size, 0.01);
                        break;
                    case 'sphere':
                        entity = this.game.addSphere(posX, y, posZ, color, size);
                        break;
                }
                
                objects.push(this.addEntity(entity));
            }
        }
        
        return objects;
    }

    /**
     * Create random scattered objects
     */
    createRandom(count, spread, y = 0, objectType = 'cube', color = 0x0000ff, size = 1) {
        const objects = [];
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * spread;
            const z = (Math.random() - 0.5) * spread;
            
            let entity;
            switch (objectType) {
                case 'cube':
                    entity = this.game.addCube(x, y, z, color, size);
                    break;
                case 'rotatingCube':
                    entity = this.game.addRotatingCube(x, y, z, color, size, 0.02);
                    break;
                case 'movingCube':
                    entity = this.game.addMovingCube(x, y, z, color, size, 0.01);
                    break;
                case 'sphere':
                    entity = this.game.addSphere(x, y, z, color, size);
                    break;
            }
            
            objects.push(this.addEntity(entity));
        }
        
        return objects;
    }

    // === SCENE INFO ===

    /**
     * Get scene information
     */
    getInfo() {
        return {
            name: 'Scene1',
            description: 'Example modular scene with enemies, collectibles, and obstacles',
            entityCount: this.entities.length,
            entities: this.entities.map(entity => ({
                id: entity.id,
                type: entity.getComponent ? 'ECS Entity' : 'Unknown'
            }))
        };
    }

    /**
     * Get performance stats for this scene
     */
    getPerformanceStats() {
        return {
            entityCount: this.entities.length,
            sceneName: 'Scene1',
            memoryUsage: this.entities.length * 0.1 // Rough estimate
        };
    }
}

export { Scene1 };
