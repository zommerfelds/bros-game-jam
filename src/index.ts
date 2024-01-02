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
    roundPixels: true,
};

const params = new URLSearchParams(window.location.search);
const startScene = params.get('scene') ?? 'MenuScene';

const game = new Phaser.Game(config);

const allScenes = [MenuScene, PlayScene, GameEndScene];

for (let SceneClass of allScenes) {
    const instance = new SceneClass();
    game.scene.add(instance.key, instance, instance.key == startScene);
}