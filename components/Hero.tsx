"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const enter = reduceMotion ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 } };

  return (
    <section id="top" className="hero">
      <div className="hero__image-wrap" aria-hidden="true">
        <Image src="/images/hero.webp" alt="" fill priority sizes="100vw" className="hero__image" />
      </div>
      <div className="hero__veil" />
      <div className="hero__content shell">
        <motion.p {...enter} transition={{ duration: .7, delay: .08 }} className="eyebrow">AURA ONE / CONCEPT 01</motion.p>
        <motion.h1 {...enter} transition={{ duration: .8, delay: .16 }}>
          Sound,<br/><em>sculpted.</em>
        </motion.h1>
        <motion.p {...enter} transition={{ duration: .8, delay: .25 }} className="hero__lede">
          A cinematic product study where industrial design unfolds one frame at a time.
        </motion.p>
        <motion.div {...enter} transition={{ duration: .8, delay: .34 }} className="hero__actions">
          <a href="#story" className="button button--light">Enter the experience <span>↓</span></a>
          <span className="hero__note">240-frame scroll film · JPG canvas</span>
        </motion.div>
      </div>
      <div className="hero__rail" aria-hidden="true"><span>SCROLL TO DISASSEMBLE</span><i /></div>
    </section>
  );
}
