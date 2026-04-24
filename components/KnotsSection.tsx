"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import ShowMore from "./ShowMore";
import knots from "@/content/knots.json";

type Knot = (typeof knots)[number];
type VideoMode = "animated" | "real";

const PREVIEW_COUNT = 6;

export default function KnotsSection() {
  const [active, setActive] = useState<Knot | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    if (active) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return (
    <section id="knots" className="scroll-mt-20 py-20 md:py-28">
      <div className="container-narrow">
        <Reveal>
          <p className="eyebrow">01 — Essentials</p>
          <h2 className="section-heading mt-3">Knots that cover almost every day on the water.</h2>
          <p className="mt-4 max-w-2xl text-ink/75">
            Tap a knot to see the step-by-step plus an animated and a real-life
            demo video. Learn these cold and you&rsquo;ll lose fewer fish, faster.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ShowMore previewCount={PREVIEW_COUNT} itemLabel="knots">
            {knots.map((k, i) => (
              <Reveal key={k.id} as="li" delay={(i % PREVIEW_COUNT) * 60}>
                <button
                  onClick={() => setActive(k)}
                  className="card group text-left w-full overflow-hidden hover:shadow-lift focus:shadow-lift"
                  aria-label={`Open instructions for ${k.name}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-ocean/5">
                    <img
                      src={`https://i.ytimg.com/vi/${k.youtubeId}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 40%, rgba(15,76,92,0.55) 100%)"
                      }}
                      aria-hidden
                    />
                    <span className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-medium text-ocean">
                      Watch & learn
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl text-ocean">{k.name}</h3>
                    <p className="mt-2 text-sm text-ink/75">{k.useCase}</p>
                  </div>
                </button>
              </Reveal>
            ))}
          </ShowMore>
        </ul>
      </div>

      {active && <KnotModal knot={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function KnotModal({ knot, onClose }: { knot: Knot; onClose: () => void }) {
  const [mode, setMode] = useState<VideoMode>("animated");
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const current = mode === "animated"
    ? { id: knot.animatedYoutubeId, title: knot.animatedVideoTitle }
    : { id: knot.youtubeId, title: knot.videoTitle };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0 && mode === "animated") setMode("real");
    else if (dx > 0 && mode === "real") setMode("animated");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`knot-${knot.id}-title`}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ocean-deep/60 backdrop-blur-sm p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-paper w-full max-w-3xl rounded-t-3xl md:rounded-3xl shadow-lift overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="eyebrow">Knot</p>
            <h3
              id={`knot-${knot.id}-title`}
              className="mt-1 font-display text-2xl md:text-3xl text-ocean"
            >
              {knot.name}
            </h3>
            <p className="mt-2 text-ink/75">{knot.useCase}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-ocean/20 p-2 text-ocean hover:bg-ocean/5 shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto">
          <div>
            <div
              role="tablist"
              aria-label="Video style"
              className="inline-flex rounded-full border border-ocean/15 bg-ocean/5 p-1 text-xs font-medium"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === "animated"}
                onClick={() => setMode("animated")}
                className={`rounded-full px-3 py-1.5 transition ${
                  mode === "animated"
                    ? "bg-coral text-paper shadow-sm"
                    : "text-ocean hover:text-ocean-deep"
                }`}
              >
                Animated
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === "real"}
                onClick={() => setMode("real")}
                className={`rounded-full px-3 py-1.5 transition ${
                  mode === "real"
                    ? "bg-coral text-paper shadow-sm"
                    : "text-ocean hover:text-ocean-deep"
                }`}
              >
                Real life
              </button>
            </div>
            <p className="mt-2 text-xs text-ink/55 md:hidden">
              Swipe the video to switch.
            </p>

            <div
              className="mt-3 aspect-video rounded-xl overflow-hidden bg-black select-none touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <iframe
                key={current.id}
                loading="lazy"
                src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0`}
                title={current.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>

          <ol className="space-y-3 text-ink/85">
            {knot.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 grid place-items-center h-6 w-6 rounded-full bg-coral text-paper text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
