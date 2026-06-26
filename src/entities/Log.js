import { CELL_SIZE, GAME_WIDTH } from '../config.js';
import { drawLog } from '../utils/Draw.js';

export class Log {
  constructor(scene, laneY, speed, dir, startX) {
    this.scene = scene;
    this.laneY = laneY;
    this.speed = speed;
    this.dir = dir;
    this.w = Phaser.Math.Between(100, 160);
    this.h = 48;

    this.g = scene.add.graphics();
    this.g.setDepth(2);
    drawLog(this.g, this.w, this.h);

    this.g.x = startX ?? (dir > 0 ? -this.w - 20 : GAME_WIDTH + 20);
    this.g.y = laneY + (CELL_SIZE - this.h) / 2;
  }

  get x() { return this.g.x; }
  get y() { return this.g.y; }

  getBounds() {
    return new Phaser.Geom.Rectangle(this.g.x + 4, this.g.y + 4, this.w - 8, this.h - 8);
  }

  update(delta) {
    this.g.x += this.speed * delta * this.dir;
  }

  isOffScreen() {
    return this.dir > 0 ? this.g.x > GAME_WIDTH + 200 : this.g.x + this.w < -200;
  }

  destroy() {
    this.g.destroy();
  }
}
