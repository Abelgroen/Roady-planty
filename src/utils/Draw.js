import { COLORS } from '../config.js';

export function drawPlayer(g, size, facing = 1) {
  g.clear();
  const r = size / 2;
  // Shadow
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(0, r * 0.9, size * 0.9, size * 0.3);
  // Body
  g.fillStyle(COLORS.playerDark, 1);
  g.fillRoundedRect(-r - 2, -r - 2, size + 4, size + 4, 10);
  g.fillStyle(COLORS.player, 1);
  g.fillRoundedRect(-r, -r, size, size, 9);
  // Highlight
  g.fillStyle(0xffffff, 0.18);
  g.fillEllipse(-r * 0.2, -r * 0.55, r * 0.9, r * 0.45);
  // Eyes
  const eyeOffX = facing * r * 0.28;
  g.fillStyle(COLORS.playerEye, 1);
  g.fillCircle(eyeOffX - r * 0.18, -r * 0.2, 7);
  g.fillCircle(eyeOffX + r * 0.18, -r * 0.2, 7);
  g.fillStyle(COLORS.playerPupil, 1);
  g.fillCircle(eyeOffX - r * 0.18 + facing * 1.5, -r * 0.2, 3.5);
  g.fillCircle(eyeOffX + r * 0.18 + facing * 1.5, -r * 0.2, 3.5);
}

export function drawCar(g, w, h, color) {
  g.clear();
  const r = 7;
  // Shadow
  g.fillStyle(0x000000, 0.25);
  g.fillEllipse(w / 2, h * 0.92, w * 0.85, h * 0.28);
  // Body
  g.fillStyle(darken(color, 0.7), 1);
  g.fillRoundedRect(2, 2, w - 4, h - 4, r + 1);
  g.fillStyle(color, 1);
  g.fillRoundedRect(0, 0, w - 4, h - 4, r);
  // Roof / cabin
  g.fillStyle(darken(color, 0.82), 1);
  g.fillRoundedRect(w * 0.18, h * 0.08, w * 0.64, h * 0.45, 5);
  // Windows
  g.fillStyle(COLORS.carWindow, 1);
  g.fillRoundedRect(w * 0.21, h * 0.1, w * 0.28, h * 0.32, 3);
  g.fillRoundedRect(w * 0.52, h * 0.1, w * 0.28, h * 0.32, 3);
  // Window shine
  g.fillStyle(0xffffff, 0.12);
  g.fillRoundedRect(w * 0.22, h * 0.11, w * 0.1, h * 0.12, 2);
  g.fillRoundedRect(w * 0.53, h * 0.11, w * 0.1, h * 0.12, 2);
  // Wheels
  g.fillStyle(COLORS.carWheel, 1);
  g.fillCircle(w * 0.2, h - 4, 6);
  g.fillCircle(w * 0.8, h - 4, 6);
  g.fillCircle(w * 0.2, 4, 6);
  g.fillCircle(w * 0.8, 4, 6);
  g.fillStyle(0x555555, 1);
  g.fillCircle(w * 0.2, h - 4, 3);
  g.fillCircle(w * 0.8, h - 4, 3);
  g.fillCircle(w * 0.2, 4, 3);
  g.fillCircle(w * 0.8, 4, 3);
  // Headlights
  g.fillStyle(0xfffacd, 1);
  g.fillCircle(w - 5, h * 0.35, 3.5);
  g.fillCircle(w - 5, h * 0.65, 3.5);
}

export function drawLog(g, w, h) {
  g.clear();
  // Shadow
  g.fillStyle(0x000000, 0.2);
  g.fillEllipse(w / 2, h * 0.9, w * 0.9, h * 0.25);
  // Log body
  g.fillStyle(COLORS.logDark, 1);
  g.fillRoundedRect(2, 2, w - 4, h - 4, 8);
  g.fillStyle(COLORS.log, 1);
  g.fillRoundedRect(0, 0, w - 4, h - 4, 8);
  // Grain lines
  g.lineStyle(1.5, COLORS.logDark, 0.5);
  for (let i = 1; i < 4; i++) {
    const x = (w / 4) * i;
    g.beginPath();
    g.moveTo(x, 4);
    g.lineTo(x, h - 8);
    g.strokePath();
  }
  // End caps
  g.fillStyle(COLORS.logDark, 0.4);
  g.fillEllipse(4, h / 2 - 2, 12, h - 10);
  g.fillEllipse(w - 8, h / 2 - 2, 12, h - 10);
  // Highlight
  g.fillStyle(COLORS.logLight, 0.3);
  g.fillRoundedRect(6, 4, w - 16, 8, 4);
}

export function drawTree(g, x, y) {
  // Trunk
  g.fillStyle(COLORS.treeTrunk, 1);
  g.fillRect(x + 14, y + 22, 12, 22);
  // Shadow under canopy
  g.fillStyle(0x000000, 0.15);
  g.fillEllipse(x + 20, y + 30, 46, 18);
  // Canopy layers
  g.fillStyle(COLORS.treeTopDark, 1);
  g.fillCircle(x + 20, y + 20, 20);
  g.fillStyle(COLORS.treeTop, 1);
  g.fillCircle(x + 20, y + 18, 19);
  g.fillStyle(0x2ea82e, 1);
  g.fillCircle(x + 14, y + 24, 10);
  g.fillCircle(x + 26, y + 24, 10);
  // Highlight
  g.fillStyle(0xffffff, 0.1);
  g.fillEllipse(x + 14, y + 10, 14, 9);
}

export function drawFlower(g, x, y, color) {
  const c = color || 0xff88cc;
  g.fillStyle(0x228b22, 1);
  g.fillRect(x + 3, y + 8, 2, 10);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    g.fillStyle(c, 1);
    g.fillCircle(x + 4 + Math.cos(a) * 4, y + 5 + Math.sin(a) * 4, 3);
  }
  g.fillStyle(0xffd700, 1);
  g.fillCircle(x + 4, y + 5, 3);
}

export function darken(hex, factor) {
  const r = Math.floor(((hex >> 16) & 0xff) * factor);
  const gr = Math.floor(((hex >> 8) & 0xff) * factor);
  const b = Math.floor((hex & 0xff) * factor);
  return (r << 16) | (gr << 8) | b;
}

export function lighten(hex, factor) {
  const r = Math.min(255, Math.floor(((hex >> 16) & 0xff) * factor));
  const gr = Math.min(255, Math.floor(((hex >> 8) & 0xff) * factor));
  const b = Math.min(255, Math.floor((hex & 0xff) * factor));
  return (r << 16) | (gr << 8) | b;
}
