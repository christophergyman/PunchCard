import { GameEngine } from './game-engine.js';
import { SceneManager } from './scene-manager.js';

// Initialize the game
const game = new GameEngine();

// Initialize scene manager
const sceneManager = new SceneManager(game);

// Load default scene
sceneManager.loadScene('demo');

// === SCENE CONTROLS ===
// You can use these in the browser console or add UI controls:

// Load different scenes:
// sceneManager.loadScene('demo');           // Basic demo scene
// sceneManager.loadScene('cubeField');      // Large cube field
// sceneManager.loadScene('spinningWorld');  // Spinning objects
// sceneManager.loadScene('performanceTest'); // Stress test
// sceneManager.loadScene('empty');          // Clean scene

// Navigate scenes:
// sceneManager.nextScene();     // Go to next scene
// sceneManager.previousScene(); // Go to previous scene

// Get scene info:
// console.log(sceneManager.getAvailableScenes());
// console.log(sceneManager.getCurrentSceneInfo());
// console.log(sceneManager.getScenePerformanceStats());

// Make scene manager globally available for console access
window.sceneManager = sceneManager;
window.game = game;