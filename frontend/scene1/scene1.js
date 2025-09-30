import * as THREE from 'three';

class Scene1 {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.entities = [];
    }

    load() {
        console.log('Loading Scene1...');
        this.clear();
        console.log(`Scene1 loaded with ${this.entities.length} entities`);
    }

    clear() {
        this.entities.forEach(entity => {
            this.game.removeEntity(entity);
        });
        this.entities = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
        return entity;
    }


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

    getPerformanceStats() {
        return {
            entityCount: this.entities.length,
            sceneName: 'Scene1',
            memoryUsage: this.entities.length * 0.1 // Rough estimate
        };
    }
}

export { Scene1 };
