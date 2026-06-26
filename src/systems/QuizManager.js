import { GAME_WIDTH, CELL_SIZE, COLORS } from '../config.js';
import { Gate } from '../entities/Gate.js';
import { plantFamilies } from '../data/plantFamilies.js';

const GATE_W = 174;
const GATE_H = 62;
const WALL_W = 40;

export class QuizManager {
  constructor(scene) {
    this.scene = scene;
    this.state = 'IDLE'; // IDLE | ACTIVE | ENTERED
    this.recentIds = [];
    this.leftGate = null;
    this.rightGate = null;
    this.correctSide = null;
    this.correctFamily = null;
    this.hudBg = null;
    this.hudTitle = null;
    this.hudHint = null;
    this.walls = null;
    this.activeLaneY = null;
    this.onCorrect = null;
    this.onWrong = null;
  }

  _pick2() {
    const pool = plantFamilies.filter(f => !this.recentIds.includes(f.id));
    const idx1 = Math.floor(Math.random() * pool.length);
    let f1 = pool[idx1];
    const pool2 = plantFamilies.filter(f => f.id !== f1.id && !this.recentIds.slice(0, 2).includes(f.id));
    const f2 = pool2[Math.floor(Math.random() * pool2.length)];
    return [f1, f2];
  }

  activate(laneY, onCorrect, onWrong) {
    if (this.state !== 'IDLE') return;
    this.state = 'ACTIVE';
    this.activeLaneY = laneY;
    this.onCorrect = onCorrect;
    this.onWrong = onWrong;

    const [fA, fB] = this._pick2();
    this.correctFamily = fA;
    this.correctSide = Math.random() < 0.5 ? 'left' : 'right';
    const leftFamily = this.correctSide === 'left' ? fA : fB;
    const rightFamily = this.correctSide === 'right' ? fA : fB;

    this.recentIds.unshift(fA.id);
    if (this.recentIds.length > 4) this.recentIds.pop();

    const gateY = laneY + (CELL_SIZE - GATE_H) / 2;

    // Walls
    this.walls = this.scene.add.graphics().setDepth(5);
    this._drawWalls(laneY);

    // Gates
    this.leftGate = new Gate(this.scene, WALL_W, gateY, GATE_W, GATE_H, leftFamily);
    this.rightGate = new Gate(this.scene, GAME_WIDTH - WALL_W - GATE_W, gateY, GATE_W, GATE_H, rightFamily);

    // HUD
    this._showHUD(fA);
  }

  _drawWalls(laneY) {
    const g = this.walls;
    g.clear();
    const brickH = 14, brickW = 18;
    [0, GAME_WIDTH - WALL_W].forEach((wx, wi) => {
      for (let row = 0; row < Math.ceil(CELL_SIZE / brickH); row++) {
        const offset = row % 2 === 0 ? 0 : brickW / 2;
        for (let col = 0; col < Math.ceil(WALL_W / brickW) + 1; col++) {
          const bx = wx + col * brickW - offset;
          const by = laneY + row * brickH;
          g.fillStyle(COLORS.wall, 1);
          g.fillRect(bx, by, brickW - 1, brickH - 1);
          g.fillStyle(COLORS.wallBrick, 0.4);
          g.fillRect(bx + 1, by + 1, brickW - 3, 4);
        }
      }
    });
  }

  _showHUD(family) {
    const hint = family.quizHints[Math.floor(Math.random() * family.quizHints.length)];
    const W = GAME_WIDTH - 16;

    // Background
    this.hudBg = this.scene.add.graphics().setScrollFactor(0).setDepth(10);
    this.hudBg.fillStyle(COLORS.hudBg, 0.92);
    this.hudBg.fillRoundedRect(8, 8, W, 98, 10);
    this.hudBg.lineStyle(2, 0x7c3aed, 0.8);
    this.hudBg.strokeRoundedRect(8, 8, W, 98, 10);

    this.hudTitle = this.scene.add.text(GAME_WIDTH / 2, 22, '🌿 Welke plantenfamilie?', {
      fontSize: '14px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#7dd3fc',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(11);

    this.hudHint = this.scene.add.text(GAME_WIDTH / 2, 42, hint, {
      fontSize: '12px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: W - 24 },
      lineSpacing: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(11);

    // Slide in from top
    this.hudBg.y = -110;
    this.hudTitle.y += -110;
    this.hudHint.y += -110;
    this.scene.tweens.add({
      targets: [this.hudBg, this.hudTitle, this.hudHint],
      y: '+=' + 110,
      duration: 380,
      ease: 'Back.easeOut',
    });
  }

  _hideHUD() {
    this.scene.tweens.add({
      targets: [this.hudBg, this.hudTitle, this.hudHint],
      y: '-=110',
      duration: 280,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.hudBg?.destroy(); this.hudTitle?.destroy(); this.hudHint?.destroy();
        this.hudBg = this.hudTitle = this.hudHint = null;
      },
    });
  }

  checkPlayerInGate(playerX, playerY) {
    if (this.state !== 'ACTIVE') return;
    if (Math.abs(playerY - this.activeLaneY - CELL_SIZE / 2) > CELL_SIZE * 0.7) return;

    const leftB = this.leftGate.getBounds();
    const rightB = this.rightGate.getBounds();

    let entered = null;
    if (playerX > leftB.x && playerX < leftB.x + leftB.width) entered = 'left';
    else if (playerX > rightB.x && playerX < rightB.x + rightB.width) entered = 'right';

    if (!entered) return;

    this.state = 'ENTERED';
    const correct = entered === this.correctSide;

    if (correct) {
      this.leftGate.setState('correct');
      this.rightGate.setState('correct');
    } else {
      const wrongGate = entered === 'left' ? this.leftGate : this.rightGate;
      const rightGate = entered === 'left' ? this.rightGate : this.leftGate;
      wrongGate.setState('wrong');
      rightGate.setState('correct');
    }

    this.scene.time.delayedCall(correct ? 400 : 600, () => {
      this._hideHUD();
      this.walls?.destroy();
      this.leftGate?.destroy();
      this.rightGate?.destroy();
      this.walls = this.leftGate = this.rightGate = null;
      this.state = 'IDLE';
      if (correct) this.onCorrect?.();
      else this.onWrong?.();
    });
  }

  destroy() {
    this._hideHUD();
    this.walls?.destroy();
    this.leftGate?.destroy();
    this.rightGate?.destroy();
  }
}
