import { CELL_SIZE, GAME_WIDTH } from '../config.js';
import { Car } from '../entities/Car.js';
import { Log } from '../entities/Log.js';
import Phaser from 'phaser';

export class ObstacleManager {
  constructor(scene, laneManager) {
    this.scene = scene;
    this.laneManager = laneManager;
    this.seededLanes = new Set();
  }

  seedLane(lane) {
    if (this.seededLanes.has(lane)) return;
    this.seededLanes.add(lane);
    const dir = Math.random() < 0.5 ? 1 : -1;

    if (lane.type === 'road') {
      const speed = Phaser.Math.FloatBetween(0.09, 0.22);
      const count = Phaser.Math.Between(1, 3);
      const spacing = GAME_WIDTH / count;
      for (let i = 0; i < count; i++) {
        const startX = dir > 0
          ? -80 - i * spacing + Math.random() * 40
          : GAME_WIDTH + 10 + i * spacing - Math.random() * 40;
        const car = new Car(this.scene, lane.y, speed, dir, startX);
        lane.obstacles.push(car);
      }
    } else if (lane.type === 'water') {
      const speed = Phaser.Math.FloatBetween(0.05, 0.12);
      const count = Phaser.Math.Between(2, 3);
      const spacing = GAME_WIDTH / count;
      for (let i = 0; i < count; i++) {
        const startX = dir > 0
          ? -180 - i * spacing
          : GAME_WIDTH + 20 + i * spacing;
        const log = new Log(this.scene, lane.y, speed, dir, startX);
        lane.obstacles.push(log);
      }
    }
  }

  update(delta, lanes) {
    for (const lane of lanes) {
      if (lane.type === 'road' || lane.type === 'water') {
        this.seedLane(lane);
      }
      for (let i = lane.obstacles.length - 1; i >= 0; i--) {
        const obs = lane.obstacles[i];
        obs.update(delta);
        if (obs.isOffScreen()) {
          // Wrap around
          const dir = obs.dir;
          if (obs instanceof Car) {
            obs.g.x = dir > 0 ? -obs.w - 20 : GAME_WIDTH + obs.w + 20;
          } else {
            obs.g.x = dir > 0 ? -obs.w - 20 : GAME_WIDTH + obs.w + 20;
          }
        }
      }
    }
  }

  getLogsOnLane(lane) {
    return lane.obstacles.filter(o => o instanceof Log);
  }

  getCarsOnLane(lane) {
    return lane.obstacles.filter(o => o instanceof Car);
  }
}
