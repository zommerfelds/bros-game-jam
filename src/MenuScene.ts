// @ts-ignore
import fontPng from '../public/assets/arcade.png';
// @ts-ignore
import fontXml from '../public/assets/arcade.xml';

export class MenuScene extends Phaser.Scene {

    constructor() {
        super();
    }

    preload() {
        this.load.path = 'assets/';
        this.load.bitmapFont('arcade', fontPng, fontXml);
    }

    create() {

        const textStart = this.add.bitmapText(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height * 0.33,
            "arcade", "start game", 8);
        textStart.setOrigin(0.5, 0.5);
        textStart.setInteractive();
        textStart.on('pointerdown', () => {
            console.warn('test');
            this.scene.start("PlayScene");
        });


        const textFullscreen = this.add.bitmapText(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height * 0.66,
            "arcade", "fullscreen", 8);
        textFullscreen.setOrigin(0.5, 0.5);
        textFullscreen.setInteractive();
        textFullscreen.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                console.warn('stop full');
                this.scale.stopFullscreen();
            } else {
                console.warn('start full');
                this.scale.startFullscreen();
            }
        });
    }

    update() {
    }
}