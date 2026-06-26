import { CELL_SIZE, COLORS } from '../config.js';

export class Gate {
  constructor(scene, x, y, w, h, family) {
    this.scene = scene;
    this.family = family;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.state = 'neutral'; // neutral | correct | wrong

    this.g = scene.add.graphics();
    this.g.setDepth(5);
    this.g.x = x;
    this.g.y = y;

    this.label = scene.add.text(x + w / 2, y + h / 2, family.name, {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: w - 12 },
    }).setOrigin(0.5).setDepth(6);

    this.subLabel = scene.add.text(x + w / 2, y + h / 2 + 16, family.dutchName, {
      fontSize: '10px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ccccff',
      align: 'center',
    }).setOrigin(0.5).setDepth(6);

    this._draw();
  }

  _draw() {
    const g = this.g;
    const { w, h } = this;
    g.clear();
    const color = this.state === 'correct' ? COLORS.gateCorrect
      : this.state === 'wrong' ? COLORS.gateWrong
      : COLORS.gateNeutral;
    const borderColor = this.state === 'correct' ? 0x4ade80
      : this.state === 'wrong' ? 0xf87171
      : COLORS.gateBorder;

    // Glow backdrop
    g.fillStyle(color, 0.15);
    g.fillRoundedRect(-4, -4, w + 8, h + 8, 14);
    // Gate fill
    g.fillStyle(color, 0.75);
    g.fillRoundedRect(0, 0, w, h, 10);
    // Border
    g.lineStyle(3, borderColor, 1);
    g.strokeRoundedRect(0, 0, w, h, 10);
    // Top arch highlight
    g.fillStyle(0xffffff, 0.12);
    g.fillRoundedRect(6, 4, w - 12, 10, 5);
    // Family color stripe
    g.fillStyle(this.family.color || 0x9060e0, 0.6);
    g.fillRoundedRect(6, h - 14, w - 12, 8, 4);
  }

  setState(state) {
    this.state = state;
    this._draw();
    // Pulse animation
    this.scene.tweens.add({
      targets: [this.g, this.label, this.subLabel],
      scaleX: { from: 1, to: 1.06 },
      scaleY: { from: 1, to: 1.06 },
      duration: 180,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  getBounds() {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.w, this.h);
  }

  setScrollFactor(f) {
    this.g.setScrollFactor(f);
    this.label.setScrollFactor(f);
    this.subLabel.setScrollFactor(f);
  }

  destroy() {
    this.g.destroy();
    this.label.destroy();
    this.subLabel.destroy();
  }
}
