# AURA — Continuous Product Story

A cinematic Next.js portfolio sample built from a 240-frame generated headphone sequence.

## Core idea

The product animation now begins in the hero and remains on screen through the entire experience. There are no separate static product sections. One sticky canvas drives the full page while copy and component annotations change around it.

At the exploded stage, animated leader lines point directly to the visible headphone layers and explain the concept components.

## Stack

- Next.js 15 + React 19 + TypeScript
- HTML Canvas image-sequence renderer
- GSAP + ScrollTrigger
- Lenis smooth scrolling
- 240 source JPG frames

## Run

```bash
npm install
npm run verify:frames
npm run dev
```

Open `http://localhost:3000`.

## Interaction structure

1. Hero begins on frame 001.
2. Scroll progressively disassembles the same product.
3. Narrative chapters appear without cutting away from the product.
4. Leader lines reveal individual components as the exploded view becomes readable.
5. The final frame holds while all component annotations and final CTA are visible.
6. Mobile uses compact component cards because leader lines become too cramped on narrow screens.
