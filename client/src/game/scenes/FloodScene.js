/**
 * FloodScene.js — STUB for future Flood Disaster Module
 *
 * This file exists to demonstrate the expansion pattern.
 * Copy EarthquakeScene.js and adapt the following:
 *
 *   1. Change scene key to 'FloodScene'
 *   2. Replace debris system with rising_water tiles
 *   3. Add elevation zones — high ground is safe, low ground floods
 *   4. Replace cover mechanic with swim/wade speed penalties
 *   5. NPC drowning replaces debris injury
 *   6. Evacuation leads to elevated safe zones, not a single exit
 *   7. Water rise rate increases each phase instead of camera shake
 *
 * Scoring changes:
 *   RESCUE_FROM_WATER  +200
 *   REACH_HIGH_GROUND  +150
 *   GUIDE_NPC_TO_SAFETY +100
 *   NPC_DROWNED        -120
 *   WADING_IN_DEEP     -15/sec
 *
 * Phase structure:
 *   CALM → RISING_SLOW → RISING_FAST → RESCUE_WINDOW → END
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
