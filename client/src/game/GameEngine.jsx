import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import PreloadScene from './scenes/PreloadScene';
import EarthquakeScene from './scenes/EarthquakeScene';
import FloodScene from './scenes/FloodScene';
import { getSceneConfig, getSceneKey } from './SceneConfig';

const PHASE_LABELS = {
  calm:           'Calm — Monitoring',
  shaking_strong: '⚡ Strong Shaking',
  shaking_weak:   '⚡ Weak Shaking',
  evacuation:     '→ Evacuate Now!',
  end:            'Simulation Ended',
};

const PHASE_COLORS = {
  calm:           '#27ae60',
  shaking_strong: '#e74c3c',
  shaking_weak:   '#e67e22',
  evacuation:     '#1f6aa5',
  end:            '#8a9bb0',
};

export default function GameEngine({ scenario, onSimulationEnd }) {
  const mountRef = useRef(null);
  const gameRef  = useRef(null);

  const [phase,   setPhase]   = useState('calm');
  const [score,   setScore]   = useState(0);
  const [health,  setHealth]  = useState(100);
  const [elapsed, setElapsed] = useState(0);
  const [ready,   setReady]   = useState(false);

  const difficulty = scenario?.difficulty || 'beginner';
  const cfg        = getSceneConfig(difficulty);
  const totalTime  = Object.values(cfg.durations).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!mountRef.current || gameRef.current) return;

    const targetScene = getSceneKey(scenario?.type || 'earthquake');

    const game = new Phaser.Game({
      type:            Phaser.AUTO,
      width:           800,
      height:          560,
      parent:          mountRef.current,
      backgroundColor: '#1a1f2e',
      scene:           [PreloadScene, EarthquakeScene, FloodScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
    });
    gameRef.current = game;

    game.events.once('ready', () => {
      game.registry.set('difficulty',   difficulty);
      game.registry.set('targetScene',  targetScene);
      game.registry.set('scenarioId',   scenario?._id);
      game.registry.set('scenarioType', scenario?.type || 'earthquake');

      const attachSceneListeners = () => {
        const scene = game.scene.getScene(targetScene);
        if (!scene || !scene.sys.isActive()) { setTimeout(attachSceneListeners, 300); return; }

        scene.events.on('phaseChange',   p => setPhase(p));
        scene.events.on('scoreUpdate',   s => setScore(s));
        scene.events.on('simulationEnd', result => {
          onSimulationEnd({ ...result, scenarioId: scenario?._id, scenarioType: scenario?.type || 'earthquake' });
        });
        setReady(true);

        const poll = setInterval(() => {
          if (!game.isRunning) { clearInterval(poll); return; }
          try {
            const h = scene.registry.get('health');
            const e = scene.registry.get('elapsed');
            const s = scene.registry.get('score');
            if (h != null) setHealth(h);
            if (e != null) setElapsed(e);
            if (s != null) setScore(s);
          } catch { clearInterval(poll); }
        }, 400);
      };

      game.scene.getScene('PreloadScene')?.events.on('shutdown', () => setTimeout(attachSceneListeners, 200));
      setTimeout(attachSceneListeners, 200);
    });

    return () => { gameRef.current?.destroy(true); gameRef.current = null; };
  }, []); // eslint-disable-line

  const healthColor = health > 60 ? '#27ae60' : health > 30 ? '#e67e22' : '#e74c3c';
  const phaseColor  = PHASE_COLORS[phase] || '#1a1a2e';
  const progressPct = Math.min(100, (elapsed / Math.max(totalTime, 1)) * 100);
  const timeLeft    = Math.max(0, totalTime - elapsed);
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <div className="rv-game-wrapper" style={{ display: 'inline-block', position: 'relative' }}>

      {/* ── HUD ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px',
        background: 'white',
        borderBottom: '1px solid var(--border)',
        pointerEvents: 'none',
      }}>
        {/* Phase */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: phaseColor, display: 'inline-block', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Phase</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.95rem', fontWeight: 700, color: phaseColor }}>
              {PHASE_LABELS[phase] || phase}
            </div>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Score</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>
            {score}
          </div>
        </div>

        {/* Health + Time + Difficulty */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Health</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.3rem', fontWeight: 700, color: healthColor, lineHeight: 1 }}>
              {health}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Time Left</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {mins}:{secs}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Difficulty</div>
            <span className={`rv-badge rv-badge-${difficulty === 'advanced' ? 'red' : difficulty === 'intermediate' ? 'amber' : 'green'}`}
              style={{ fontSize: '0.72rem' }}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Health bar */}
      <div style={{ height: 4, background: 'var(--border)', position: 'relative' }}>
        <div style={{ height: '100%', width: `${health}%`, background: healthColor, transition: 'width 0.3s ease, background 0.3s ease' }} />
      </div>

      {/* Phaser canvas */}
      <div ref={mountRef} style={{ width: 800, height: 560, display: 'block' }} />

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--border)' }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: phaseColor, transition: 'width 1s linear, background 0.5s ease' }} />
      </div>

      {/* Controls hint */}
      <div style={{ background: 'var(--bg)', padding: '8px 16px', fontSize: '0.78rem', color: 'var(--text-light)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        WASD / Arrows: Move &nbsp;·&nbsp; SPACE: Take Cover &nbsp;·&nbsp; E: Help NPC
      </div>

      {/* Loading overlay */}
      {!ready && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255,255,255,0.96)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 14, zIndex: 50, pointerEvents: 'none',
        }}>
          <img src="/logo.png" alt="" style={{ height: 56, opacity: 0.8 }} />
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--blue)' }}>
            Rescue<span style={{ color: 'var(--gold)' }}>Verse</span>
          </div>
          <div className="rv-loader-ring" />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading simulation…</div>
        </div>
      )}
    </div>
  );
}
