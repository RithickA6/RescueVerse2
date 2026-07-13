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
    // Idle — frames 0-3
    this.registerAnimation('player_idle', {
      frames: this.scene.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    // Walk — frames 4-7
    this.registerAnimation('player_walk', {
      frames: this.scene.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    // Run — frames 8-11
    this.registerAnimation('player_run', {
      frames: this.scene.anims.generateFrameNumbers('player', { start: 8, end: 11 }),
      frameRate: 14,
      repeat: -1,
    });

    // Hurt — frames 12-14
    this.registerAnimation('player_hurt', {
      frames: this.scene.anims.generateFrameNumbers('player', { start: 12, end: 14 }),
      frameRate: 8,
      repeat: 0,
    });

    // Death — frames 15-17
    this.registerAnimation('player_death', {
      frames: this.scene.anims.generateFrameNumbers('player', { start: 15, end: 17 }),
      frameRate: 6,
      repeat: 0,
    });
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
