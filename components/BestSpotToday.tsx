"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";

type Conditions = {
  id: string;
  name: string;
  type: string;
  freshwater: boolean;
  windKmh: number | null;
  windGustKmh: number | null;
  windDir: number | null;
  tempC: number | null;
  precipMm: number | null;
  cloudPct: number | null;
  weather: string;
  sunrise: string | null;
  sunset: string | null;
  waveHeightM: number | null;
  wavePeriodS: number | null;
  swellHeightM: number | null;
  reasons: string[];
};

type ApiResponse = {
  fetchedAt: string;
  moon: { name: string; phase: number; illuminationPct: number };
  bestToday: Conditions | null;
  runnersUp: Conditions[];
  sources: { weather: string; marine: string; tides: string };
};

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function windDirLabel(deg: number | null): string {
  if (deg == null) return "—";
  return COMPASS[Math.round(deg / 22.5) % 16];
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Johannesburg" });
}

function fishingAdvice(c: Conditions, moonIllum: number): string {
  const tips: string[] = [];
  if ((c.windKmh ?? 0) <= 15) tips.push("light wind keeps the surface clean");
  if (!c.freshwater && (c.waveHeightM ?? 99) <= 1.2) tips.push("calm sea — safe on the rocks");
  if (!c.freshwater && (c.waveHeightM ?? 0) >= 1.5 && (c.waveHeightM ?? 0) <= 2.5) tips.push("a bit of push in the sea — kob and galjoen will feed");
  if ((c.precipMm ?? 0) === 0) tips.push("no rain to flatten bites");
  if (moonIllum >= 80) tips.push("near-full moon — strong tides, fish edges around dawn and dusk");
  else if (moonIllum <= 20) tips.push("dark moon — predators feed actively at night, dawn bite often best");
  if (tips.length === 0) return "Borderline conditions — check again later.";
  return tips.slice(0, 3).join(", ") + ".";
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink/55">{label}</p>
      <p className="font-display text-xl text-ocean mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-[11px] text-ink/60 mt-0.5">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="card p-6 md:p-8 bg-paper animate-pulse">
      <div className="h-4 w-32 bg-ocean/10 rounded" />
      <div className="h-8 w-2/3 bg-ocean/15 rounded mt-3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-3 w-12 bg-ocean/10 rounded" />
            <div className="h-6 w-20 bg-ocean/15 rounded mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BestSpotToday() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conditions")
      .then((r) => {
        if (!r.ok) throw new Error("API " + r.status);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return null;
  if (!data || !data.bestToday) return <Skeleton />;

  const best = data.bestToday;
  const moon = data.moon;
  const fetched = new Date(data.fetchedAt);

  return (
    <Reveal>
      <article className="card p-6 md:p-8 bg-gradient-to-br from-ocean/[0.04] via-paper to-kelp/[0.05] border border-ocean/15">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-coral">Best spot today · live</p>
            <h3 className="font-display text-2xl md:text-3xl text-ocean-deep mt-2">{best.name}</h3>
            <p className="text-sm text-ink/65 mt-1">
              {best.type}
              {best.freshwater ? " · Freshwater" : " · Saltwater"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-ink/55">Moon tonight</p>
            <p className="font-display text-lg text-ocean mt-0.5">{moon.name}</p>
            <p className="text-xs text-ink/65">{moon.illuminationPct}% illuminated</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat
            label="Wind"
            value={best.windKmh != null ? `${Math.round(best.windKmh)} km/h` : "—"}
            sub={`${windDirLabel(best.windDir)}${best.windGustKmh != null ? ` · gust ${Math.round(best.windGustKmh)}` : ""}`}
          />
          <Stat
            label={best.freshwater ? "Conditions" : "Wave height"}
            value={best.freshwater ? best.weather : best.waveHeightM != null ? `${best.waveHeightM.toFixed(1)} m` : "—"}
            sub={best.freshwater ? `${best.cloudPct ?? 0}% cloud` : best.wavePeriodS != null ? `${Math.round(best.wavePeriodS)} s period` : ""}
          />
          <Stat
            label="Air temp"
            value={best.tempC != null ? `${Math.round(best.tempC)}°C` : "—"}
            sub={best.weather}
          />
          <Stat
            label="Daylight"
            value={`${fmtTime(best.sunrise)} – ${fmtTime(best.sunset)}`}
            sub="Sunrise – Sunset"
          />
        </dl>

        <div className="mt-6 rounded-xl bg-paper/70 p-4 border border-ocean/10">
          <p className="text-sm text-ink/85">
            <strong className="text-ocean">Why this pick:</strong>{" "}
            {fishingAdvice(best, moon.illuminationPct)}
          </p>
          {best.reasons.length > 0 && (
            <p className="text-xs text-ink/60 mt-2">{best.reasons.join(" · ")}</p>
          )}
        </div>

        {data.runnersUp.length > 0 && (
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-wider text-ink/55 mb-2">Also fishable today</p>
            <div className="flex flex-wrap gap-2">
              {data.runnersUp.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-2 rounded-full bg-ocean/8 px-3 py-1.5 text-xs text-ocean"
                >
                  {r.name}
                  <span className="text-ink/55">
                    {r.windKmh != null ? `${Math.round(r.windKmh)} km/h` : ""}
                    {!r.freshwater && r.waveHeightM != null ? ` · ${r.waveHeightM.toFixed(1)} m` : ""}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        <p className="text-[10px] text-ink/45 mt-5 leading-relaxed">
          Live data via <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">open-meteo.com</a>
          {" "}(ECMWF + NOAA models, refreshed every 4 hours). For exact tide times consult the{" "}
          <a href="https://www.sanho.co.za" target="_blank" rel="noopener noreferrer" className="underline">SA Navy Hydrographic Office tide tables</a>.
          {" "}Last refreshed {fetched.toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}.
        </p>
      </article>
    </Reveal>
  );
}
