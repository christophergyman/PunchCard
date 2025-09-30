import { GameEngine } from './game-engine.js';
import { SceneManager } from './scene-manager.js';

// Initialize the game
const game = new GameEngine();

// Initialize scene manager
const sceneManager = new SceneManager(game);

// Load the modular scene
sceneManager.loadScene('scene1');

// === SCENE CONTROLS ===
// You can use these in the browser console or add UI controls:

// Load your custom scenes:
// sceneManager.loadScene('myScene');        // Your custom scene
// sceneManager.loadScene('anotherScene');   // Another custom scene

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