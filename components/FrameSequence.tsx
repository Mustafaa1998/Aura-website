"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const frameSrc = (index: number) => `/frames/aura/frame_${String(index + 1).padStart(4, "0")}.jpg`;

const chapters = [
  { start: 0.02, end: 0.18, kicker: "01 / FORM", title: "One object.\nZero distraction.", body: "Begin with the whole. Scroll becomes the control surface." },
  { start: 0.23, end: 0.43, kicker: "02 / COMFORT", title: "Pressure,\nsoftened.", body: "Cushions peel away first, exposing the interface between material and sound." },
  { start: 0.47, end: 0.68, kicker: "03 / DRIVER", title: "The signal\nbecomes physical.", body: "A layered acoustic core moves into view with every fraction of scroll." },
  { start: 0.72, end: 0.91, kicker: "04 / ARCHITECTURE", title: "Engineered\nfrom the inside out.", body: "At full extension, the object reads like a technical drawing suspended in space." },
];

export function FrameSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(Array(FRAME_COUNT).fill(null));
  const loadedRef = useRef<boolean[]>(Array(FRAME_COUNT).fill(false));
  const currentFrame = useRef(0);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;

    const loadOne = (index: number) => new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(index);
      img.onload = () => {
        if (!cancelled) {
          imagesRef.current[index] = img;
          loadedRef.current[index] = true;
          loadedCount += 1;
          if (loadedCount === 1 || loadedCount % 6 === 0 || loadedCount === FRAME_COUNT) setLoaded(loadedCount);
        }
        resolve();
      };
      img.onerror = () => resolve();
    });

    const load = async () => {
      // Prime the opening beat first so the section becomes usable quickly.
      await Promise.all(Array.from({ length: 18 }, (_, i) => loadOne(i)));
      if (cancelled) return;
      // Then fill the remainder without blocking first paint.
      const batch = 24;
      for (let start = 18; start < FRAME_COUNT; start += batch) {
        await Promise.all(Array.from({ length: Math.min(batch, FRAME_COUNT - start) }, (_, i) => loadOne(start + i)));
        if (cancelled) return;
      }
    };
    load();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const nearestLoaded = (index: number) => {
      if (loadedRef.current[index]) return index;
      for (let offset = 1; offset < FRAME_COUNT; offset++) {
        const before = index - offset;
        const after = index + offset;
        if (before >= 0 && loadedRef.current[before]) return before;
        if (after < FRAME_COUNT && loadedRef.current[after]) return after;
      }
      return 0;
    };

    const draw = (frame = currentFrame.current) => {
      const index = nearestLoaded(frame);
      const img = imagesRef.current[index];
      if (!img) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const targetW = Math.round(width * dpr);
      const targetH = Math.round(height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#080706";
      ctx.fillRect(0, 0, width, height);

      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const renderW = img.naturalWidth * scale;
      const renderH = img.naturalHeight * scale;
      const x = (width - renderW) / 2;
      const y = (height - renderH) / 2;
      ctx.drawImage(img, x, y, renderW, renderH);
    };

    const state = { frame: 0 };
    const tween = gsap.to(state, {
      frame: FRAME_COUNT - 1,
      ease: "none",
      snap: "frame",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.15,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const next = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(self.progress * (FRAME_COUNT - 1))));
          currentFrame.current = next;
          draw(next);
          setProgress(self.progress);
        },
      },
      onUpdate: () => draw(Math.round(state.frame)),
    });

    const onResize = () => draw();
    window.addEventListener("resize", onResize, { passive: true });
    const timer = window.setInterval(() => draw(), 220);

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      window.removeEventListener("resize", onResize);
      window.clearInterval(timer);
    };
  }, [loaded > 0]);

  const active = chapters.find((chapter) => progress >= chapter.start && progress <= chapter.end);
  const overall = Math.round(progress * 100);
  const loadPercent = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <section id="story" ref={sectionRef} className="sequence">
      <div className="sequence__sticky">
        <canvas ref={canvasRef} className="sequence__canvas" aria-label="Scroll-driven exploded view of AURA headphones" />
        <div className="sequence__shade" />
        <div className="sequence__ui shell">
          <div className="sequence__topline">
            <span>DISASSEMBLY STUDY</span>
            <span>{loaded < FRAME_COUNT ? `LOADING ${loadPercent}%` : "240 / 240 FRAMES READY"}</span>
          </div>
          <div className={`sequence__copy ${active ? "is-visible" : ""}`}>
            <p className="eyebrow">{active?.kicker ?? "SCROLL FILM"}</p>
            <h2>{active?.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h2>
            <p>{active?.body}</p>
          </div>
          <div className="sequence__meter" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
            <b>{String(Math.min(FRAME_COUNT, Math.max(1, Math.round(progress * FRAME_COUNT)))).padStart(3, "0")}</b>
            <em>{overall}%</em>
          </div>
        </div>
      </div>
    </section>
  );
}
