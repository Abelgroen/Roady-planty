import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

const LS_KEY = 'roadyPlanty_highScore';

export class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOver' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.correctFamily = data.correctFamily || null;
    this.reason = data.reason || 'obstacle';
  }

  create() {
    // Save high score
    const prev = parseInt(localStorage.getItem(LS_KEY) || '0');
    const isNew = this.finalScore > prev;
    if (isNew) localStorage.setItem(LS_KEY, this.finalScore.toString());

    // Dark overlay
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.88);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Panel
    const panelW = 360, panelH = isNew ? 360 : 320;
    const px = (GAME_WIDTH - panelW) / 2;
    const py = (GAME_HEIGHT - panelH) / 2;
    bg.fillStyle(0x0f172a, 0.97);
    bg.fillRoundedRect(px, py, panelW, panelH, 18);
    bg.lineStyle(2, 0x7c3aed, 1);
    bg.strokeRoundedRect(px, py, panelW, panelH, 18);

    // Title
    this.add.text(GAME_WIDTH / 2, py + 30, '🥀 Game Over', {
      fontSize: '32px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#f87171',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Wrong family info
    if (this.reason === 'wrong_gate' && this.correctFamily) {
      this.add.text(GAME_WIDTH / 2, py + 76, 'Fout poortje! Het was:', {
        fontSize: '14px', fontFamily: '"Segoe UI", Arial, sans-serif', color: '#94a3b8',
      }).setOrigin(0.5);
      this.add.text(GAME_WIDTH / 2, py + 96, this.correctFamily.name, {
        fontSize: '20px', fontFamily: '"Segoe UI", Arial, sans-serif',
        color: '#4ade80', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.add.text(GAME_WIDTH / 2, py + 118, `(${this.correctFamily.dutchName})`, {
        fontSize: '13px', fontFamily: '"Segoe UI", Arial, sans-serif', color: '#64748b',
      }).setOrigin(0.5);
    } else {
      this.add.text(GAME_WIDTH / 2, py + 76, this.reason === 'water' ? '💧 Je viel in het water!' : '🚗 Geraakt door een auto!', {
        fontSize: '16px', fontFamily: '"Segoe UI", Arial, sans-serif', color: '#94a3b8',
      }).setOrigin(0.5);
    }

    // Score
    const scoreY = py + (this.reason === 'wrong_gate' ? 152 : 112);
    this.add.text(GAME_WIDTH / 2, scoreY, 'Score', {
      fontSize: '14px', fontFamily: '"Segoe UI", Arial, sans-serif', color: '#64748b',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, scoreY + 24, this.finalScore.toString(), {
      fontSize: '52px', fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ffd700', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    if (isNew) {
      const newBest = this.add.text(GAME_WIDTH / 2, scoreY + 78, '⭐ Nieuw record!', {
        fontSize: '16px', fontFamily: '"Segoe UI", Arial, sans-serif',
        color: '#fbbf24', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: newBest, scaleX: 1.1, scaleY: 1.1,
        duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    // Retry button
    const btnY = py + panelH - 58;
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x7c3aed, 1);
    btnBg.fillRoundedRect(px + 30, btnY, panelW - 60, 48, 12);
    btnBg.lineStyle(2, 0xc4b5fd, 1);
    btnBg.strokeRoundedRect(px + 30, btnY, panelW - 60, 48, 12);
    const btnTxt = this.add.text(GAME_WIDTH / 2, btnY + 24, '↩  Probeer opnieuw', {
      fontSize: '18px', fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: [btnBg, btnTxt], scaleX: 1.03, scaleY: 1.03,
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Slide in
    [bg, btnBg, btnTxt].forEach(o => { o.alpha = 0; });
    this.tweens.add({ targets: [bg, btnBg, btnTxt], alpha: 1, duration: 400 });

    this.time.delayedCall(500, () => {
      this.input.keyboard.once('keydown', () => this.scene.start('Game'));
      this.input.once('pointerdown', () => this.scene.start('Game'));
    });
  }
}
