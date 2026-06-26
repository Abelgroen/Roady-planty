import { CELL_SIZE, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { drawTree, drawFlower } from '../utils/Draw.js';

const COLS = Math.floor(GAME_WIDTH / CELL_SIZE);

export class LaneManager {
  constructor(scene, startY = 0) {
    this.scene = scene;
    this.lanes = [];
    this.nextY = startY; // next lane top Y; decrements each lane (moving "up" = forward)
    this.lastType = null;
    this.consecutiveWater = 0;
    this.consecutiveRoad = 0;
  }

  // Generate a specific type lane at a given Y
  _makeLane(type, y) {
    const g = this.scene.add.graphics();
    g.setDepth(0);
    const deco = this.scene.add.graphics();
    deco.setDepth(1);
    const lane = { type, y, g, deco, obstacles: [], gates: null };
    this._drawLane(lane);
    return lane;
  }

  _drawLane(lane) {
    const { g, deco, type, y } = lane;
    g.clear(); deco.clear();

    if (type === 'grass') {
      // Base
      g.fillStyle(COLORS.grass, 1);
      g.fillRect(0, y, GAME_WIDTH, CELL_SIZE);
      // Darker patches
      g.fillStyle(COLORS.grassDark, 0.35);
      for (let c = 0; c < COLS; c++) {
        if ((c + Math.floor(y / CELL_SIZE)) % 3 === 0) {
          g.fillRect(c * CELL_SIZE, y, CELL_SIZE / 2, CELL_SIZE);
        }
      }
      // Light stripes
      g.fillStyle(COLORS.grassLight, 0.18);
      g.fillRect(0, y + CELL_SIZE * 0.4, GAME_WIDTH, CELL_SIZE * 0.2);
      // Random trees & flowers
      const seed = Math.abs(y) % 999;
      for (let c = 0; c < COLS; c++) {
        const r = ((seed * 7 + c * 13) % 100) / 100;
        if (r < 0.18) {
          drawTree(deco, c * CELL_SIZE + 4, y + 4);
        } else if (r < 0.3) {
          const fc = [0xff88cc, 0xffee44, 0xaa77ff, 0xff6622][Math.floor(r * 40) % 4];
          drawFlower(deco, c * CELL_SIZE + CELL_SIZE / 2 - 4, y + CELL_SIZE / 2 - 6, fc);
        }
      }
    } else if (type === 'road') {
      g.fillStyle(COLORS.roadDark, 1);
      g.fillRect(0, y, GAME_WIDTH, CELL_SIZE);
      g.fillStyle(COLORS.road, 1);
      g.fillRect(0, y + 2, GAME_WIDTH, CELL_SIZE - 4);
      // Edge lines
      g.fillStyle(0xffffff, 0.12);
      g.fillRect(0, y, GAME_WIDTH, 3);
      g.fillRect(0, y + CELL_SIZE - 3, GAME_WIDTH, 3);
      // Dashes
      g.fillStyle(COLORS.roadLine, 0.7);
      const dashW = 28, gap = 20;
      for (let x = 0; x < GAME_WIDTH; x += dashW + gap) {
        g.fillRect(x, y + CELL_SIZE / 2 - 2, dashW, 4);
      }
    } else if (type === 'water') {
      g.fillStyle(COLORS.waterDark, 1);
      g.fillRect(0, y, GAME_WIDTH, CELL_SIZE);
      g.fillStyle(COLORS.water, 1);
      g.fillRect(0, y + 2, GAME_WIDTH, CELL_SIZE - 4);
      // Animated-looking wave stripes
      g.fillStyle(COLORS.waterLight, 0.3);
      g.fillRect(0, y + CELL_SIZE * 0.3, GAME_WIDTH, CELL_SIZE * 0.15);
      g.fillRect(0, y + CELL_SIZE * 0.65, GAME_WIDTH, CELL_SIZE * 0.1);
      // Sparkles
      g.fillStyle(0xffffff, 0.2);
      for (let i = 0; i < 6; i++) {
        const sx = ((Math.abs(y) * 3 + i * 77) % GAME_WIDTH);
        g.fillCircle(sx, y + CELL_SIZE * 0.4, 2);
      }
    } else if (type === 'quiz') {
      // Darker path leading to gates
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(0, y, GAME_WIDTH, CELL_SIZE);
      g.fillStyle(0x2d2d4e, 0.8);
      g.fillRect(0, y + 2, GAME_WIDTH, CELL_SIZE - 4);
      // Decorative border
      g.lineStyle(2, 0x9060e0, 0.6);
      g.strokeRect(0, y, GAME_WIDTH, CELL_SIZE);
    }
  }

  _pickType(quizNow) {
    if (quizNow) return 'quiz';
    // Rules
    if (this.lastType === 'water') { this.consecutiveWater++; }
    else { this.consecutiveWater = 0; }
    if (this.lastType === 'road') { this.consecutiveRoad++; }
    else { this.consecutiveRoad = 0; }

    if (this.consecutiveWater >= 1) return 'grass';
    if (this.consecutiveRoad >= 4) return 'grass';
    if (this.lastType === 'quiz') return 'grass';

    const r = Math.random();
    if (r < 0.30) return 'grass';
    if (r < 0.75) return 'road';
    return 'water';
  }

  generate(count, quizAt = null) {
    for (let i = 0; i < count; i++) {
      const isQuiz = quizAt !== null && this.lanes.length === quizAt;
      // Force the first 10 lanes to be grass (safe start zone + generous runway ahead)
      const forceGrass = this.lanes.length < 10;
      const type = forceGrass ? 'grass' : this._pickType(isQuiz);
      const lane = this._makeLane(type, this.nextY);
      this.lanes.push(lane);
      this.lastType = type;
      this.nextY -= CELL_SIZE;
    }
  }

  // Convert lanes ~AHEAD rows ahead of playerY to grass+grass+quiz in-place.
  scheduleQuizAhead(playerY) {
    const AHEAD = 7;
    const baseY = (Math.floor(playerY / CELL_SIZE) - AHEAD) * CELL_SIZE;
    let quizLane = null;
    // i=2 and i=1 become grass, i=0 becomes quiz
    for (let i = 2; i >= 0; i--) {
      const targetY = baseY + i * CELL_SIZE;
      const lane = this.getLaneAtY(targetY + CELL_SIZE / 2);
      if (!lane) continue;
      const newType = i === 0 ? 'quiz' : 'grass';
      if (lane.type !== newType) {
        lane.obstacles.forEach(o => o.destroy());
        lane.obstacles = [];
        lane.type = newType;
        lane.g.clear();
        lane.deco.clear();
        this._drawLane(lane);
      }
      if (i === 0) quizLane = lane;
    }
    return quizLane;
  }

  getLaneAtY(worldY) {
    return this.lanes.find(l => worldY >= l.y && worldY < l.y + CELL_SIZE) || null;
  }

  recycle(cameraTop) {
    const threshold = cameraTop + GAME_HEIGHT * 1.8;
    this.lanes = this.lanes.filter(lane => {
      if (lane.y > threshold) {
        lane.g.destroy();
        lane.deco.destroy();
        lane.obstacles.forEach(o => o.destroy());
        return false;
      }
      return true;
    });
  }

  ensureAhead(cameraTop) {
    const needed = cameraTop - GAME_HEIGHT * 1.2;
    while (this.nextY > needed) {
      const type = this._pickType(false);
      const lane = this._makeLane(type, this.nextY);
      this.lanes.push(lane);
      this.lastType = type;
      this.nextY -= CELL_SIZE;
    }
  }
}
