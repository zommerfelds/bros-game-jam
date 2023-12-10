import 'phaser';

class MyGame extends Phaser.Scene {

    readonly TILES_BOX1 = 0;
    readonly TILES_BOX2 = 1;
    readonly TILES_WALL_DIRT = 2;
    readonly TILES_FLOOR_SAND = 8;
    readonly TILES_FLOOR_DIRT = 9;
    readonly TILES_PLAYER = 24;

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
                    tile.setDepth(y);
                }
            }
        }

        const player = this.add.image(10 + 8 + 16 * 3, 10 + 8 + 11 * 7, 'tiles', this.TILES_PLAYER);
        player.setDepth(7);

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
