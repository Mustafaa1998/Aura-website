import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AURA ONE — Sculpted Sound",
    short_name: "AURA ONE",
    description:
      "A cinematic scroll-driven product concept built from a continuous 240-frame image sequence.",
    start_url: "/",
    display: "standalone",
    background_color: "#080706",
    theme_color: "#080706",
    icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
