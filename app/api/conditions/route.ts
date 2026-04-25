import spotsData from "@/content/spots.json";

export const revalidate = 14400;

type Spot = {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  beginnerFriendly: boolean;
  freshwater?: boolean;
};

const SPOTS = spotsData as Spot[];

const FOUR_HOURS = 14400;

async function fetchWeather(lat: number, lng: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,cloud_cover` +
    `&daily=sunrise,sunset` +
    `&timezone=Africa/Johannesburg`;
  const r = await fetch(url, { next: { revalidate: FOUR_HOURS } });
  if (!r.ok) throw new Error("weather " + r.status);
  return r.json();
}

async function fetchMarine(lat: number, lng: number) {
  const url =
    `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}` +
    `&current=wave_height,wave_period,wave_direction,wind_wave_height,swell_wave_height,swell_wave_period` +
    `&timezone=Africa/Johannesburg`;
  const r = await fetch(url, { next: { revalidate: FOUR_HOURS } });
  if (!r.ok) return null;
  return r.json();
}

function weatherSummary(code: number | null | undefined): string {
  if (code == null) return "Unknown";
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Mostly clear";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code === 95) return "Thunderstorm";
  if (code >= 96) return "Thunder + hail";
  return "Mixed";
}

function moonPhase(date: Date): { phase: number; name: string } {
  // Conway's algorithm — fraction of cycle 0..1 (0=new, 0.5=full)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  let r = year % 100;
  r = r % 19;
  if (r > 9) r -= 19;
  r = (r * 11) % 30 + month + day;
  if (month < 3) r += 2;
  r -= year < 2000 ? 4 : 8.3;
  r = ((r % 30) + 30) % 30;
  const phase = r / 29.53;
  let name = "Waxing crescent";
  if (phase < 0.03 || phase > 0.97) name = "New moon";
  else if (phase < 0.22) name = "Waxing crescent";
  else if (phase < 0.28) name = "First quarter";
  else if (phase < 0.47) name = "Waxing gibbous";
  else if (phase < 0.53) name = "Full moon";
  else if (phase < 0.72) name = "Waning gibbous";
  else if (phase < 0.78) name = "Last quarter";
  else name = "Waning crescent";
  return { phase, name };
}

function illumination(phase: number): number {
  // 0 at new, 1 at full, smooth cosine
  return Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);
}

type Conditions = {
  id: string;
  name: string;
  type: string;
  freshwater: boolean;
  beginnerFriendly: boolean;
  lat: number;
  lng: number;
  windKmh: number | null;
  windGustKmh: number | null;
  windDir: number | null;
  tempC: number | null;
  precipMm: number | null;
  cloudPct: number | null;
  weatherCode: number | null;
  weather: string;
  sunrise: string | null;
  sunset: string | null;
  waveHeightM: number | null;
  wavePeriodS: number | null;
  waveDir: number | null;
  swellHeightM: number | null;
  swellPeriodS: number | null;
  score: number | null;
  reasons: string[];
};

function scoreSpot(c: Conditions): { score: number | null; reasons: string[] } {
  const reasons: string[] = [];
  if (c.windKmh == null || c.tempC == null) {
    return { score: null, reasons: ["No live data available"] };
  }
  // Lower score = better
  let score = 0;
  // Wind: ideal 5-15 km/h
  if (c.windKmh < 5) {
    score += 5;
    reasons.push(`${Math.round(c.windKmh)} km/h breeze — almost flat`);
  } else if (c.windKmh <= 15) {
    score += 0;
    reasons.push(`${Math.round(c.windKmh)} km/h breeze — clean conditions`);
  } else if (c.windKmh <= 25) {
    score += 15;
    reasons.push(`${Math.round(c.windKmh)} km/h wind — workable`);
  } else if (c.windKmh <= 35) {
    score += 50;
    reasons.push(`${Math.round(c.windKmh)} km/h wind — tough day`);
  } else {
    score += 200;
    reasons.push(`${Math.round(c.windKmh)} km/h — too windy`);
  }
  // Wave height (saltwater only)
  if (!c.freshwater && c.waveHeightM != null) {
    if (c.waveHeightM < 0.6) {
      score += 0;
      reasons.push(`${c.waveHeightM.toFixed(1)} m sea — very calm`);
    } else if (c.waveHeightM <= 1.5) {
      score += 5;
      reasons.push(`${c.waveHeightM.toFixed(1)} m sea — fishable`);
    } else if (c.waveHeightM <= 2.5) {
      score += 30;
      reasons.push(`${c.waveHeightM.toFixed(1)} m sea — rough`);
    } else {
      score += 150;
      reasons.push(`${c.waveHeightM.toFixed(1)} m sea — dangerous swell`);
    }
  }
  // Rain
  if ((c.precipMm ?? 0) > 0.5) {
    score += 25;
    reasons.push("Active rainfall");
  }
  // Storm
  if (c.weatherCode != null && c.weatherCode >= 95) {
    score += 500;
    reasons.push("Thunderstorm — stay home");
  }
  return { score, reasons };
}

export async function GET() {
  const results: Conditions[] = await Promise.all(
    SPOTS.map(async (s) => {
      const [weather, marine] = await Promise.all([
        fetchWeather(s.lat, s.lng).catch(() => null),
        s.freshwater ? Promise.resolve(null) : fetchMarine(s.lat, s.lng).catch(() => null)
      ]);
      const c: Conditions = {
        id: s.id,
        name: s.name,
        type: s.type,
        freshwater: !!s.freshwater,
        beginnerFriendly: s.beginnerFriendly,
        lat: s.lat,
        lng: s.lng,
        windKmh: weather?.current?.wind_speed_10m ?? null,
        windGustKmh: weather?.current?.wind_gusts_10m ?? null,
        windDir: weather?.current?.wind_direction_10m ?? null,
        tempC: weather?.current?.temperature_2m ?? null,
        precipMm: weather?.current?.precipitation ?? null,
        cloudPct: weather?.current?.cloud_cover ?? null,
        weatherCode: weather?.current?.weather_code ?? null,
        weather: weatherSummary(weather?.current?.weather_code),
        sunrise: weather?.daily?.sunrise?.[0] ?? null,
        sunset: weather?.daily?.sunset?.[0] ?? null,
        waveHeightM: marine?.current?.wave_height ?? null,
        wavePeriodS: marine?.current?.wave_period ?? null,
        waveDir: marine?.current?.wave_direction ?? null,
        swellHeightM: marine?.current?.swell_wave_height ?? null,
        swellPeriodS: marine?.current?.swell_wave_period ?? null,
        score: null,
        reasons: []
      };
      const sc = scoreSpot(c);
      c.score = sc.score;
      c.reasons = sc.reasons;
      return c;
    })
  );
  const ranked = results.filter((r) => r.score != null).sort((a, b) => (a.score! - b.score!));
  const best = ranked[0] ?? null;
  const moon = moonPhase(new Date());
  return Response.json(
    {
      fetchedAt: new Date().toISOString(),
      revalidateSeconds: FOUR_HOURS,
      moon: { ...moon, illuminationPct: illumination(moon.phase) },
      bestToday: best,
      runnersUp: ranked.slice(1, 4),
      spots: results,
      sources: {
        weather: "Open-Meteo (open-meteo.com) — derived from ECMWF, DWD ICON and NOAA GFS models. Updated hourly upstream; cached here every 4 hours.",
        marine: "Open-Meteo Marine API — derived from NOAA WaveWatch III and DWD EWAM.",
        tides: "For exact tide times, consult the SA Navy Hydrographic Office (sanho.co.za) — official daily tables for South African ports."
      }
    },
    {
      headers: {
        "cache-control": `public, s-maxage=${FOUR_HOURS}, stale-while-revalidate=600`
      }
    }
  );
}
