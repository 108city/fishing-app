"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import ShowMore from "./ShowMore";
import knots from "@/content/knots.json";

type Knot = (typeof knots)[number];

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
            Tap a knot to see the step-by-step and a demo video. Learn these cold and
            you&rsquo;ll lose fewer fish, faster.
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
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              loading="lazy"
              src={`https://www.youtube-nocookie.com/embed/${knot.youtubeId}?rel=0`}
              title={knot.videoTitle}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
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
