import Reveal from "./Reveal";
import ShowMore from "./ShowMore";
import spots from "@/content/spots.json";

const MAP_SRC =
  "https://www.google.com/maps?q=Cape+Town+Peninsula&ll=-34.15,18.55&z=9&output=embed";

const PREVIEW_COUNT = 4;

export default function SpotsSection() {
  return (
    <section id="spots" className="scroll-mt-20 py-20 md:py-28 bg-ocean/[0.035]">
      <div className="container-narrow">
        <Reveal>
          <p className="eyebrow">02 — On the water</p>
          <h2 className="section-heading mt-3">
            Spots worth the drive.
          </h2>
          <p className="mt-4 max-w-2xl text-ink/75">
            A curated map of shore, rock, harbour and estuary marks around the
            Cape, the West Coast and the Overberg. Click any spot below for
            directions.
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-10 overflow-hidden rounded-2xl border border-ocean/10 shadow-card">
            <iframe
              title="Cape Town fishing spots map"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block w-full h-[400px] md:h-[500px]"
            />
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          <ShowMore previewCount={PREVIEW_COUNT} itemLabel="spots">
            {spots.map((s, i) => {
              const directions = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&destination_place_id=${encodeURIComponent(
                s.name
              )}`;
              return (
                <Reveal key={s.id} delay={(i % PREVIEW_COUNT) * 40} as="li">
                  <article className="card p-5 h-full flex flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-xl text-ocean">{s.name}</h3>
                      <span className="text-xs uppercase tracking-wider text-kelp">
                        {s.type}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-ink/80">{s.description}</p>
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
                    <div className="mt-auto pt-5">
                      <a
                        href={directions}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-coral hover:text-coral-soft inline-flex items-center gap-1"
                      >
                        Directions
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ShowMore>
        </ul>
      </div>
    </section>
  );
}
