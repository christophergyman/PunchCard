import * as THREE from 'three';
import { Scene1 } from './scene1/scene1.js';

class SceneManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.currentScene = null;
        this.scenes = new Map();
        this.sceneInstances = new Map(); // Track scene instances
        this.sceneEntities = new Map(); // Track entities per scene
        this.sceneCache = new Map(); // Cache pre-built scenes
        this.preloadedScenes = new Set(); // Track preloaded scenes
        this.batchQueue = []; // For batch operations
        this.isTransitioning = false; // Prevent multiple transitions
        this.setupDefaultScenes();
    }

    // Setup predefined scenes
    setupDefaultScenes() {
        // Modular scenes - each scene is a separate class
        this.scenes.set('scene1', {
            name: 'Scene 1',
            description: 'Example modular scene with enemies and collectibles',
            load: () => this.loadModularScene('scene1', Scene1)
        });

        // Add more modular scenes here:
        // this.scenes.set('scene2', {
        //     name: 'Scene 2',
        //     description: 'Another modular scene',
        //     load: () => this.loadModularScene('scene2', Scene2)
        // });
    }

    // Load a specific scene (optimized with caching)
    loadScene(sceneName) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // Clear current scene
        this.clearCurrentScene();

        // Load new scene
        const scene = this.scenes.get(sceneName);
        if (scene) {
            console.log(`Loading scene: ${scene.name}`);
            this.currentScene = sceneName;
            
            // Use cached scene if available
            if (this.sceneCache.has(sceneName)) {
                this.loadCachedScene(sceneName);
            } else {
                scene.load();
                // Cache the scene for future use
                this.cacheCurrentScene();
            }
            
            console.log(`Scene loaded: ${scene.description}`);
        } else {
            console.error(`Scene '${sceneName}' not found!`);
        }
        
        this.isTransitioning = false;
    }

    // Clear current scene (optimized batch removal)
    clearCurrentScene() {
        if (this.currentScene) {
            // Clear modular scene if it exists
            if (this.sceneInstances.has(this.currentScene)) {
                const sceneInstance = this.sceneInstances.get(this.currentScene);
                sceneInstance.clear();
                this.sceneInstances.delete(this.currentScene);
            }
            
            // Clear legacy scene entities
            if (this.sceneEntities.has(this.currentScene)) {
                const entities = this.sceneEntities.get(this.currentScene);
                this.batchRemoveEntities(entities);
                this.sceneEntities.delete(this.currentScene);
            }
        }
        this.currentScene = null;
    }

    // Batch remove entities for better performance
    batchRemoveEntities(entities) {
        // Use for loop instead of forEach for better performance
        for (let i = 0; i < entities.length; i++) {
            this.game.removeEntity(entities[i]);
        }
    }

    // Add entity to current scene (optimized with Set tracking)
    addToCurrentScene(entity) {
        if (this.currentScene) {
            if (!this.sceneEntities.has(this.currentScene)) {
                this.sceneEntities.set(this.currentScene, []);
            }
            this.sceneEntities.get(this.currentScene).push(entity);
        }
        return entity;
    }

    // Batch add entities for better performance
    batchAddToCurrentScene(entities) {
        if (this.currentScene) {
            if (!this.sceneEntities.has(this.currentScene)) {
                this.sceneEntities.set(this.currentScene, []);
            }
            const currentEntities = this.sceneEntities.get(this.currentScene);
            // Use spread operator for better performance than push.apply
            currentEntities.push(...entities);
        }
        return entities;
    }

    // Get list of available scenes
    getAvailableScenes() {
        const sceneList = [];
        this.scenes.forEach((scene, name) => {
            sceneList.push({
                name: name,
                displayName: scene.name,
                description: scene.description
            });
        });
        return sceneList;
    }

    // Get current scene info
    getCurrentSceneInfo() {
        if (this.currentScene) {
            const scene = this.scenes.get(this.currentScene);
            return {
                name: this.currentScene,
                displayName: scene.name,
                description: scene.description,
                entityCount: this.sceneEntities.get(this.currentScene)?.length || 0
            };
        }
        return null;
    }

    // === MODULAR SCENE LOADING ===
    
    /**
     * Load a modular scene (separate class file)
     */
    loadModularScene(sceneName, SceneClass) {
        console.log(`Loading modular scene: ${sceneName}`);
        
        // Create scene instance
        const sceneInstance = new SceneClass(this.game);
        this.sceneInstances.set(sceneName, sceneInstance);
        
        // Load the scene
        sceneInstance.load();
        
        console.log(`Modular scene ${sceneName} loaded successfully`);
    }

    // === CUSTOM SCENE DEFINITIONS ===
    // Add your custom scene loading methods here
    
    // Example scene loading method:
    // loadMyScene() {
    //     // Add your scene entities here
    //     this.addToCurrentScene(this.game.addCube(0, 0, 0, 0xff0000, 1));
    // }

    // === HELPER METHODS ===

    createCirclePositions(count, radius) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            positions.push([x, 0, z]);
        }
        return positions;
    }

    createGridPositions(width, height, spacing) {
        const positions = [];
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < height; z++) {
                positions.push([x * spacing - (width * spacing) / 2, 0, z * spacing - (height * spacing) / 2]);
            }
        }
        return positions;
    }

    createRandomPositions(count, range) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * range;
            const z = (Math.random() - 0.5) * range;
            positions.push([x, 0, z]);
        }
        return positions;
    }

    createRainbowColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(new THREE.Color().setHSL(i / count, 0.8, 0.6).getHex());
        }
        return colors;
    }

    createRandomColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(Math.random() * 0xffffff);
        }
        return colors;
    }

    // === UTILITY METHODS ===

    // Get performance stats for current scene
    getScenePerformanceStats() {
        const stats = this.game.getPerformanceStats();
        const sceneInfo = this.getCurrentSceneInfo();
        return {
            ...stats,
            currentScene: sceneInfo?.name || 'None',
            sceneEntityCount: sceneInfo?.entityCount || 0
        };
    }

    // Switch to next scene
    nextScene() {
        const sceneNames = Array.from(this.scenes.keys());
        const currentIndex = sceneNames.indexOf(this.currentScene);
        const nextIndex = (currentIndex + 1) % sceneNames.length;
        this.loadScene(sceneNames[nextIndex]);
    }

    // Switch to previous scene
    previousScene() {
        const sceneNames = Array.from(this.scenes.keys());
        const currentIndex = sceneNames.indexOf(this.currentScene);
        const prevIndex = currentIndex === 0 ? sceneNames.length - 1 : currentIndex - 1;
        this.loadScene(sceneNames[prevIndex]);
    }

    // === PERFORMANCE OPTIMIZATIONS ===

    // Cache current scene for instant loading
    cacheCurrentScene() {
        if (this.currentScene && this.sceneEntities.has(this.currentScene)) {
            const entities = this.sceneEntities.get(this.currentScene);
            this.sceneCache.set(this.currentScene, [...entities]); // Deep copy
            this.preloadedScenes.add(this.currentScene);
        }
    }

    // Load cached scene (instant loading)
    loadCachedScene(sceneName) {
        if (this.sceneCache.has(sceneName)) {
            const cachedEntities = this.sceneCache.get(sceneName);
            this.batchAddToCurrentScene(cachedEntities);
        }
    }

    // Preload scenes in background for instant switching
    preloadScenes(sceneNames) {
        sceneNames.forEach(sceneName => {
            if (!this.preloadedScenes.has(sceneName)) {
                // Use requestIdleCallback for background loading
                if (window.requestIdleCallback) {
                    requestIdleCallback(() => this.preloadScene(sceneName));
                } else {
                    setTimeout(() => this.preloadScene(sceneName), 0);
                }
            }
        });
    }

    // Preload a single scene
    preloadScene(sceneName) {
        const scene = this.scenes.get(sceneName);
        if (scene && !this.sceneCache.has(sceneName)) {
            // Temporarily set current scene for preloading
            const originalScene = this.currentScene;
            this.currentScene = sceneName;
            
            // Load scene into cache
            scene.load();
            this.cacheCurrentScene();
            
            // Restore original scene
            this.currentScene = originalScene;
        }
    }

    // Optimized scene loading with lazy loading for large scenes
    loadSceneOptimized(sceneName, lazyLoad = false) {
        if (lazyLoad && this.isLargeScene(sceneName)) {
            this.loadSceneLazy(sceneName);
        } else {
            this.loadScene(sceneName);
        }
    }

    // Check if scene is large (needs lazy loading)
    isLargeScene(sceneName) {
        // Add your large scene names here
        const largeScenes = []; // Add scene names that need lazy loading
        return largeScenes.includes(sceneName);
    }

    // Lazy load large scenes (load in chunks)
    loadSceneLazy(sceneName) {
        console.log(`Lazy loading large scene: ${sceneName}`);
        
        // Load basic scene first
        this.loadScene(sceneName);
        
        // Add your custom lazy loading logic here
        // Example:
        // if (sceneName === 'myLargeScene') {
        //     this.loadMySceneLazy();
        // }
    }

    // === LAZY LOADING HELPERS ===
    // Add your custom lazy loading methods here
    
    // Example lazy loading method:
    // loadMySceneLazy() {
    //     // Load your scene in chunks for better performance
    //     const chunkSize = 50;
    //     const totalObjects = 200;
    //     
    //     const loadChunk = (startIndex) => {
    //         const endIndex = Math.min(startIndex + chunkSize, totalObjects);
    //         // Create your objects here
    //         
    //         if (endIndex < totalObjects) {
    //             requestAnimationFrame(() => loadChunk(endIndex));
    //         }
    //     };
    //     
    //     loadChunk(0);
    // }

    // Get performance metrics for scene management
    getSceneManagerStats() {
        return {
            currentScene: this.currentScene,
            cachedScenes: this.preloadedScenes.size,
            totalScenes: this.scenes.size,
            isTransitioning: this.isTransitioning,
            cacheSize: this.sceneCache.size
        };
    }

    // Clear scene cache to free memory
    clearSceneCache() {
        this.sceneCache.clear();
        this.preloadedScenes.clear();
    }

    // Preload all scenes for instant switching
    preloadAllScenes() {
        const sceneNames = Array.from(this.scenes.keys());
        this.preloadScenes(sceneNames);
    }
}

export { SceneManager };
