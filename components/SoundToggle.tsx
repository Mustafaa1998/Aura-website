"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A tasteful, asset-free ambient sound layer synthesised with the Web Audio API.
 * - Off by default (browser autoplay policies require a user gesture anyway).
 * - When on: a very soft low drone pad + a subtle tick on each chapter change.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  const start = () => {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Warm, quiet drone: two detuned sines through a gentle low-pass.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.connect(master);

    const pad = ctx.createGain();
    pad.gain.value = 0.9;
    pad.connect(filter);

    [110, 164.8].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(pad);
      osc.start();
      nodesRef.current.push(osc);
    });

    // Slow breathing movement on the pad level.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.3;
    lfo.connect(lfoGain);
    lfoGain.connect(pad.gain);
    lfo.start();
    nodesRef.current.push(lfo);

    master.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 1.2);

    ctxRef.current = ctx;
    masterRef.current = master;
  };

  const stop = () => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    window.setTimeout(() => {
      nodesRef.current.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      });
      nodesRef.current = [];
      ctx.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    }, 500);
  };

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
    } else {
      start();
      setOn(true);
    }
  };

  // Soft tick on chapter change (only while sound is on).
  useEffect(() => {
    const onChapter = () => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 660;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
      osc.connect(g);
      g.connect(master);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };
    window.addEventListener("aura:chapter", onChapter);
    return () => window.removeEventListener("aura:chapter", onChapter);
  }, []);

  useEffect(() => () => stop(), []);

  return (
    <button
      type="button"
      className={`sound-toggle ${on ? "sound-toggle--on" : ""}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn ambient sound off" : "Turn ambient sound on"}
      title={on ? "Sound on" : "Sound off"}
    >
      <span className="sound-toggle__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sound-toggle__label">{on ? "Sound" : "Muted"}</span>
    </button>
  );
}
