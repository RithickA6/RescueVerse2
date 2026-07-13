/**
 * FloodScene.js — Registered stub for future Flood disaster mode.
 *
 * This scene is included in the game engine so Flood can be loaded
 * once gameplay is implemented. The current stub preserves the scene key
 * and emits a simulation end event for graceful handling.
 */

import Phaser from 'phaser';

export default class FloodScene extends Phaser.Scene {
  constructor() {
    super({ key: 'FloodScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Placeholder — redirects back when accidentally loaded
    this.add.text(W / 2, H / 2 - 20, 'FLOOD MODULE', {
      fontFamily: 'Bebas Neue, sans-serif',
      fontSize: '48px',
      color: '#58a6ff',
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 30, 'COMING SOON — Check back in a future release', {
      fontFamily: 'Share Tech Mono, monospace',
      fontSize: '13px',
      color: '#7d8590',
    }).setOrigin(0.5);

    // Emit end immediately so React layer can handle gracefully
    this.time.delayedCall(3000, () => {
      this.events.emit('simulationEnd', {
        score: 0, survivorsHelped: 0, survivorsPanicked: 0, survivorsLost: 0,
        evacuated: false, healthRemaining: 100, debrisHits: 0,
        decisions: [], durationSeconds: 0,
      });
    });
  }
}
