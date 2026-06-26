import Phaser from 'phaser';
import { CELL_SIZE, PLAYER_SIZE, GAME_WIDTH, HOP_DURATION, COLORS } from '../config.js';
import { drawPlayer } from '../utils/Draw.js';

export class Player {
  constructor(scene, gridX, gridY) {
    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.facing = 1;
    this.locked = false;
    this.dead = false;
    this.onLog = null;
    this.maxGridY = gridY;

    this.x = gridX * CELL_SIZE + CELL_SIZE / 2;
    this.y = gridY * CELL_SIZE + CELL_SIZE / 2;

    this.g = scene.add.graphics();
    this.g.setDepth(4);
    this._draw();
    this.g.x = this.x;
    this.g.y = this.y;
  }

  _draw() {
    drawPlayer(this.g, PLAYER_SIZE, this.facing);
  }

  getBounds() {
    return new Phaser.Geom.Rectangle(
      this.g.x - PLAYER_SIZE / 2 + 4,
      this.g.y - PLAYER_SIZE / 2 + 4,
      PLAYER_SIZE - 8,
      PLAYER_SIZE - 8,
    );
  }

  hop(dx, dy) {
    if (this.locked || this.dead) return false;
    const newGX = this.gridX + dx;
    const newGY = this.gridY + dy;
    const minX = 0, maxX = Math.floor(GAME_WIDTH / CELL_SIZE) - 1;
    if (newGX < minX || newGX > maxX) return false;

    this.locked = true;
    this.facing = dx !== 0 ? Math.sign(dx) : this.facing;
    this._draw();

    const targetX = newGX * CELL_SIZE + CELL_SIZE / 2;
    const targetY = newGY * CELL_SIZE + CELL_SIZE / 2;

    // Squash-stretch
    this.scene.tweens.add({
      targets: this.g,
      scaleX: { from: 1, to: 0.82 },
      scaleY: { from: 1, to: 1.38 },
      duration: HOP_DURATION * 0.4,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });

    this.scene.tweens.add({
      targets: this.g,
      x: targetX,
      y: targetY,
      duration: HOP_DURATION,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.gridX = newGX;
        this.gridY = newGY;
        this.x = targetX;
        this.y = targetY;
        if (newGY < this.maxGridY) this.maxGridY = newGY;
        this.locked = false;
        this.onLog = null;
        if (this.onHopComplete) this.onHopComplete(dx, dy);
      },
    });
    return true;
  }

  snapToLog(log) {
    this.onLog = log;
  }

  update(delta) {
    if (this.dead || !this.onLog) return;
    const dx = this.onLog.speed * delta * this.onLog.dir;
    this.g.x += dx;
    this.x = this.g.x;
    this.gridX = Math.round((this.x - CELL_SIZE / 2) / CELL_SIZE);
  }

  die(onDone) {
    if (this.dead) return;
    this.dead = true;
    this.locked = true;
    this.scene.tweens.add({
      targets: this.g,
      scaleX: 0,
      scaleY: 0,
      angle: 180,
      duration: 350,
      ease: 'Back.easeIn',
      onComplete: () => { if (onDone) onDone(); },
    });
  }

  destroy() {
    this.g.destroy();
  }
}
