import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const title = "AURA ONE — Sculpted Sound";
const description =
  "A cinematic scroll-driven product concept: one headphone disassembles frame by frame across a continuous 240-frame image sequence.";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "AURA ONE",
  keywords: ["AURA", "scroll experience", "product design", "headphones", "canvas", "GSAP", "cinematic"],
  authors: [{ name: "AURA Concept Study" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    title,
    description,
    siteName: "AURA ONE",
    images: [{ url: "/images/hero.webp", width: 1280, height: 720, alt: "AURA ONE headphones" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/hero.webp"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080706",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {children}
        <noscript>
          <div className="noscript-fallback">
            <strong>AURA ONE</strong>
            <p>
              This is a scroll-driven, canvas-rendered product experience that needs JavaScript
              enabled. Please turn on JavaScript to view the 240-frame sequence.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
