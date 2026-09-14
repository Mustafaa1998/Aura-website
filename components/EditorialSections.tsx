"use client";

import Image from "next/image";
import { motion } from "motion/react";

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: .72, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

export function EditorialSections() {
  return (
    <>
      <section id="design" className="manifesto section shell">
        <motion.div {...reveal} className="manifesto__index">01 — DESIGN LANGUAGE</motion.div>
        <motion.h2 {...reveal}>Less object.<br/><em>More atmosphere.</em></motion.h2>
        <motion.div {...reveal} className="manifesto__copy">
          <p>AURA is a fictional product concept designed as a canvas for scroll-driven storytelling. The hardware is restrained; the interaction does the speaking.</p>
          <p>Every transition is generated from a first and last visual state, then rebuilt on the web as a deterministic image sequence.</p>
        </motion.div>
      </section>

      <section className="feature-image section">
        <div className="feature-image__media">
          <Image src="/images/materials.webp" alt="AURA headphones close-up" fill sizes="100vw" />
        </div>
        <div className="feature-image__caption shell">
          <motion.div {...reveal}>
            <p className="eyebrow">MATERIAL / 02</p>
            <h3>Soft where it meets you.<br/>Precise everywhere else.</h3>
          </motion.div>
          <motion.p {...reveal}>Matte leather, brushed metal and deliberately quiet geometry create a product that feels substantial without becoming visually loud.</motion.p>
        </div>
      </section>

      <section id="technology" className="technology section shell">
        <motion.div {...reveal} className="technology__heading">
          <p className="eyebrow">TECHNOLOGY / 03</p>
          <h2>The inside is<br/><em>the interface.</em></h2>
        </motion.div>
        <div className="technology__grid">
          {[
            ["01", "Adaptive silence", "A conceptual acoustic layer that reacts to the environment rather than simply blocking it."],
            ["02", "Spatial field", "A wider imagined soundstage, expressed through separation, depth and controlled motion."],
            ["03", "Pressure mapping", "Comfort treated as a system: contact, weight and material working as one."],
            ["04", "Deterministic motion", "The web experience maps each scroll position to a known frame for tactile visual control."],
          ].map(([n, title, body]) => (
            <motion.article {...reveal} key={n} className="technology__item">
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="exploded section">
        <div className="exploded__image">
          <Image src="/images/exploded.webp" alt="Exploded view of AURA headphones" fill sizes="100vw" />
        </div>
        <div className="exploded__overlay shell">
          <motion.p {...reveal} className="eyebrow">ARCHITECTURE / 04</motion.p>
          <motion.h2 {...reveal}>240 frames.<br/>One continuous idea.</motion.h2>
          <motion.p {...reveal}>Generated motion becomes a web-native experience: no 3D model, no heavy real-time renderer—just a carefully prepared sequence, canvas rendering and scroll.</motion.p>
        </div>
      </section>

      <section id="experience" className="experience section shell">
        <div className="experience__aside">
          <p className="eyebrow">EXPERIENCE / 05</p>
          <span>BUILD NOTES</span>
        </div>
        <div className="experience__main">
          <motion.h2 {...reveal}>A cinematic 3D illusion,<br/><em>built from still images.</em></motion.h2>
          <motion.div {...reveal} className="experience__steps">
            {[
              ["01", "Define first + last states", "Create matching product frames with consistent camera, materials and lighting."],
              ["02", "Generate the transition", "Use an image-to-video model to produce the mechanical transformation."],
              ["03", "Extract the frames", "Split the video into a 30 fps image sequence and compress for the browser."],
              ["04", "Bind to scroll", "Canvas renders one frame at a time while GSAP maps page progress to sequence progress."],
            ].map(([n, title, body]) => (
              <div className="experience__step" key={n}>
                <span>{n}</span><h3>{title}</h3><p>{body}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="final-cta section">
        <Image src="/images/hero.webp" alt="" fill sizes="100vw" className="final-cta__image" />
        <div className="final-cta__veil" />
        <div className="final-cta__content shell">
          <motion.p {...reveal} className="eyebrow">AURA / CONCEPT STUDY</motion.p>
          <motion.h2 {...reveal}>More than sound.<br/><em>A study in motion.</em></motion.h2>
          <motion.div {...reveal} className="final-cta__row">
            <a className="button button--light" href="#top">Replay experience <span>↑</span></a>
            <p>Portfolio experiment · Next.js · Canvas · GSAP · Lenis · Motion</p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
