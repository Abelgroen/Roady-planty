import { CELL_SIZE, GAME_WIDTH } from '../config.js';
import { drawCar } from '../utils/Draw.js';

const CAR_COLORS = [0xe63946, 0xf4a261, 0x457b9d, 0x70c1b3, 0xf8c537, 0xd62839, 0x2196f3];

export class Car {
  constructor(scene, laneY, speed, dir, startX, color) {
    this.scene = scene;
    this.laneY = laneY;
    this.speed = speed;
    this.dir = dir; // 1 = right, -1 = left
    this.color = color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

    this.w = Phaser.Math.Between(52, 72);
    this.h = 50;

    this.g = scene.add.graphics();
    this.g.setDepth(3);
    drawCar(this.g, this.w, this.h, this.color);

    this.g.x = startX ?? (dir > 0 ? -this.w - 10 : GAME_WIDTH + 10);
    this.g.y = laneY + (CELL_SIZE - this.h) / 2;

    if (dir < 0) {
      this.g.setScale(-1, 1);
      this.g.x += this.w;
    }
  }

  getBounds() {
    const bx = this.dir > 0 ? this.g.x : this.g.x - this.w;
    return new Phaser.Geom.Rectangle(bx + 4, this.g.y + 4, this.w - 8, this.h - 8);
  }

  update(delta) {
    this.g.x += this.speed * delta * this.dir;
  }

  isOffScreen() {
    const x = this.dir > 0 ? this.g.x : this.g.x - this.w;
    return this.dir > 0 ? x > GAME_WIDTH + 100 : x < -this.w - 100;
  }

  destroy() {
    this.g.destroy();
  }
}
