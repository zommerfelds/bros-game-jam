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
    playerX: number = 3;
    playerY: number = 7;
    playerMoveTween: Phaser.Tweens.Tween;

    map = [
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
    mapWidth = this.map[0].length;
    mapHeight = this.map.length;

    constructor() {
        super();
    }

    preload() {
        this.load.path = 'assets/';
        this.load.spritesheet('tiles', 'tileset.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {


        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.map[y][x];
                if (tileId != -1) {
                    const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                    tile.depth = tile.y + (this.isGroundTile(tileId) ? -1000 : 0);
                }
            }
        }

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('tiles', { frames: [this.TILES_PLAYER_0, this.TILES_PLAYER_1] }),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('tiles', { frames: [this.TILES_PLAYER_0] }),
        });
        this.player = this.add.sprite(10 + 8 + 16 * this.playerX, 10 + 8 + 11 * this.playerY, undefined);
        this.player.play('idle');

        this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const diff = new Phaser.Math.Vector2(pointer.upX - pointer.downX, pointer.upY - pointer.downY);
            if (diff.length() < 2) return;
            const dirs = [
                new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2(-1, 0),
                new Phaser.Math.Vector2(0, -1), new Phaser.Math.Vector2(0, 1)];
            let maxDot = 0.0;
            let maxDir = null;
            for (let dir of dirs) {
                const dot = diff.dot(dir);
                if (dot > maxDot) {
                    maxDot = dot;
                    maxDir = dir;
                }
            }
            this.move(maxDir.x, maxDir.y);
        });

        this.input.keyboard.on('keydown-UP', (event: any) => this.move(0, -1));
        this.input.keyboard.on('keydown-DOWN', (event: any) => this.move(0, 1));
        this.input.keyboard.on('keydown-LEFT', (event: any) => this.move(-1, 0));
        this.input.keyboard.on('keydown-RIGHT', (event: any) => this.move(1, 0));
    }

    move(diffX: number, diffY: number) {
        let targetX = this.playerX + diffX;
        let targetY = this.playerY + diffY;

        this.player.flipX = (diffX == 1);

        if (this.canMove(targetX, targetY)) {
            this.player.play('walk');
            this.playerX = targetX;
            this.playerY = targetY;
            this.playerMoveTween?.stop();
            this.playerMoveTween = this.tweens.add({
                targets: this.player,
                x: 10 + 8 + 16 * targetX,
                y: 10 + 8 + 11 * targetY,
                duration: 200,
                onComplete: () => this.player.play('idle'),
            });
        }

        this.player.depth = this.player.y;
    }

    update() {
    }

    canMove(x: number, y: number) {
        if (x < 0 || x >= this.mapWidth || y < 0 || y > this.mapHeight)
            return false;
        return this.isGroundTile(this.map[y][x]);
    }

    isGroundTile(tileId: number) {
        return tileId == this.TILES_FLOOR_SAND || tileId == this.TILES_FLOOR_DIRT;
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
