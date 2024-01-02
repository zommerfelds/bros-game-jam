import fontPng from '../public/assets/arcade.png';
import fontXml from '../public/assets/arcade.xml';
import { MyScene } from './MyScene';

export class GameEndScene extends MyScene {
    constructor() { super('GameEndScene'); }

    preload() {
        this.load.path = 'assets/';
        this.load.bitmapFont('arcade', fontPng, fontXml);
    }

    create() {
        const textStart = this.add.bitmapText(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height * 0.33,
            "arcade", "the end", 8);
        textStart.setOrigin(0.5, 0.5);
    }

    update() {
    }
}