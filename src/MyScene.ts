export class MyScene extends Phaser.Scene {
    public readonly key: string;

    constructor(key: string) {
        super({ key });

        this.key = key;
    }
}