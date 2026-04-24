import Reveal from "./Reveal";
import ShowMore from "./ShowMore";
import articles from "@/content/articles.json";

const PREVIEW_COUNT = 3;

export default function ReadingSection() {
  return (
    <section id="reading" className="scroll-mt-20 py-20 md:py-28">
      <div className="container-narrow">
        <Reveal>
          <p className="eyebrow">03 — Useful reading</p>
          <h2 className="section-heading mt-3">Know before you cast.</h2>
          <p className="mt-4 max-w-2xl text-ink/75">
            Background reading on permits, species, tides and catch-and-release —
            the bits that turn a day out into a catch.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          <ShowMore previewCount={PREVIEW_COUNT} itemLabel="articles">
            {articles.map((a, i) => (
              <Reveal key={a.id} as="li" delay={(i % PREVIEW_COUNT) * 50}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-5 flex gap-4 h-full hover:shadow-lift group"
                >
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-ocean/5 overflow-hidden grid place-items-center">
                    <img
                      src={`https://www.google.com/s2/favicons?sz=64&domain=${a.sourceHost}`}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-kelp uppercase tracking-wider">
                      {a.source}
                    </p>
                    <h3 className="mt-1 font-display text-lg text-ocean group-hover:text-ocean-deep">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink/75">{a.summary}</p>
                    <p className="mt-3 text-xs text-ink/55">
                      {a.readMinutes} min read · opens on {a.sourceHost}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </ShowMore>
        </ul>
      </div>
    </section>
  );
}
