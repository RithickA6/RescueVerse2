/**
 * AnimationManager.js
 * Reusable animation registry for Phaser scenes.
 * Centralizes animation definitions to avoid duplication across scenes and NPCs.
 *
 * Usage:
 *   const animMgr = new AnimationManager(scene);
 *   animMgr.registerPlayerAnimations();
 *   animMgr.registerNPCAnimations();
 */

export default class AnimationManager {
  constructor(scene) {
    this.scene = scene;
    this.registered = new Set();
  }

  /**
   * Register a single animation if not already registered.
   * @param {string} key - Animation key
   * @param {object} config - Phaser animation config
   */
  registerAnimation(key, config) {
    if (this.registered.has(key)) return;

    const anim = this.scene.anims.create({
      key,
      ...config,
    });

    this.registered.add(key);
    return anim;
  }

  /**
   * Register all player animations.
   * Assumes 'player' spritesheet is loaded.
   */
  registerPlayerAnimations() {
    // Register animations from per-action spritesheets if present.
    // Each spritesheet is expected to contain only the frames for that action.
    const registerFromSheet = (sheetKey, animKey, frameRate = 10, repeat = -1) => {
      if (!this.scene.textures.exists(sheetKey)) return false;
      const count = this._getFrameCount(sheetKey);
      if (count <= 0) return false;
      this.registerAnimation(animKey, {
        frames: this.scene.anims.generateFrameNumbers(sheetKey, { start: 0, end: Math.max(0, count - 1) }),
        frameRate,
        repeat,
      });
      return true;
    };

    registerFromSheet('player_idle',   'player_idle',   8,  -1);
    registerFromSheet('player_walk',   'player_walk',  10,  -1);
    registerFromSheet('player_run',    'player_run',   14,  -1);
    registerFromSheet('player_hurt',   'player_hurt',   8,   0);
    registerFromSheet('player_attack', 'player_attack',10,   0);
    registerFromSheet('player_dead',   'player_death',  6,   0);
  }

  _getFrameCount(key) {
    try {
      const tex = this.scene.textures.get(key);
      if (!tex || !tex.frames) return 0;
      return Object.keys(tex.frames).filter(n => n !== '__BASE').length;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Register all NPC animations.
   * Assumes 'npc' spritesheet is loaded.
   */
  registerNPCAnimations() {
    // Idle — frames 0-2
    this.registerAnimation('npc_idle_anim', {
      frames: this.scene.anims.generateFrameNumbers('npc', { start: 0, end: 2 }),
      frameRate: 6,
      repeat: -1,
    });

    // Walk — frames 3-6
    this.registerAnimation('npc_walk_anim', {
      frames: this.scene.anims.generateFrameNumbers('npc', { start: 3, end: 6 }),
      frameRate: 10,
      repeat: -1,
    });

    // Panic — frames 7-9
    this.registerAnimation('npc_panic_anim', {
      frames: this.scene.anims.generateFrameNumbers('npc', { start: 7, end: 9 }),
      frameRate: 12,
      repeat: -1,
    });

    // Hurt — frames 10-11
    this.registerAnimation('npc_hurt_anim', {
      frames: this.scene.anims.generateFrameNumbers('npc', { start: 10, end: 11 }),
      frameRate: 8,
      repeat: 0,
    });
  }

  /**
   * List all registered animations.
   */
  getRegistered() {
    return Array.from(this.registered);
  }

  /**
   * Check if an animation is registered.
   */
  has(key) {
    return this.registered.has(key);
  }
}
