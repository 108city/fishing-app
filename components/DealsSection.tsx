"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import dealsData from "@/content/deals.json";

const zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0
});

type Tier = "beginner" | "intermediate" | "pro";

const tierLabel: Record<Tier, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  pro: "Pro"
};

const tierClass: Record<Tier, string> = {
  beginner: "bg-kelp/15 text-kelp",
  intermediate: "bg-ocean/15 text-ocean",
  pro: "bg-coral/15 text-coral"
};

const PREVIEW_CATEGORIES = 2;

export default function DealsSection() {
  const { categories, lastUpdated } = dealsData;
  const [expanded, setExpanded] = useState(false);
  const visibleCategories = expanded
    ? categories
    : categories.slice(0, PREVIEW_CATEGORIES);
  const hidden = categories.length - PREVIEW_CATEGORIES;

  return (
    <section id="deals" className="scroll-mt-20 py-20 md:py-28 bg-ocean/[0.035]">
      <div className="container-narrow">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">04 — Gear</p>
              <h2 className="section-heading mt-3">Gear worth a look.</h2>
              <p className="mt-4 max-w-2xl text-ink/75">
                Hand-picked gear from South African retailers — rods, reels,
                lines, lures, sabikis and tools. Beginner-friendly through to
                pro setups, all from brands with a long track record.
              </p>
            </div>
            <p className="text-xs text-ink/55">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 space-y-16">
          {visibleCategories.map((cat) => (
            <Reveal key={cat.id}>
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ocean/15 pb-3">
                  <h3 className="font-display text-2xl text-ocean-deep">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-ink/65 max-w-md">{cat.blurb}</p>
                </div>

                <ul className="mt-6 flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:overflow-visible">
                  {cat.items.map((d, i) => {
                    const discount = Math.round(
                      ((d.originalPrice - d.salePrice) / d.originalPrice) * 100
                    );
                    const tier = d.tier as Tier;
                    return (
                      <Reveal key={d.id} as="li" delay={i * 50}>
                        <article className="card h-full min-w-[78vw] sm:min-w-[340px] md:min-w-0 snap-start flex flex-col overflow-hidden">
                          <div className="relative aspect-[4/3] bg-gradient-to-br from-ocean/5 to-kelp/10 grid place-items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={d.image}
                              alt={d.name}
                              loading="lazy"
                              className="max-h-[70%] max-w-[80%] object-contain"
                            />
                            {discount > 0 && (
                              <span className="absolute top-3 left-3 rounded-full bg-coral px-2.5 py-1 text-[10px] font-semibold tracking-wider text-paper uppercase">
                                -{discount}%
                              </span>
                            )}
                            <span
                              className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase ${tierClass[tier]}`}
                            >
                              {tierLabel[tier]}
                            </span>
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <h4 className="font-display text-base text-ocean leading-snug">
                              {d.name}
                            </h4>
                            <p className="mt-1 text-xs text-ink/65">{d.spec}</p>
                            <div className="mt-3 flex items-baseline gap-2">
                              <span className="text-coral text-lg font-semibold">
                                {zar.format(d.salePrice)}
                              </span>
                              <span className="text-xs text-ink/50 line-through">
                                {zar.format(d.originalPrice)}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-ink/60">{d.retailer}</p>
                            <a
                              href={`/out?to=${encodeURIComponent(d.url)}&id=${encodeURIComponent(d.id)}`}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="btn-coral mt-4 self-start text-xs"
                            >
                              View deal
                            </a>
                          </div>
                        </article>
                      </Reveal>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {hidden > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="btn-ghost text-sm"
              aria-expanded={expanded}
            >
              {expanded
                ? "Show fewer categories"
                : `See all ${categories.length} gear categories`}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`ml-1 inline-block transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
