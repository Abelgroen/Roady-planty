import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';

const LS_KEY = 'roadyPlanty_highScore';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'Menu' }); }

  create() {
    // Background gradient effect
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d1117, 0x0d1117, 0x1a1035, 0x1a1035, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Decorative lane stripes
    const lane = this.add.graphics();
    for (let i = 0; i < 6; i++) {
      lane.fillStyle(i % 2 === 0 ? 0x4a8c45 : 0x3a7035, 0.18);
      lane.fillRect(0, i * 110, GAME_WIDTH, 80);
    }

    // Animated bouncing dots
    for (let i = 0; i < 8; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(0x9060e0, 0.3);
      dot.fillCircle(0, 0, Phaser.Math.Between(6, 18));
      dot.x = Phaser.Math.Between(20, GAME_WIDTH - 20);
      dot.y = Phaser.Math.Between(20, GAME_HEIGHT - 20);
      this.tweens.add({
        targets: dot, y: dot.y - Phaser.Math.Between(30, 80),
        duration: Phaser.Math.Between(1400, 2800),
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: i * 180,
      });
    }

    // Logo background
    const logoBg = this.add.graphics();
    logoBg.fillStyle(0x000000, 0.45);
    logoBg.fillRoundedRect(GAME_WIDTH / 2 - 180, 90, 360, 140, 20);
    logoBg.lineStyle(2, 0x9060e0, 0.7);
    logoBg.strokeRoundedRect(GAME_WIDTH / 2 - 180, 90, 360, 140, 20);

    // Title
    this.add.text(GAME_WIDTH / 2, 128, 'ROADY', {
      fontSize: '58px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#7dd3fc',
      fontStyle: 'bold',
      stroke: '#0d1117',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 182, 'PLANTY 🌿', {
      fontSize: '34px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#4ade80',
      fontStyle: 'bold',
      stroke: '#0d1117',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME_WIDTH / 2, 250, 'Leer plantenfamilies voor je tentamen!', {
      fontSize: '14px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#94a3b8',
      align: 'center',
    }).setOrigin(0.5);

    // High score
    const hs = parseInt(localStorage.getItem(LS_KEY) || '0');
    if (hs > 0) {
      this.add.text(GAME_WIDTH / 2, 286, `Hoogste score: ${hs}`, {
        fontSize: '15px',
        fontFamily: '"Segoe UI", Arial, sans-serif',
        color: '#ffd700',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // Play button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x7c3aed, 1);
    btnBg.fillRoundedRect(GAME_WIDTH / 2 - 110, 330, 220, 58, 14);
    btnBg.lineStyle(2, 0xc4b5fd, 1);
    btnBg.strokeRoundedRect(GAME_WIDTH / 2 - 110, 330, 220, 58, 14);

    const playTxt = this.add.text(GAME_WIDTH / 2, 359, '▶  SPELEN', {
      fontSize: '22px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Pulse the button
    this.tweens.add({
      targets: [btnBg, playTxt], scaleX: 1.04, scaleY: 1.04,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 415, '← → ↑ ↓  of  WASD  of  swipe', {
      fontSize: '13px', fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#64748b',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 438, 'Ga door het juiste poortje!', {
      fontSize: '13px', fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#64748b',
    }).setOrigin(0.5);

    // Families info panel
    const panelY = 470;
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0f172a, 0.8);
    panelBg.fillRoundedRect(12, panelY, GAME_WIDTH - 24, GAME_HEIGHT - panelY - 12, 12);
    panelBg.lineStyle(1, 0x334155, 0.8);
    panelBg.strokeRoundedRect(12, panelY, GAME_WIDTH - 24, GAME_HEIGHT - panelY - 12, 12);

    this.add.text(GAME_WIDTH / 2, panelY + 14, '20 plantenfamilies', {
      fontSize: '12px', fontFamily: '"Segoe UI", Arial, sans-serif',
      color: '#7dd3fc', fontStyle: 'bold',
    }).setOrigin(0.5);

    const families = ['Ranunculaceae','Betulaceae','Fagaceae','Caryophyllaceae','Polygonaceae',
      'Brassicaceae','Rosaceae','Fabaceae','Geraniaceae','Apiaceae',
      'Boraginaceae','Lamiaceae','Plantaginaceae','Orobanchaceae','Rubiaceae',
      'Caprifoliaceae','Asteraceae','Poaceae','Cyperaceae','Juncaceae'];
    const colors = [0xfbbf24,0xa3e635,0x92400e,0xf9a8d4,0xc084fc,
      0xfef08a,0xfb7185,0x818cf8,0xf97316,0xfde68a,
      0x60a5fa,0xa78bfa,0x6ee7b7,0xd97706,0x34d399,
      0xf472b6,0xfbbf24,0x86efac,0x4ade80,0xbef264];

    for (let i = 0; i < families.length; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 20 + col * (GAME_WIDTH / 2 - 10);
      const y = panelY + 34 + row * 16;
      const dot = this.add.graphics();
      const c = colors[i];
      dot.fillStyle(c, 1);
      dot.fillCircle(x + 5, y + 5, 4);
      this.add.text(x + 14, y, families[i], {
        fontSize: '10px', fontFamily: '"Segoe UI", Arial, sans-serif',
        color: '#cbd5e1',
      });
    }

    // Input
    this.input.keyboard.once('keydown', () => this.scene.start('Game'));
    this.input.once('pointerdown', () => this.scene.start('Game'));
  }
}
