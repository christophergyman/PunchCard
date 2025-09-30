import * as THREE from 'three';

class SceneManager {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.currentScene = null;
        this.scenes = new Map();
        this.sceneEntities = new Map(); // Track entities per scene
        this.sceneCache = new Map(); // Cache pre-built scenes
        this.preloadedScenes = new Set(); // Track preloaded scenes
        this.batchQueue = []; // For batch operations
        this.isTransitioning = false; // Prevent multiple transitions
        this.setupDefaultScenes();
    }

    // Setup predefined scenes
    setupDefaultScenes() {
        // Scene 1: Basic Demo
        this.scenes.set('demo', {
            name: 'Demo Scene',
            description: 'Basic scene with rotating cubes and spheres',
            load: () => this.loadDemoScene()
        });

        // Scene 2: Cube Field
        this.scenes.set('cubeField', {
            name: 'Cube Field',
            description: 'Large field of cubes',
            load: () => this.loadCubeFieldScene()
        });

        // Scene 3: Spinning World
        this.scenes.set('spinningWorld', {
            name: 'Spinning World',
            description: 'World full of spinning objects',
            load: () => this.loadSpinningWorldScene()
        });

        // Scene 4: Performance Test
        this.scenes.set('performanceTest', {
            name: 'Performance Test',
            description: 'Stress test with many objects',
            load: () => this.loadPerformanceTestScene()
        });

        // Scene 5: Empty Scene
        this.scenes.set('empty', {
            name: 'Empty Scene',
            description: 'Clean scene with just ground',
            load: () => this.loadEmptyScene()
        });
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
        if (this.currentScene && this.sceneEntities.has(this.currentScene)) {
            const entities = this.sceneEntities.get(this.currentScene);
            
            // Batch remove entities for better performance
            this.batchRemoveEntities(entities);
            
            this.sceneEntities.delete(this.currentScene);
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

    // === SCENE DEFINITIONS ===

    loadDemoScene() {
        // Ground plane
        this.addToCurrentScene(
            this.game.addPlane(0, -1, 0, 0x888888, 20, 20)
        );

        // Rotating cubes in a circle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 3;
            const z = Math.sin(angle) * 3;
            const color = new THREE.Color().setHSL(i / 8, 0.7, 0.5).getHex();
            this.addToCurrentScene(
                this.game.addRotatingCube(x, 0, z, color, 0.5, 0.02)
            );
        }

        // Some spheres
        this.addToCurrentScene(this.game.addSphere(0, 2, 0, 0xff0000, 0.3));
        this.addToCurrentScene(this.game.addSphere(2, 1, 2, 0x0000ff, 0.4));
        this.addToCurrentScene(this.game.addSphere(-2, 1, -2, 0xffff00, 0.4));
    }

    loadCubeFieldScene() {
        // Ground plane
        this.addToCurrentScene(
            this.game.addPlane(0, -1, 0, 0x666666, 50, 50)
        );

        // Large field of cubes
        const cubeField = this.game.addCubeField(100, 2, 0x00ff00, 0.8);
        cubeField.forEach(cube => this.addToCurrentScene(cube));

        // Add some variety
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            const color = Math.random() * 0xffffff;
            this.addToCurrentScene(
                this.game.addCube(x, 0, z, color, Math.random() * 0.5 + 0.5)
            );
        }
    }

    loadSpinningWorldScene() {
        // Ground plane
        this.addToCurrentScene(
            this.game.addPlane(0, -1, 0, 0x444444, 30, 30)
        );

        // Spinning cubes in various patterns
        const patterns = [
            // Circle pattern
            { positions: this.createCirclePositions(8, 5), colors: this.createRainbowColors(8) },
            // Grid pattern
            { positions: this.createGridPositions(5, 5, 2), colors: this.createRandomColors(25) },
            // Random scattered
            { positions: this.createRandomPositions(15, 10), colors: this.createRandomColors(15) }
        ];

        patterns.forEach(pattern => {
            pattern.positions.forEach((pos, i) => {
                const color = pattern.colors[i];
                this.addToCurrentScene(
                    this.game.addRotatingCube(pos[0], pos[1], pos[2], color, 0.6, 0.03)
                );
            });
        });
    }

    loadPerformanceTestScene() {
        // Ground plane
        this.addToCurrentScene(
            this.game.addPlane(0, -1, 0, 0x333333, 100, 100)
        );

        // Performance test with many objects
        console.log('Creating performance test scene...');
        
        // Create large cube field
        const cubeField = this.game.addCubeField(500, 1, 0x00ff00, 0.3);
        cubeField.forEach(cube => this.addToCurrentScene(cube));

        // Add some moving objects
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const color = Math.random() * 0xffffff;
            this.addToCurrentScene(
                this.game.addMovingCube(x, 0, z, color, 0.4, 0.01)
            );
        }

        console.log('Performance test scene created!');
    }

    loadEmptyScene() {
        // Just a ground plane
        this.addToCurrentScene(
            this.game.addPlane(0, -1, 0, 0x888888, 20, 20)
        );
    }

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
        const largeScenes = ['performanceTest', 'cubeField'];
        return largeScenes.includes(sceneName);
    }

    // Lazy load large scenes (load in chunks)
    loadSceneLazy(sceneName) {
        console.log(`Lazy loading large scene: ${sceneName}`);
        
        // Load basic scene first
        this.loadScene(sceneName);
        
        // Load additional content in chunks
        if (sceneName === 'performanceTest') {
            this.loadPerformanceTestLazy();
        } else if (sceneName === 'cubeField') {
            this.loadCubeFieldLazy();
        }
    }

    // Lazy load performance test scene
    loadPerformanceTestLazy() {
        // Load in chunks to prevent frame drops
        const chunkSize = 100;
        const totalCubes = 500;
        
        const loadChunk = (startIndex) => {
            const endIndex = Math.min(startIndex + chunkSize, totalCubes);
            const positions = [];
            
            for (let i = startIndex; i < endIndex; i++) {
                const x = (i % 20) * 2 - 20;
                const z = Math.floor(i / 20) * 2 - 20;
                positions.push([x, 0, z]);
            }
            
            const chunk = this.game.addBatch('cube', positions.length, positions, 
                new Array(positions.length).fill(0x00ff00), 
                new Array(positions.length).fill(0.3));
            
            this.batchAddToCurrentScene(chunk);
            
            // Load next chunk if not done
            if (endIndex < totalCubes) {
                requestAnimationFrame(() => loadChunk(endIndex));
            }
        };
        
        loadChunk(0);
    }

    // Lazy load cube field scene
    loadCubeFieldLazy() {
        // Load cubes in chunks
        const chunkSize = 50;
        const totalCubes = 100;
        
        const loadChunk = (startIndex) => {
            const endIndex = Math.min(startIndex + chunkSize, totalCubes);
            const positions = [];
            const colors = [];
            const sizes = [];
            
            for (let i = startIndex; i < endIndex; i++) {
                const x = (i % 10) * 2 - 10;
                const z = Math.floor(i / 10) * 2 - 10;
                positions.push([x, 0, z]);
                colors.push(0x00ff00);
                sizes.push(0.8);
            }
            
            const chunk = this.game.addBatch('cube', positions.length, positions, colors, sizes);
            this.batchAddToCurrentScene(chunk);
            
            if (endIndex < totalCubes) {
                requestAnimationFrame(() => loadChunk(endIndex));
            }
        };
        
        loadChunk(0);
    }

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
