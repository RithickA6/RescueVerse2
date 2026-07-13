/**
 * SceneConfig.js
 * Maps scenario difficulty → simulation parameters.
 * Passed into EarthquakeScene via Phaser registry before scene start.
 */

export const DEFAULT_DIFFICULTY = 'beginner';
export const DEFAULT_SCENE_KEY = 'EarthquakeScene';

export const DIFFICULTY_CONFIG = {
  beginner: {
    npcCount:            6,
    injuredCount:        2,
    panickingCount:      1,
    debrisIntervalStrong: 3500,   // ms between debris drops (strong phase)
    debrisIntervalWeak:   6000,
    camerShakeStrong:     0.014,
    cameraShakeWeak:      0.005,
    playerSpeed:          150,
    healthStart:          100,
    durations: { calm: 15, shaking_strong: 18, shaking_weak: 12, evacuation: 30 },
  },
  intermediate: {
    npcCount:            8,
    injuredCount:        3,
    panickingCount:      2,
    debrisIntervalStrong: 2200,
    debrisIntervalWeak:   4000,
    cameraShakeStrong:    0.018,
    cameraShakeWeak:      0.008,
    playerSpeed:          140,
    healthStart:          100,
    durations: { calm: 12, shaking_strong: 22, shaking_weak: 16, evacuation: 25 },
  },
  advanced: {
    npcCount:            10,
    injuredCount:        4,
    panickingCount:      3,
    debrisIntervalStrong: 1400,
    debrisIntervalWeak:   2800,
    cameraShakeStrong:    0.022,
    cameraShakeWeak:      0.012,
    playerSpeed:          130,
    healthStart:          100,
    durations: { calm: 10, shaking_strong: 25, shaking_weak: 18, evacuation: 22 },
  },
};

export function getSceneConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

/**
 * Maps scenario.type → Phaser scene key.
 * Add entries here as new disaster types as they are built.
 */
export const SCENE_KEY_MAP = {
  earthquake: 'EarthquakeScene',
  flood:      'FloodScene',
  fire:       'FireScene',
  cyclone:    'CycloneScene',
};

export function getSceneKey(type) {
  return SCENE_KEY_MAP[type] || DEFAULT_SCENE_KEY;
}
