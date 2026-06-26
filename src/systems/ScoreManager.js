import { GAME_WIDTH } from '../config.js';

const LS_KEY = 'roadyPlanty_highScore';

export class ScoreManager {
  constructor(scene, startGridY) {
    this.scene = scene;
    this.startGridY = startGridY;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem(LS_KEY) || '0');
    this.quizBonus = 0;

    this.scoreTxt = scene.add.text(GAME_WIDTH - 12, 12, '0', {
      fontSize: '22px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(12);

    this.hsTxt = scene.add.text(GAME_WIDTH - 12, 38, `Best: ${this.highScore}`, {
      fontSize: '13px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(12);
  }

  update(playerGridY) {
    const steps = Math.max(0, this.startGridY - playerGridY);
    this.score = steps + this.quizBonus;
    this.scoreTxt.setText(this.score.toString());
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.hsTxt.setText(`Best: ${this.highScore}`);
    }
  }

  addBonus(pts) {
    this.quizBonus += pts;
    this.scene.tweens.add({
      targets: this.scoreTxt,
      scaleX: 1.4, scaleY: 1.4,
      duration: 150, yoyo: true, ease: 'Sine.easeOut',
    });
  }

  save() {
    if (this.score > parseInt(localStorage.getItem(LS_KEY) || '0')) {
      localStorage.setItem(LS_KEY, this.score.toString());
    }
  }

  destroy() {
    this.scoreTxt.destroy();
    this.hsTxt.destroy();
  }
}
