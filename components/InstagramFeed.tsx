"use client";

import { useEffect, useRef } from "react";

const EMBED_SRC = "https://www.instagram.com/embed.js";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export function InstagramFeedContent({
  instagramHandle,
  instagramPostUrls,
}: {
  instagramHandle: string;
  instagramPostUrls: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else if (!document.querySelector(`script[src="${EMBED_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = EMBED_SRC;
      script.async = true;
      script.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let pos = 0;
    let paused = false;
    let raf = 0;
    const speed = 0.6;

    const step = () => {
      if (!paused) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          pos += speed;
          if (pos >= half) pos -= half;
          el.scrollLeft = pos;
        }
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      pos = el.scrollLeft;
      paused = false;
    };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  const loop = [...instagramPostUrls, ...instagramPostUrls];

  return (
    <div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-white to-transparent" />

        <div ref={trackRef} className="ig-scroll flex gap-6 overflow-x-auto py-2">
          {loop.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="shrink-0 w-[326px] h-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(46,26,10,0.10)]"
            >
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  margin: 0,
                  width: 326,
                  minWidth: 326,
                  maxWidth: 326,
                  padding: 0,
                }}
              >
                <div style={{ padding: 24, textAlign: "center" }}>
                  <p style={{ color: "#b8a99a", fontSize: "0.85rem" }}>Loading post...</p>
                </div>
              </blockquote>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <a
          href={`https://www.instagram.com/${instagramHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-deepbrown text-cream font-sans text-[11px] uppercase tracking-[0.14em] px-6 py-3 rounded-sm hover:opacity-90 transition-opacity"
        >
          <InstagramIcon /> Follow @{instagramHandle}
        </a>
      </div>
    </div>
  );
}
