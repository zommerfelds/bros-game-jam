import 'phaser';

// @ts-ignore
import tileset from '../public/assets/tileset.png';

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
    playerMoveTween?: Phaser.Tweens.Tween;
    playerInputMoveDir?: Phaser.Math.Vector2 = undefined;

    staticMap = [
        [2, 2, 2, 2, 2, 2, 2, 2],
        [2, 8, 8, 8, 8, 8, 8, 2],
        [2, 2, 8, 8, 8, 8, 8, 2],
        [-1, 2, 2, 2, 2, 8, 2, 2],
        [-1, -1, -1, -1, 2, 8, 2, -1],
        [-1, 2, 2, 2, 2, 8, 2, -1],
        [-1, 2, 9, 9, 9, 9, 2, -1],
        [-1, 2, 9, 9, 9, 9, 2, -1],
        [-1, 2, 9, 9, 9, 9, 2, -1],
        [-1, 2, 9, 9, 9, 9, 2, -1],
        [-1, 2, 9, 9, 9, 9, 2, -1],
        [-1, 2, 9, 9, 9, 9, 2, -1],
        [-1, 2, 2, 2, 2, 2, 2, -1],
    ];
    entities = [
        { type: "box1", x: 3, y: 8 },
        { type: "box2", x: 4, y: 10 },
    ];
    mapBoxes: Array<Array<{ obj: Phaser.GameObjects.Image } | undefined>>;
    mapWidth = this.staticMap[0].length;
    mapHeight = this.staticMap.length;
    allMovableObjects: Array<Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Depth> = [];

    constructor() {
        super();
        this.mapBoxes = [];
        for (let y = 0; y < this.mapHeight; y++) {
            this.mapBoxes[y] = [];
        }
    }

    preload() {
        this.load.path = 'assets/';
        this.load.spritesheet('tiles', tileset, { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const tileId = this.staticMap[y][x];
                if (tileId != -1) {
                    const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                    tile.depth = tile.y + (this.isGroundTile(tileId) ? -1000 : 0);
                }
            }
        }
        let tileId = -1;
        for (let entity of this.entities) {
            switch (entity.type) {
                case "box1": tileId = this.TILES_BOX1; break;
                case "box2": tileId = this.TILES_BOX2; break;
                default: throw `invalid type ${entity['type']}`;
            }
            const tile = this.add.image(10 + 8 + 16 * entity.x, 10 + 8 + 11 * entity.y, 'tiles', tileId);
            this.mapBoxes[entity.y][entity.x] = { obj: tile };
            this.allMovableObjects.push(tile);
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
        this.player = this.add.sprite(10 + 8 + 16 * this.playerX, 10 + 8 + 11 * this.playerY, 'unused');
        this.player.play('idle');
        this.allMovableObjects.push(this.player);

        this.keyUp = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.keyDown = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.keyLeft = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.keyRight = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    move(diffX: number, diffY: number) {
        let targetX = this.playerX + diffX;
        let targetY = this.playerY + diffY;

        if (diffX != 0.0) {
            this.player.flipX = (diffX == 1);
        }

        if (this.canMove(diffX, diffY)) {
            const box = this.mapBoxes[targetY][targetX];
            if (box) {
                this.tweens.add({
                    targets: box.obj,
                    x: 10 + 8 + 16 * (targetX + diffX),
                    y: 10 + 8 + 11 * (targetY + diffY),
                    duration: 250,
                    ease: Phaser.Math.Easing.Quadratic.InOut,
                    delay: 30,
                });
                this.mapBoxes[targetY][targetX] = undefined;
                this.mapBoxes[targetY + diffY][targetX + diffX] = box;
            }

            this.player.play('walk');
            this.playerX = targetX;
            this.playerY = targetY;
            this.playerMoveTween?.stop();
            this.playerMoveTween = this.tweens.add({
                targets: this.player,
                x: 10 + 8 + 16 * targetX,
                y: 10 + 8 + 11 * targetY,
                duration: 250,
                ease: Phaser.Math.Easing.Quadratic.InOut,
                onComplete: () => this.player.play('idle'),
            });
        }

    }

    update() {
        this.readInput();
        for (let obj of this.allMovableObjects) {
            obj.depth = obj.y;
        }
    }

    readInput() {
        // Don't read input while moving.
        if (this.playerMoveTween?.isActive()) return;

        // Keyboard
        if (this.keyLeft.isDown) this.move(-1, 0);
        if (this.keyRight.isDown) this.move(1, 0);
        if (this.keyUp.isDown) this.move(0, -1);
        if (this.keyDown.isDown) this.move(0, 1);

        // Touch
        const pointer = this.input.pointer1;
        if (pointer.isDown) {
            const diff = new Phaser.Math.Vector2(pointer.x - pointer.downX, pointer.y - pointer.downY);
            if (diff.length() < 15) return;
            if (this.playerInputMoveDir) {
                // Keep going in the same direction until the player releases.
                this.move(this.playerInputMoveDir.x, this.playerInputMoveDir.y);
            } else {
                const dirs = [
                    new Phaser.Math.Vector2(1, 0), new Phaser.Math.Vector2(-1, 0),
                    new Phaser.Math.Vector2(0, -1), new Phaser.Math.Vector2(0, 1)];
                let maxDot = 0.0;
                let maxDir = new Phaser.Math.Vector2(0, 0);
                for (let dir of dirs) {
                    const dot = diff.dot(dir);
                    if (dot > maxDot) {
                        maxDot = dot;
                        maxDir = dir;
                    }
                }
                this.move(maxDir.x, maxDir.y);
                this.playerInputMoveDir = maxDir;
            }
        } else {
            this.playerInputMoveDir = undefined;
        }
    }

    canMove(diffX: number, diffY: number) {
        let targetX = this.playerX + diffX;
        let targetY = this.playerY + diffY;
        if (targetX < 0 || targetX >= this.mapWidth || targetY < 0 || targetY > this.mapHeight)
            return false;
        // TODO: refactor this once there are more object types
        const box = this.mapBoxes[targetY][targetX];
        if (box) {
            let boxTargetX = targetX + diffX;
            let boxTargetY = targetY + diffY;
            if (boxTargetX < 0 || boxTargetX >= this.mapWidth || boxTargetY < 0 || boxTargetY > this.mapHeight)
                return false;
            return this.mapBoxes[boxTargetY][boxTargetX] == undefined && this.isGroundTile(this.staticMap[boxTargetY][boxTargetX]);
        } else
            return this.isGroundTile(this.staticMap[targetY][targetX]);
    }

    isGroundTile(tileId: number) {
        return tileId == this.TILES_FLOOR_SAND || tileId == this.TILES_FLOOR_DIRT;
    }

    isBoxTile(tileId: number) {
        return tileId == this.TILES_BOX1 || tileId == this.TILES_BOX2;
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
