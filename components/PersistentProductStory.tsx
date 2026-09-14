"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 240;
const ANIMATION_END = 0.91;
const pad = (index: number) => String(index + 1).padStart(4, "0");
// Desktop keeps the already-efficient source JPGs; phones get a lighter 1152px
// WebP set (~60% smaller + far less decoded-image memory on constrained devices).
const frameSrc = (index: number, mobile = false) =>
  mobile
    ? `/frames/aura-mobile/frame_${pad(index)}.webp`
    : `/frames/aura/frame_${pad(index)}.jpg`;
const frameSrcJpg = (index: number) => `/frames/aura/frame_${pad(index)}.jpg`;

type Chapter = {
  start: number;
  end: number;
  kicker: string;
  title: string;
  body: string;
  side: "left" | "right";
};

type ComponentCallout = {
  id: string;
  start: number;
  end: number;
  number: string;
  title: string;
  body: string;
  label: { x: number; y: number };
  lineStart: { x: number; y: number };
  elbow?: { x: number; y: number };
  anchor: { x: number; y: number };
};

const chapters: Chapter[] = [
  {
    start: 0,
    end: 0.145,
    kicker: "AURA ONE / CONCEPT 01",
    title: "Sound,\nsculpted.",
    body: "A single product remains on screen from the first frame to the last. Scroll becomes the camera, the timeline and the control surface.",
    side: "left",
  },
  {
    start: 0.16,
    end: 0.31,
    kicker: "01 / FORM",
    title: "Start with\nthe whole.",
    body: "The silhouette stays calm while the construction begins to reveal itself. No scene cut. No second product shot.",
    side: "left",
  },
  {
    start: 0.32,
    end: 0.48,
    kicker: "02 / COMFORT",
    title: "Pressure,\nsoftened.",
    body: "The contact layer separates first, showing the cushion as part of the acoustic system rather than decoration.",
    side: "right",
  },
  {
    start: 0.49,
    end: 0.64,
    kicker: "03 / ENCLOSURE",
    title: "Shape controls\nresonance.",
    body: "The outer shell moves away from the core, turning the product silhouette into an architectural diagram.",
    side: "left",
  },
  {
    start: 0.65,
    end: 0.79,
    kicker: "04 / DRIVER",
    title: "The signal\nbecomes physical.",
    body: "At the center, the driver becomes the visual focus: a mechanical heart revealed through the scroll sequence.",
    side: "right",
  },
  {
    start: 0.80,
    end: 0.91,
    kicker: "05 / ARCHITECTURE",
    title: "Engineered from\nthe inside out.",
    body: "The final movement completes the exploded view and leaves every major layer suspended in a single continuous composition.",
    side: "left",
  },
];

const callouts: ComponentCallout[] = [
  {
    id: "outer-shell",
    start: 0.52,
    end: 1,
    number: "01",
    title: "Outer enclosure",
    body: "A rigid concept shell that frames the acoustic system and defines the AURA silhouette.",
    label: { x: 5.5, y: 33 },
    lineStart: { x: 23, y: 40 },
    elbow: { x: 20, y: 40 },
    anchor: { x: 16.5, y: 47 },
  },
  {
    id: "driver",
    start: 0.67,
    end: 1,
    number: "02",
    title: "Acoustic driver",
    body: "The central motion layer: treated as the visual and mechanical heart of the concept.",
    label: { x: 5.5, y: 67 },
    lineStart: { x: 24, y: 71 },
    elbow: { x: 31, y: 71 },
    anchor: { x: 37.5, y: 54 },
  },
  {
    id: "acoustic-chamber",
    start: 0.79,
    end: 1,
    number: "03",
    title: "Acoustic chamber",
    body: "Layered volume around the driver, imagined to manage airflow, resonance and separation.",
    label: { x: 76.5, y: 34 },
    lineStart: { x: 76, y: 42 },
    elbow: { x: 69, y: 42 },
    anchor: { x: 59, y: 53 },
  },
  {
    id: "cushion",
    start: 0.84,
    end: 1,
    number: "04",
    title: "Memory-foam seal",
    body: "The soft interface layer, designed around pressure distribution and a consistent acoustic seal.",
    label: { x: 77.5, y: 67 },
    lineStart: { x: 77, y: 73 },
    elbow: { x: 83, y: 73 },
    anchor: { x: 89, y: 65 },
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function PersistentProductStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(Array(FRAME_COUNT).fill(null));
  const loadedRef = useRef<boolean[]>(Array(FRAME_COUNT).fill(false));
  const currentFrame = useRef(0);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [activeCallout, setActiveCallout] = useState<string | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const hasLoaded = loaded > 0;

  // Track narrow viewports so copy retires in time for the mobile component cards.
  useEffect(() => {
    const check = () => setIsNarrow(window.innerWidth < 720);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeChapter = useMemo(
    () => chapters.find((chapter) => progress >= chapter.start && progress <= chapter.end),
    [progress],
  );

  // Announce chapter changes to any listeners (e.g. the ambient sound layer).
  useEffect(() => {
    if (!activeChapter) return;
    window.dispatchEvent(new CustomEvent("aura:chapter", { detail: activeChapter.kicker }));
  }, [activeChapter?.kicker]);

  const visibleCallouts = useMemo(() => {
    if (progress >= 0.915) return callouts;
    return callouts.filter((item) => progress >= item.start && progress <= item.end);
  }, [progress]);

  useEffect(() => {
    let cancelled = false;
    let loadedCount = 0;
    const useMobile = window.innerWidth < 720;

    const loadOne = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        let triedFallback = false;
        img.onload = () => {
          if (!cancelled) {
            imagesRef.current[index] = img;
            loadedRef.current[index] = true;
            loadedCount += 1;
            if (loadedCount === 1 || loadedCount % 8 === 0 || loadedCount === FRAME_COUNT) {
              setLoaded(loadedCount);
            }
          }
          resolve();
        };
        img.onerror = () => {
          // If the WebP set is unavailable, fall back to the original JPG once.
          if (!triedFallback) {
            triedFallback = true;
            img.src = frameSrcJpg(index);
            return;
          }
          resolve();
        };
        img.src = frameSrc(index, useMobile);
      });

    const load = async () => {
      // Prioritise the opening frames so the hero is ready almost immediately.
      await Promise.all(Array.from({ length: 24 }, (_, index) => loadOne(index)));
      if (cancelled) return;

      const batchSize = 28;
      for (let start = 24; start < FRAME_COUNT; start += batchSize) {
        await Promise.all(
          Array.from({ length: Math.min(batchSize, FRAME_COUNT - start) }, (_, index) =>
            loadOne(start + index),
          ),
        );
        if (cancelled) return;
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || loaded === 0) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const nearestLoaded = (index: number) => {
      if (loadedRef.current[index]) return index;
      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        const before = index - offset;
        const after = index + offset;
        if (before >= 0 && loadedRef.current[before]) return before;
        if (after < FRAME_COUNT && loadedRef.current[after]) return after;
      }
      return 0;
    };

    const draw = (frameIndex = currentFrame.current) => {
      const loadedIndex = nearestLoaded(frameIndex);
      const img = imagesRef.current[loadedIndex];
      if (!img) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const targetWidth = Math.round(width * dpr);
      const targetHeight = Math.round(height * dpr);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#070706";
      ctx.fillRect(0, 0, width, height);

      const imageRatio = img.naturalWidth / img.naturalHeight;
      const viewportRatio = width / height;
      const isPhone = width < 720;

      // Desktop fills the viewport cinematically. Mobile keeps a little more of the product in frame.
      const scale = isPhone
        ? Math.max(width / img.naturalWidth, (height * 0.78) / img.naturalHeight)
        : Math.max(width / img.naturalWidth, height / img.naturalHeight);

      const renderWidth = img.naturalWidth * scale;
      const renderHeight = img.naturalHeight * scale;
      const x = (width - renderWidth) / 2;
      const verticalBias = isPhone && viewportRatio < imageRatio ? -height * 0.04 : 0;
      const y = (height - renderHeight) / 2 + verticalBias;
      ctx.drawImage(img, x, y, renderWidth, renderHeight);
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.18,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const storyProgress = self.progress;
        const animationProgress = clamp(storyProgress / ANIMATION_END);
        const nextFrame = Math.round(animationProgress * (FRAME_COUNT - 1));
        currentFrame.current = nextFrame;
        draw(nextFrame);
        setProgress(storyProgress);
      },
    });

    draw(0);
    const onResize = () => draw();
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [hasLoaded]);

  const frameNumber = Math.min(
    FRAME_COUNT,
    Math.max(1, Math.round(clamp(progress / ANIMATION_END) * FRAME_COUNT)),
  );
  const loadPercent = Math.round((loaded / FRAME_COUNT) * 100);
  const finalState = progress >= 0.915;
  // Once the full four-callout diagram is forming, let it (and the centered final
  // CTA) take over — the side narrative copy would otherwise collide with the labels.
  // On phones the component cards share the bottom slot, so retire copy as they begin.
  const copyRetired = progress >= (isNarrow ? 0.49 : 0.8);
  const openingReady = loaded >= 24 || loaded >= FRAME_COUNT;
  const openingPercent = Math.min(100, Math.round((loaded / 24) * 100));
  const chapterAnnouncement = activeChapter
    ? `${activeChapter.kicker}. ${activeChapter.title.replace(/\n/g, " ")}`
    : "";

  return (
    <section id="story" ref={sectionRef} className="product-story">
      <span id="components" className="story-anchor story-anchor--components" aria-hidden="true" />
      <span id="final" className="story-anchor story-anchor--final" aria-hidden="true" />

      <div className="product-story__sticky">
        {/* Static first frame for instant LCP: painted immediately, sits behind the
            canvas which becomes opaque as soon as it draws the same frame. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc(0)}
          alt="AURA ONE headphones, ready to disassemble on scroll"
          className="product-story__poster"
          fetchPriority="high"
          decoding="async"
        />
        <canvas
          ref={canvasRef}
          className="product-story__canvas"
          aria-label="AURA headphones continuously disassembling as the page scrolls"
        />
        <div className="product-story__grade" aria-hidden="true" />
        <div className="product-story__vignette" aria-hidden="true" />

        <p className="sr-only" aria-live="polite">{chapterAnnouncement}</p>

        <div className="product-story__chrome shell">
          <div className="product-story__meta">
            <span>SCROLL / PRODUCT ARCHITECTURE</span>
            <span>{loaded < FRAME_COUNT ? `PRELOADING ${loadPercent}%` : "240 FRAMES / READY"}</span>
          </div>

          <div
            className={`story-copy story-copy--${activeChapter?.side ?? "left"} ${activeChapter ? "is-visible" : ""} ${copyRetired ? "is-hidden" : ""}`}
          >
            <p className="eyebrow">{activeChapter?.kicker ?? "AURA ONE"}</p>
            <h1 className={progress < 0.145 ? "story-copy__hero-title" : ""}>
              {activeChapter?.title.split("\n").map((line) => <span key={line}>{line}</span>)}
            </h1>
            <p className="story-copy__body">{activeChapter?.body}</p>
            {progress < 0.145 && (
              <div className="story-copy__hero-foot">
                <span>240-frame scroll film</span>
                <span className="story-copy__cue">Scroll to disassemble <i aria-hidden="true">↓</i></span>
              </div>
            )}
          </div>

          <div className="component-callouts" aria-label="AURA component annotations">
            <svg className="component-callouts__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {visibleCallouts.map((item) => {
                const points = item.elbow
                  ? `${item.lineStart.x},${item.lineStart.y} ${item.elbow.x},${item.elbow.y} ${item.anchor.x},${item.anchor.y}`
                  : `${item.lineStart.x},${item.lineStart.y} ${item.anchor.x},${item.anchor.y}`;
                const state = activeCallout
                  ? activeCallout === item.id
                    ? "is-active"
                    : "is-dim"
                  : "";
                return (
                  <g key={item.id} className={`callout-line is-visible ${state}`}>
                    <polyline points={points} />
                    <circle cx={item.anchor.x} cy={item.anchor.y} r="0.55" />
                  </g>
                );
              })}
            </svg>

            {visibleCallouts.map((item) => {
              const state = activeCallout
                ? activeCallout === item.id
                  ? "is-active"
                  : "is-dim"
                : "";
              return (
                <article
                  key={item.id}
                  className={`component-callout is-visible ${state}`}
                  style={{ left: `${item.label.x}%`, top: `${item.label.y}%` }}
                  onMouseEnter={() => setActiveCallout(item.id)}
                  onMouseLeave={() => setActiveCallout(null)}
                >
                  <span>{item.number}</span>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                </article>
              );
            })}
          </div>

          <div className={`mobile-component-card ${finalState ? "is-hidden" : ""}`} aria-live="polite">
            {visibleCallouts.slice(-1).map((item) => (
              <div key={item.id}>
                <span>{item.number} / COMPONENT</span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            ))}
          </div>

          <div className={`story-final ${finalState ? "is-visible" : ""}`}>
            <p className="eyebrow">AURA / EXPLODED</p>
            <h2>Every layer,<br /><em>still one object.</em></h2>
            <p>The final state holds long enough to read the architecture. Four leader lines turn the generated motion into a product story.</p>
            <div className="story-final__actions">
              <a className="button button--light" href="#top">Replay experience <span>↑</span></a>
              <span>Next.js · Canvas · GSAP · Lenis</span>
            </div>
          </div>

          <div className="product-story__progress" aria-hidden="true">
            <i style={{ transform: `scaleX(${progress})` }} />
            <span>{String(frameNumber).padStart(3, "0")}</span>
            <b>{Math.round(progress * 100)}%</b>
          </div>
        </div>

        <div
          className={`product-story__loader ${openingReady ? "is-done" : ""}`}
          role="status"
          aria-live="polite"
          aria-hidden={openingReady}
        >
          <span className="product-story__loader-brand">AURA</span>
          <div className="product-story__loader-bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${openingPercent / 100})` }} />
          </div>
          <span className="product-story__loader-label">
            {openingReady ? "Ready" : `Preparing the sequence · ${openingPercent}%`}
          </span>
        </div>
      </div>
    </section>
  );
}
