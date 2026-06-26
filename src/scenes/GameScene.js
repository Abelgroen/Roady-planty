import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, CELL_SIZE, STEPS_BETWEEN_QUIZ, COLORS } from '../config.js';
import { Player } from '../entities/Player.js';
import { LaneManager } from '../systems/LaneManager.js';
import { ObstacleManager } from '../systems/ObstacleManager.js';
import { QuizManager } from '../systems/QuizManager.js';
import { ScoreManager } from '../systems/ScoreManager.js';

const COLS = Math.floor(GAME_WIDTH / CELL_SIZE);
const START_GRID_X = Math.floor(COLS / 2);
// Player starts at row 6 from the top of the generated world.
// LaneManager starts at row 9 (y=720) and generates upward (decreasing Y).
// Row 6 → worldY = 6*80 = 480+40 center = 520.
const PLAYER_START_ROW = 6;

export class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'Game' }); }

  create() {
    this.dead = false;
    this.stepsSinceQuiz = 0;
    this.pendingQuizLane = null;
    this.quizTriggered = false;
    this.touchStart = null;

    // Background
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e);

    // Systems
    // LaneManager starts at row 9 (y=720, 3 rows below player) and generates upward.
    const LANE_START_Y = (PLAYER_START_ROW + 3) * CELL_SIZE;
    this.laneManager = new LaneManager(this, LANE_START_Y);
    this.obstacleManager = new ObstacleManager(this, this.laneManager);
    this.quizManager = new QuizManager(this);

    // Generate initial world (covers player start and well ahead)
    this.laneManager.generate(30);

    // Player — placed on row PLAYER_START_ROW
    const playerWorldX = START_GRID_X * CELL_SIZE + CELL_SIZE / 2;
    const playerWorldY = PLAYER_START_ROW * CELL_SIZE + CELL_SIZE / 2;
    this.player = new Player(this, START_GRID_X, PLAYER_START_ROW);
    this.player.g.x = playerWorldX;
    this.player.g.y = playerWorldY;
    this.player.x = playerWorldX;
    this.player.y = playerWorldY;
    this.player.gridY = PLAYER_START_ROW;
    this.player.maxGridY = PLAYER_START_ROW;
    this.startGridY = PLAYER_START_ROW;

    this.player.onHopComplete = (dx, dy) => this._onHop(dx, dy);

    // Score
    this.scoreManager = new ScoreManager(this, this.startGridY);

    // Camera follows player on Y
    this.cameras.main.startFollow(this.player.g, false, 0, 0.1);
    this.cameras.main.setFollowOffset(0, GAME_HEIGHT * 0.3);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this._setupTouch();

    // Water-death timer check
    this._waterCheckTimer = 0;
  }

  _setupTouch() {
    this.input.on('pointerdown', p => { this.touchStart = { x: p.x, y: p.y }; });
    this.input.on('pointerup', p => {
      if (!this.touchStart) return;
      const dx = p.x - this.touchStart.x;
      const dy = p.y - this.touchStart.y;
      this.touchStart = null;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        this._tryMove(Math.sign(dx), 0);
      } else {
        this._tryMove(0, Math.sign(dy));
      }
    });
  }

  _tryMove(dx, dy) {
    if (this.dead || this.player.locked) return;
    this.player.hop(dx, dy);
  }

  _onHop(dx, dy) {
    if (this.dead) return;

    const py = this.player.g.y;
    const px = this.player.g.x;

    // Forward step
    if (dy < 0) {
      this.stepsSinceQuiz++;
      this.scoreManager.update(this.player.gridY);

      // Schedule quiz lane ahead
      if (this.stepsSinceQuiz >= STEPS_BETWEEN_QUIZ && !this.pendingQuizLane && this.quizManager.state === 'IDLE') {
        this.stepsSinceQuiz = 0;
        this.pendingQuizLane = this.laneManager.scheduleQuizAhead(this.player.g.y);
      }
    }

    // Ensure world extends ahead
    this.laneManager.ensureAhead(this.cameras.main.scrollY);

    // Check what lane we're on
    const lane = this.laneManager.getLaneAtY(py);
    if (!lane) return;

    if (lane.type === 'water') {
      this._checkWaterLanding(lane, px, py);
    } else if (lane.type === 'quiz') {
      this._checkQuizEntry(lane, px, py);
    }
  }

  _checkWaterLanding(lane, px, py) {
    const logs = this.obstacleManager.getLogsOnLane(lane);
    let onLog = null;
    for (const log of logs) {
      const b = log.getBounds();
      if (px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height) {
        onLog = log;
        break;
      }
    }
    if (onLog) {
      this.player.snapToLog(onLog);
    } else {
      this._triggerDeath('water');
    }
  }

  _checkQuizEntry(lane, px, py) {
    if (this.quizManager.state === 'IDLE' && this.pendingQuizLane === lane) {
      this.pendingQuizLane = null;
      this.quizManager.activate(lane.y,
        () => this._onCorrectGate(),
        () => this._onWrongGate(),
      );
    }
    if (this.quizManager.state === 'ACTIVE') {
      this.quizManager.checkPlayerInGate(px, py);
    }
  }

  _onCorrectGate() {
    this.scoreManager.addBonus(15);
    this.cameras.main.flash(300, 0, 200, 0, false);
    this._showPopup('+15  Goed!', '#4ade80');
  }

  _onWrongGate() {
    this._triggerDeath('wrong_gate');
  }

  _showPopup(text, color) {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, text, {
      fontSize: '28px',
      fontFamily: '"Segoe UI", Arial, sans-serif',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(15);
    this.tweens.add({
      targets: t, y: '-=50', alpha: 0,
      duration: 1200, ease: 'Sine.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  _triggerDeath(reason) {
    if (this.dead) return;
    this.dead = true;

    if (reason === 'water') {
      this.cameras.main.flash(250, 0, 80, 180, false);
      this.cameras.main.shake(300, 0.015);
    } else if (reason === 'wrong_gate') {
      this.cameras.main.flash(300, 180, 0, 0, false);
      this.cameras.main.shake(400, 0.02);
    } else {
      this.cameras.main.flash(200, 180, 0, 0, false);
      this.cameras.main.shake(250, 0.015);
    }

    this.scoreManager.save();
    this.player.die(() => {
      this.time.delayedCall(300, () => {
        this.scene.start('GameOver', {
          score: this.scoreManager.score,
          correctFamily: this.quizManager.correctFamily,
          reason,
        });
      });
    });
  }

  update(time, delta) {
    if (this.dead) return;

    // Keyboard input
    if (!this.player.locked) {
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W))
        this._tryMove(0, -1);
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.S))
        this._tryMove(0, 1);
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A))
        this._tryMove(-1, 0);
      else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D))
        this._tryMove(1, 0);
    }

    // Update obstacles
    this.obstacleManager.update(delta, this.laneManager.lanes);

    // Update player (log drift)
    this.player.update(delta);

    // Recycle old lanes
    this.laneManager.recycle(this.cameras.main.scrollY);

    // Ensure world extends
    this.laneManager.ensureAhead(this.cameras.main.scrollY);

    // Score
    this.scoreManager.update(this.player.gridY);

    // Collision checks every frame
    this._checkCarCollision();
    this._checkWaterDrift();
    this._checkCameraEdge();
  }

  _checkCarCollision() {
    const lane = this.laneManager.getLaneAtY(this.player.g.y);
    if (!lane || lane.type !== 'road') return;
    const cars = this.obstacleManager.getCarsOnLane(lane);
    const pb = this.player.getBounds();
    for (const car of cars) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(pb, car.getBounds())) {
        this._triggerDeath('car');
        return;
      }
    }
  }

  _checkWaterDrift() {
    if (!this.player.onLog) return;
    const px = this.player.g.x;
    if (px < -10 || px > GAME_WIDTH + 10) {
      this._triggerDeath('water');
    }
  }

  _checkCameraEdge() {
    const cameraBottom = this.cameras.main.scrollY + GAME_HEIGHT;
    if (this.player.g.y > cameraBottom + CELL_SIZE * 0.5) {
      this._triggerDeath('camera');
    }
  }
}
