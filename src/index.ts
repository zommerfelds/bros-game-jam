import 'phaser';

class MyGame extends Phaser.Scene {

    readonly TILES_BOX1 = 0;
    readonly TILES_BOX2 = 1;
    readonly TILES_WALL_DIRT = 2;
    readonly TILES_FLOOR_SAND = 8;
    readonly TILES_FLOOR_DIRT = 9;
    readonly TILES_PLAYER_0 = 24;
    readonly TILES_PLAYER_1 = 25;

    keyUp: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;
    keyLeft: Phaser.Input.Keyboard.Key;
    keyRight: Phaser.Input.Keyboard.Key;

    player: Phaser.GameObjects.Sprite;

    constructor() {
        super();
    }

    preload() {
        this.load.path = 'assets/';
        this.load.spritesheet('tiles', 'tileset.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {

        const map = [
            [2, 2, 2, 2, 2, 2, 2, 2],
            [2, 8, 8, 8, 0, 8, 8, 2],
            [2, 2, 8, 8, 8, 8, 8, 2],
            [-1, 2, 2, 2, 2, 8, 2, 2],
            [-1, -1, -1, -1, 2, 8, 2, -1],
            [-1, 2, 2, 2, 2, 8, 2, -1],
            [-1, 2, 9, 9, 9, 9, 2, -1],
            [-1, 2, 9, 9, 9, 9, 2, -1],
            [-1, 2, 9, 0, 9, 9, 2, -1],
            [-1, 2, 9, 9, 9, 9, 2, -1],
            [-1, 2, 9, 9, 1, 9, 2, -1],
            [-1, 2, 9, 9, 9, 9, 2, -1],
            [-1, 2, 2, 2, 2, 2, 2, -1],
        ];
        const mapWidth = map[0].length;
        const mapHeight = map.length;

        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const tileId = map[y][x];
                if (tileId != -1) {
                    const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                    tile.depth = y;
                }
            }
        }

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('tiles', { frames: [this.TILES_PLAYER_0, this.TILES_PLAYER_1] }),
            frameRate: 8,
            repeat: -1,
        });
        this.player = this.add.sprite(10 + 8 + 16 * 3, 10 + 8 + 11 * 7, undefined);
        this.player.play('walk');
        this.player.depth = 7.5;

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

    }


    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keyUp)) {
            this.player.y -= 11;
            this.player.setDepth(this.player.depth - 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyDown)) {
            this.player.y += 11;
            this.player.setDepth(this.player.depth + 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyLeft)) {
            this.player.x -= 16;
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyRight)) {
            this.player.x += 16;
        }
    }
}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 148,
    height: 220,
    zoom: 5,
    pixelArt: true,
    antialias: false,
    autoRound: true,
    roundPixels: true,
    scene: MyGame,
};

const game = new Phaser.Game(config);
