import 'phaser';

class MyGame extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        this.load.path = 'assets/';
        this.load.image('platform', 'Platform.png');
        this.load.aseprite('swordGuy', 'Sword guy.png', 'Sword guy.json');
    }

    create() {
        this.anims.createFromAseprite('swordGuy');
        this.add.image(64, 66, 'platform');
        const swordGuy = this.add.sprite(88, 50, 'swordGuy').play({ key: 'walk', repeat: -1 });

        this.tweens.chain({
            targets: swordGuy,
            tweens: [
                {
                    x: 40,
                    duration: 1500,
                    onComplete: () => { swordGuy.flipX = true; },
                },
                {
                    x: 88,
                    duration: 1500,
                    onComplete: () => { swordGuy.flipX = false; },
                }
            ],
            loop: -1
        });

    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 128,
    height: 96,
    zoom: 5,
    pixelArt: true,
    antialias: false,
    autoRound: true,
    roundPixels: true,
    scene: MyGame,
};

const game = new Phaser.Game(config);
