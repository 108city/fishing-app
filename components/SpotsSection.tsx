"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import ShowMore from "./ShowMore";
import BestSpotToday from "./BestSpotToday";
import spots from "@/content/spots.json";

const MAP_SRC =
  "https://www.google.com/maps?q=Cape+Town+Western+Cape&ll=-33.8,19.5&z=7&output=embed";

const PREVIEW_COUNT = 4;

type Spot = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  description: string;
  beginnerFriendly: boolean;
  permit: string;
  freshwater?: boolean;
  microSpots?: string[];
};

function SpotCard({ s, idx }: { s: Spot; idx: number }) {
  const [showCloseUp, setShowCloseUp] = useState(false);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&destination_place_id=${encodeURIComponent(
    s.name
  )}`;
  const closeUpEmbed = `https://maps.google.com/maps?q=${s.lat},${s.lng}&t=k&z=16&output=embed`;
  const satelliteLink = `https://www.google.com/maps/@${s.lat},${s.lng},17z/data=!3m1!1e3`;
  const accentClass = s.freshwater
    ? "bg-kelp/15 text-kelp"
    : "bg-ocean/15 text-ocean";
  return (
    <Reveal delay={(idx % PREVIEW_COUNT) * 40} as="li">
      <article className="card p-5 h-full flex flex-col">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl text-ocean">{s.name}</h3>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${accentClass}`}>
            {s.freshwater ? "Freshwater" : s.type}
          </span>
        </div>
        {s.freshwater && (
          <p className="text-xs text-kelp/80 mt-1 italic">{s.type}</p>
        )}
        <p className="mt-3 text-sm text-ink/80">{s.description}</p>

        {s.microSpots && s.microSpots.length > 0 && (
          <div className="mt-4 rounded-lg bg-paper border border-ocean/10 p-3">
            <p className="text-[10px] uppercase tracking-wider text-coral font-semibold mb-2">
              Best spots within
            </p>
            <ul className="space-y-1.5 text-xs text-ink/80">
              {s.microSpots.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-coral mt-0.5 shrink-0">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <dl className="mt-4 text-xs text-ink/70 space-y-1">
          <div className="flex gap-2">
            <dt className="font-medium text-ocean/80">Skill level:</dt>
            <dd>{s.beginnerFriendly ? "Beginner-friendly" : "Experienced anglers"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-ocean/80">Permit:</dt>
            <dd>{s.permit}</dd>
          </div>
        </dl>

        {showCloseUp && (
          <div className="mt-4 overflow-hidden rounded-lg border border-ocean/10">
            <iframe
              title={`${s.name} satellite close-up`}
              src={closeUpEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full h-[260px]"
            />
          </div>
        )}

        <div className="mt-auto pt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={() => setShowCloseUp((v) => !v)}
            className="text-sm font-medium text-ocean hover:text-ocean-deep inline-flex items-center gap-1"
            aria-expanded={showCloseUp}
          >
            {showCloseUp ? "Hide close-up" : "Close-up satellite"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showCloseUp ? "rotate-180" : ""}`} aria-hidden>
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href={satelliteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink/60 hover:text-ocean underline-offset-2 hover:underline"
          >
            Open in Maps
          </a>
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-sm font-medium text-coral hover:text-coral-soft inline-flex items-center gap-1"
          >
            Directions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export default function SpotsSection() {
  const all = spots as Spot[];
  const saltCount = all.filter((s) => !s.freshwater).length;
  const freshCount = all.filter((s) => s.freshwater).length;
  return (
    <section id="spots" className="scroll-mt-20 py-20 md:py-28 bg-ocean/[0.035]">
      <div className="container-narrow">
        <Reveal>
          <p className="eyebrow">02 — On the water</p>
          <h2 className="section-heading mt-3">
            Spots worth the drive.
          </h2>
          <p className="mt-4 max-w-2xl text-ink/75">
            A curated map of {saltCount} shore, rock, harbour and estuary marks plus {freshCount} freshwater dams and rivers
            around the Cape, the West Coast, the Overberg and the Garden Route. Each card lists the best spots within that area, and you can open a satellite close-up before you drive.
          </p>
        </Reveal>

        <div className="mt-10">
          <BestSpotToday />
        </div>

        <Reveal>
          <div className="mt-10 overflow-hidden rounded-2xl border border-ocean/10 shadow-card">
            <iframe
              title="Western Cape fishing spots map"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full h-[400px] md:h-[500px]"
            />
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          <ShowMore previewCount={PREVIEW_COUNT} itemLabel="spots">
            {all.map((s, i) => (
              <SpotCard key={s.id} s={s} idx={i} />
            ))}
          </ShowMore>
        </ul>
      </div>
    </section>
  );
}
