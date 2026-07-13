/**
 * PreloadScene.js
 * Scalable asset pipeline for RescueVerse.
 * Loads textures, sprites, and animations organized by category.
 * Falls back to procedural generation if external assets are unavailable.
 */
import Phaser from 'phaser';
import AnimationManager from '../AnimationManager';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._setupDisplay(W, H);

    // ── Asset loading steps ────────────────────────────────────────────────────────
    const steps = [
      { label: 'LOADING CHARACTER ASSETS…',  fn: () => this._loadCharacterAssets()  },
      { label: 'LOADING NPC ASSETS…',        fn: () => this._loadNPCAssets()        },
      { label: 'LOADING ENVIRONMENT…',       fn: () => this._loadEnvironmentAssets() },
      { label: 'LOADING HAZARD ASSETS…',     fn: () => this._loadHazardAssets()     },
      { label: 'REGISTERING ANIMATIONS…',    fn: () => this._registerAnimations()   },
      { label: 'LOADING SCENARIO DATA…',     fn: () => {}                           },
    ];

    this._executeLoadingSteps(steps, W, H);
  }

  // ── Setup UI ─────────────────────────────────────────────────────────────────────
  _setupDisplay(W, H) {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0c0f, 1);
    bg.fillRect(0, 0, W, H);

    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0x1a1f2e, 0.4);
    for (let y = 0; y < H; y += 3) scanlines.lineBetween(0, y, W, y);

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

    // Progress bar
    const barW = 300, barH = 3;
    const barX = W / 2 - barW / 2;
    const barY = H / 2 + 60;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x21262d, 1);
    barBg.fillRect(barX, barY, barW, barH);

    this.barFg = this.add.graphics();
    this.barFg.fillStyle(0xf85149, 1);

    this.statusText = this.add.text(W / 2, barY + 16, 'INITIALISING…', {
      fontFamily: 'Share Tech Mono, monospace',
      fontSize:   '10px',
      color:      '#7d8590',
    }).setOrigin(0.5);

    this.barX = barX;
    this.barY = barY;
    this.barW = barW;
    this.barH = barH;
  }

  // ── Loading steps executor ─────────────────────────────────────────────────────────
  _executeLoadingSteps(steps, W, H) {
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
      this.statusText.setText(s.label);
      this.barFg.clear();
      this.barFg.fillStyle(0xf85149, 1);
      this.barFg.fillRect(this.barX, this.barY, this.barW * ((step + 1) / steps.length), this.barH);

      try {
        s.fn();
      } catch (e) {
        console.warn(`Asset loading step failed (${s.label}):`, e.message);
      }

      step++;
      this.time.delayedCall(180, tick);
    };

    this.time.delayedCall(100, tick);
  }

  // ── Asset loading: Characters ──────────────────────────────────────────────────────
  /**
   * Load player character sprite.
   * Expected: 'player' spritesheet at /player.png (4x4 grid — 16 frames)
   * Fallback: Procedural player texture.
   */
  _loadCharacterAssets() {
    // Try to load external player spritesheet
    // When /player.png is provided with 16 frames (idle, walk, run, hurt, death)
    // it will be loaded here. For now, create a fallback procedural texture.
    try {
      if (!this.textures.exists('player')) {
        this._createPlayerFallback();
      }
    } catch (e) {
      console.warn('Character asset loading failed, using fallback:', e.message);
      this._createPlayerFallback();
    }
  }

  _createPlayerFallback() {
    // Create a simple player sprite sheet simulation (1x1 frame fallback)
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x58a6ff, 1);
    g.fillCircle(16, 18, 11);
    g.fillStyle(0x9ecfff, 1);
    g.fillCircle(16, 7, 6);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(16, 0, 3);
    g.generateTexture('player', 32, 32);
    g.destroy();
  }

  // ── Asset loading: NPCs ────────────────────────────────────────────────────────────
  /**
   * Load NPC sprite.
   * Expected: 'npc' spritesheet at /npc.png with state variations.
   * Fallback: Procedural NPC textures (state-based).
   */
  _loadNPCAssets() {
    // Try to load external NPC spritesheet
    // When /npc.png is provided, it will be loaded here. For now, use procedural.
    try {
      if (!this.textures.exists('npc')) {
        this._createNPCFallback();
      }
    } catch (e) {
      console.warn('NPC asset loading failed, using fallback:', e.message);
      this._createNPCFallback();
    }
  }

  _createNPCFallback() {
    // Procedural NPC textures for state representation
    const configs = [
      { key: 'npc_idle',      color: 0xe6edf3 },
      { key: 'npc_injured',   color: 0xf85149 },
      { key: 'npc_panicking', color: 0xe3b341 },
      { key: 'npc_helped',    color: 0x3fb950 },
      { key: 'npc_evacuated', color: 0x58a6ff },
    ];

    configs.forEach(({ key, color }) => {
      this._createTexture(key, 32, 32, g => {
        if (key === 'npc_injured') {
          g.fillStyle(color, 1);
          g.fillRect(2, 8, 28, 12);
          g.fillStyle(0xffd4c2, 1);
          g.fillCircle(5, 14, 5);
          return;
        }

        g.fillStyle(color, 1);
        g.fillCircle(16, 18, 10);
        g.fillStyle(0xffd4c2, 1);
        g.fillCircle(16, 7, 6);
      });
    });
  }

  // ── Asset loading: Environment ────────────────────────────────────────────────────
  _loadEnvironmentAssets() {
    this._loadFloorAssets();
    this._loadWallAssets();
  }

  _loadFloorAssets() {
    this._createTexture('floor_tile', 32, 32, g => {
      g.fillStyle(0x1a1f2e, 1);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(1, 0x252b3b, 0.6);
      g.strokeRect(0, 0, 32, 32);
      g.fillStyle(0x202838, 1);
      [[4,4],[24,12],[8,22],[28,26]].forEach(([x, y]) => g.fillRect(x, y, 2, 2));
    });
  }

  _loadWallAssets() {
    this._createTexture('wall_tile', 32, 32, g => {
      g.fillStyle(0x0d1117, 1);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(1, 0x21262d, 1);
      g.strokeRect(0, 0, 32, 32);
      g.fillStyle(0x161b22, 1);
      g.fillRect(4, 4, 24, 24);
    });
  }

  // ── Asset loading: Hazards ────────────────────────────────────────────────────────
  _loadHazardAssets() {
    this._loadDebrisAssets();
    this._loadWarningAssets();
  }

  _loadDebrisAssets() {
    const shapes = ['rect', 'chunk', 'slab'];
    shapes.forEach((shape, i) => {
      this._createTexture(`debris_${i}`, 32, 32, g => {
        g.fillStyle(0x484f58, 1);
        if (shape === 'rect')  { g.fillRect(4, 8, 24, 16); }
        if (shape === 'chunk') { g.fillTriangle(16, 2, 2, 30, 30, 30); }
        if (shape === 'slab')  { g.fillRect(2, 12, 28, 8); }
        g.lineStyle(1, 0x30363d, 1);
        g.strokeRect(0, 0, 32, 32);
      });
    });
  }

  _loadWarningAssets() {
    this._createTexture('hazard_warning', 32, 32, g => {
      g.lineStyle(2, 0xf85149, 1);
      g.strokeCircle(16, 16, 14);
      g.fillStyle(0xf85149, 0.15);
      g.fillCircle(16, 16, 14);
    });

    this._createTexture('exit_zone', 64, 48, g => {
      g.fillStyle(0x3fb950, 0.2);
      g.fillRect(0, 0, 64, 48);
      g.lineStyle(2, 0x3fb950, 1);
      g.strokeRect(0, 0, 64, 48);
    });
  }

  // ── Animation registration ────────────────────────────────────────────────────────
  _registerAnimations() {
    const animMgr = new AnimationManager(this);
    // Only register player animations for now (NPCs still use state-based sprites)
    if (this.anims.exists('player_idle')) return;
    try {
      animMgr.registerPlayerAnimations();
    } catch (e) {
      console.warn('Animation registration skipped (no spritesheet):', e.message);
    }
  }

  // ── Placeholder for UI assets ──────────────────────────────────────────────────────
  /**
   * Future: Load UI textures, buttons, icons, etc.
   */
  _loadUIAssets() {
    // Placeholder for future UI asset loading
  }

  // ── Placeholder for audio assets ───────────────────────────────────────────────────
  /**
   * Future: Load sound effects, ambient audio, music tracks.
   */
  _loadAudioAssets() {
    // Placeholder for future audio asset loading
  }

  // ── Placeholder for future scenario assets────────────────────────────────────────
  /**
   * Future: Load Flood, Fire, Cyclone specific assets.
   */
  _loadFutureScenarioAssets() {
    // Placeholder for future scenario-specific asset loading
  }

  // ── Utility: Texture generation ────────────────────────────────────────────────────


  _createTexture(key, width, height, drawFn) {
    const g = this.make.graphics({ add: false });
    drawFn(g);
    g.generateTexture(key, width, height);
    g.destroy();
  }
}
