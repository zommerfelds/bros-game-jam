import 'phaser';

import { MenuScene } from './MenuScene';
import { PlayScene } from './PlayScene';
import { GameEndScene } from './GameEndScene';

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 132,
    height: 236,
    zoom: 5,
    pixelArt: true,
    antialias: false,
    autoRound: true,
    roundPixels: false,
};

const params = new URLSearchParams(window.location.search);
// For local dev: http://localhost:8080/?scene=PlayScene&level=3
const startScene = params.get('scene') ?? 'MenuScene';
const startLevel = parseInt(params.get('level') ?? '1');
const game = new Phaser.Game(config);

const allScenes = [MenuScene, PlayScene, GameEndScene];

for (let SceneClass of allScenes) {
    const instance = new SceneClass();
    game.scene.add(instance.key, instance, instance.key == startScene, { level: startLevel });
}
