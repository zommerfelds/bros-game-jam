import tileset from '../public/assets/tileset.png';
import fontPng from '../public/assets/arcade.png';
import fontXml from '../public/assets/arcade.xml';
import tileData from '../public/assets/tiled/tileset.json';
import asepriteTileInfo from '../public/assets/tileset.json';

import { MyScene } from './MyScene';

export class PlayScene extends MyScene {
    constructor() { super('PlayScene'); }

    keyUp: Phaser.Input.Keyboard.Key;
    keyDown: Phaser.Input.Keyboard.Key;
    keyLeft: Phaser.Input.Keyboard.Key;
    keyRight: Phaser.Input.Keyboard.Key;

    player: Phaser.GameObjects.Sprite;
    playerX: number = 4;
    playerY: number = 7;
    playerMoveTween?: Phaser.Tweens.Tween;
    playerInputMoveDir?: Phaser.Math.Vector2 = undefined;
    sword: Phaser.GameObjects.Image;

    walls: Array<Array<boolean>>;
    mapBoxes: Array<Array<{ obj: Phaser.GameObjects.Image } | undefined>>;
    mapExits: Array<Array<any>>;
    monster1List: Array<Array<Phaser.GameObjects.Image>>;
    mapWidth: number;
    mapHeight: number;
    allMovableObjects: Array<Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Depth> = [];
    level: number;
    levelJsonKey: string;

    init(data: any) {
        this.level = data.level ?? 1;
        this.mapBoxes = [];
        this.mapExits = [];
        this.monster1List = [];
        this.walls = [];
        this.player = undefined;
    }

    preload() {
        this.load.path = 'assets/';
        this.load.spritesheet('tiles', tileset, { frameWidth: 16, frameHeight: 16 });
        this.load.bitmapFont('arcade', fontPng, fontXml);
        this.levelJsonKey = 'level' + this.level;
        this.load.json(this.levelJsonKey, `tiled/level${this.level}.json`);
    }

    create() {
        const mapData = this.cache.json.get(this.levelJsonKey);
        if (mapData === undefined) {
            this.scene.start("GameEndScene");
            return;
        }
        this.mapWidth = mapData['width'];
        this.mapHeight = mapData['height'];

        for (let y = 0; y < this.mapHeight; y++) {
            this.mapBoxes[y] = [];
            this.mapExits[y] = [];
            this.monster1List[y] = [];
            this.walls[y] = [];
        }

        const tileDataById: Map<number, { type: string }> = new Map();
        const playerFrames = [];
        const playerFramesIdle = [];
        for (let t of tileData['tiles']) {
            tileDataById.set(
                t['id'],
                { type: t['type'] }
            );
            if (t['type'] == 'player') {
                playerFrames.push(t['id']);
            }
            if (t['type'] == 'player-idle') {
                playerFramesIdle.push(t['id']);
            }
        }

        for (let layer of mapData['layers']) {
            const renderLayer = this.add.layer();
            for (let y = 0; y < this.mapHeight; y++) {
                for (let x = 0; x < this.mapWidth; x++) {
                    const tileId = layer['data'][y * this.mapWidth + x] - 1;
                    if (tileId != -1) {
                        switch (tileDataById.get(tileId)?.type) {
                            case undefined: {
                                // No class/type means it's a ground tile.
                                const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                                tile.depth = tile.y - 1000; // TODO: temp hack until layer issue is fixed.
                                renderLayer.add(tile);
                                break;
                            }
                            case 'wall': {
                                this.walls[y][x] = true;
                                const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                                tile.depth = tile.y;
                                renderLayer.add(tile);
                                break;
                            }
                            case 'box': {
                                const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                                tile.depth = tile.y;
                                renderLayer.add(tile);
                                this.mapBoxes[y][x] = { obj: tile };
                                this.allMovableObjects.push(tile);
                                break;
                            }
                            case 'player':
                            case 'player-idle': {
                                if (this.player !== undefined) {
                                    throw `multiple player tiles found`;
                                }
                                this.playerX = x;
                                this.playerY = y;
                                this.player = this.add.sprite(10 + 8 + 16 * this.playerX, 10 + 8 + 11 * this.playerY, 'unused');
                                renderLayer.add(this.player);
                                break;
                            }
                            case 'flag': {
                                const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                                tile.depth = tile.y;
                                renderLayer.add(tile);
                                this.mapExits[y][x] = true;
                                break;
                            }
                            case 'monster1': {
                                const tile = this.add.image(10 + 8 + 16 * x, 10 + 8 + 11 * y, 'tiles', tileId);
                                tile.depth = tile.y;
                                renderLayer.add(tile);
                                this.monster1List[y][x] = tile;
                                break;
                            }
                            default:
                                throw `invalid tile type ${tileDataById.get(tileId)?.type}`;
                        }
                    }
                }
            }
        }

        if (this.anims.get('walk') == undefined) {
            // Can replace this by loading anim from JSON.
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('tiles', { frames: playerFrames }),
                frameRate: 10,
                repeat: -1,
            });
            this.anims.create({
                key: 'idle',
                frames: this.anims.generateFrameNumbers('tiles', { frames: playerFramesIdle }),
                frameRate: 2,
                repeat: -1,
            });
        }
        this.player.play('idle');
        this.allMovableObjects.push(this.player);

        for (let slice of asepriteTileInfo.meta.slices) {
            if (slice.name != "sword") continue;
            const bounds = slice.keys[0].bounds;

            console.warn(bounds, bounds.x / 16 + bounds.y / 16 * asepriteTileInfo.meta.size.w / 16);
            this.sword = this.add.image(0, 0, 'tiles', bounds.x / 16 + bounds.y / 16 * asepriteTileInfo.meta.size.w / 16);
            this.sword.visible = false;
            break;
        }

        this.cameras.main.startFollow(this.player);

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
                    delay: 10,
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
                // ease: Phaser.Math.Easing.Quadratic.InOut,
                onComplete: () => {
                    this.player.play('idle');
                    if (this.mapExits[targetY][targetX] != undefined) {
                        this.destroyCrashFix();
                        this.scene.restart({ level: this.level + 1 });
                    }
                },
            });
        } else if (this.canAttack(diffX, diffY)) {
            const monster = this.monster1List[targetY][targetX];
            this.sword.visible = true;
            this.sword.x = this.player.x;
            this.sword.y = this.player.y;
            this.sword.angle = diffY * 90;
            this.sword.flipX = diffX < 0.0;
            this.playerMoveTween = this.tweens.add({
                targets: this.sword,
                x: this.sword.x + 16 * diffX,
                y: this.sword.y + 11 * diffY,
                duration: 200,
                ease: Phaser.Math.Easing.Circular.In,
                onComplete: () => {
                    this.sword.visible = false;
                    monster.destroy();
                },
            })
            this.monster1List[targetY][targetX] = undefined;
        }
    }

    // Hack to prevent crashing until this issue is fixed:
    // https://github.com/photonstorm/phaser/issues/6675
    destroyCrashFix() {
        for (let child of this.children.getAll()) {
            if (child instanceof Phaser.GameObjects.Layer) {
                child.destroy();
            }
        }
    }

    update() {
        this.readInput();
        for (let obj of this.allMovableObjects) {
            obj.depth = obj.y;
        }
    }

    readInput() {
        if (!this.input.pointer1.isDown) {
            this.playerInputMoveDir = undefined;
        }

        // Don't allow further moves if there is already one in progress.
        if (this.playerMoveTween?.isActive()) return;

        // Keyboard
        if (this.keyLeft.isDown) this.move(-1, 0);
        else if (this.keyRight.isDown) this.move(1, 0);
        else if (this.keyUp.isDown) this.move(0, -1);
        else if (this.keyDown.isDown) this.move(0, 1);

        // Touch
        else if (this.input.pointer1.isDown) {
            const diff = new Phaser.Math.Vector2(this.input.pointer1.x - this.input.pointer1.downX, this.input.pointer1.y - this.input.pointer1.downY);
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
                this.playerInputMoveDir = maxDir;
            }
        }
    }

    canMove(diffX: number, diffY: number): boolean {
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
            return this.mapBoxes[boxTargetY][boxTargetX] == undefined && !this.walls[boxTargetY][boxTargetX];
        } else
            return !this.walls[targetY][targetX] && !this.monster1List[targetY][targetX];
    }

    canAttack(diffX: number, diffY: number): boolean {
        let targetX = this.playerX + diffX;
        let targetY = this.playerY + diffY;
        if (targetX < 0 || targetX >= this.mapWidth || targetY < 0 || targetY > this.mapHeight)
            return false;
        return this.monster1List[targetY][targetX] !== undefined;
    }
}