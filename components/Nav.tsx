"use client";

import { useEffect, useState } from "react";

const links = [
  ["Experience", "#story"],
  ["Components", "#components"],
  ["Exploded view", "#final"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="AURA home">AURA</a>
      <nav className="nav__links" aria-label="Primary navigation">
        {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
      </nav>
      <a className="nav__cta" href="#final">View architecture <span>↘</span></a>
      <button
        className="nav__menu"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>
      <div className={`mobile-panel ${open ? "mobile-panel--open" : ""}`}>
        {links.map(([label, href]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}<span>↘</span></a>
        ))}
      </div>
    </header>
  );
}
