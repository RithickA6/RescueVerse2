/**
 * PreloadScene.js
 * Procedurally generates all textures Phaser needs before the simulation starts.
 * No external asset files required.
 */
import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ─────────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0c0f, 1);
    bg.fillRect(0, 0, W, H);

    // Scanlines
    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0x1a1f2e, 0.4);
    for (let y = 0; y < H; y += 3) scanlines.lineBetween(0, y, W, y);

    // ── Logo ───────────────────────────────────────────────────────────────────
    this.add.text(W / 2, H / 2 - 60, 'DRTS', {
      fontFamily: 'Bebas Neue, sans-serif',
      fontSize:   '72px',
      color:      '#f85149',
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 4, 'DISASTER RESPONSE TRAINING SIMULATOR', {
      fontFamily: 'Share Tech Mono, monospace',
      fontSize:   '11px',
      color:      '#484f58',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // ── Progress bar ───────────────────────────────────────────────────────────
    const barW = 300, barH = 3;
    const barX = W / 2 - barW / 2;
    const barY = H / 2 + 60;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x21262d, 1);
    barBg.fillRect(barX, barY, barW, barH);

    const barFg = this.add.graphics();
    barFg.fillStyle(0xf85149, 1);

    const statusText = this.add.text(W / 2, barY + 16, 'INITIALISING…', {
      fontFamily: 'Share Tech Mono, monospace',
      fontSize:   '10px',
      color:      '#7d8590',
    }).setOrigin(0.5);

    // ── Procedural texture generation ──────────────────────────────────────────
    const steps = [
      { label: 'GENERATING FLOOR TILES…',    fn: () => this._genFloor()     },
      { label: 'BUILDING WALL TEXTURES…',    fn: () => this._genWalls()     },
      { label: 'SPAWNING NPC SPRITES…',      fn: () => this._genNPCSprites() },
      { label: 'GENERATING DEBRIS ATLAS…',   fn: () => this._genDebris()    },
      { label: 'CALIBRATING HAZARD ZONES…',  fn: () => this._genHazards()   },
      { label: 'LOADING SCENARIO DATA…',     fn: () => {}                   },
    ];

    let step = 0;
    const tick = () => {
      if (step >= steps.length) {
        this.time.delayedCall(200, () => {
          const targetScene = this.registry.get('targetScene') || 'EarthquakeScene';
          this.scene.start(targetScene);
        });
        return;
      }
      const s = steps[step];
      statusText.setText(s.label);
      barFg.clear();
      barFg.fillStyle(0xf85149, 1);
      barFg.fillRect(barX, barY, barW * ((step + 1) / steps.length), barH);
      try { s.fn(); } catch (e) { console.warn('Preload step skipped:', e.message); }
      step++;
      this.time.delayedCall(180, tick);
    };

    this.time.delayedCall(100, tick);
  }

  // ── Texture generators (render to canvas, create Phaser textures) ───────────

  _genFloor() {
    const g = this.make.graphics({ add: false });
    const T = 32;
    g.fillStyle(0x1a1f2e, 1);
    g.fillRect(0, 0, T, T);
    g.lineStyle(1, 0x252b3b, 0.6);
    g.strokeRect(0, 0, T, T);
    // Subtle noise dots
    g.fillStyle(0x202838, 1);
    [[4,4],[24,12],[8,22],[28,26]].forEach(([x,y]) => g.fillRect(x, y, 2, 2));
    g.generateTexture('floor_tile', T, T);
    g.destroy();
  }

  _genWalls() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x0d1117, 1);
    g.fillRect(0, 0, 32, 32);
    g.lineStyle(1, 0x21262d, 1);
    g.strokeRect(0, 0, 32, 32);
    g.fillStyle(0x161b22, 1);
    g.fillRect(4, 4, 24, 24);
    g.generateTexture('wall_tile', 32, 32);
    g.destroy();
  }

  _genNPCSprites() {
    const configs = [
      { key: 'npc_idle',      color: 0xe6edf3 },
      { key: 'npc_injured',   color: 0xf85149 },
      { key: 'npc_panicking', color: 0xe3b341 },
      { key: 'npc_helped',    color: 0x3fb950 },
      { key: 'npc_evacuated', color: 0x58a6ff },
    ];
    configs.forEach(({ key, color }) => {
      const g = this.make.graphics({ add: false });
      if (key === 'npc_injured') {
        // Lying down
        g.fillStyle(color, 1);
        g.fillRect(2, 8, 28, 12);
        g.fillStyle(0xffd4c2, 1);
        g.fillCircle(5, 14, 5);
      } else {
        // Standing
        g.fillStyle(color, 1);
        g.fillCircle(16, 18, 10);
        g.fillStyle(0xffd4c2, 1);
        g.fillCircle(16, 7, 6);
      }
      g.generateTexture(key, 32, 32);
      g.destroy();
    });
  }

  _genDebris() {
    const shapes = ['rect', 'chunk', 'slab'];
    shapes.forEach((shape, i) => {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x484f58, 1);
      if (shape === 'rect')  { g.fillRect(4, 8, 24, 16); }
      if (shape === 'chunk') { g.fillTriangle(16, 2, 2, 30, 30, 30); }
      if (shape === 'slab')  { g.fillRect(2, 12, 28, 8); }
      g.lineStyle(1, 0x30363d, 1);
      g.strokeRect(0, 0, 32, 32);
      g.generateTexture(`debris_${i}`, 32, 32);
      g.destroy();
    });
  }

  _genHazards() {
    // Warning circle texture
    const g = this.make.graphics({ add: false });
    g.lineStyle(2, 0xf85149, 1);
    g.strokeCircle(16, 16, 14);
    g.fillStyle(0xf85149, 0.15);
    g.fillCircle(16, 16, 14);
    g.generateTexture('hazard_warning', 32, 32);
    g.destroy();

    // Exit marker
    const eg = this.make.graphics({ add: false });
    eg.fillStyle(0x3fb950, 0.2);
    eg.fillRect(0, 0, 64, 48);
    eg.lineStyle(2, 0x3fb950, 1);
    eg.strokeRect(0, 0, 64, 48);
    eg.generateTexture('exit_zone', 64, 48);
    eg.destroy();
  }
}
