# Cape Angler

## Overview

Single-page reference site for recreational anglers fishing the Cape (knots, spots, reading, rod deals). Pulled from https://github.com/108city/fishing-app.

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Content**: Static JSON in `/content`
- **Node**: 24
- **Package manager**: npm

## Commands

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve production build

## Replit setup

- Workflow `Start application` runs `npm run dev -- -p 5000 -H 0.0.0.0` and serves the preview on port 5000.
- `next.config.mjs` allows Replit dev origins for the iframe preview.

## Deployment

- GitHub repo: https://github.com/mikaelrouah/Mikaels-fishing-app
- Auto-deploys to https://mikaels-fishing-app.vercel.app on every push to `main` via `.github/workflows/vercel-deploy.yml` (uses `VERCEL_TOKEN` repo secret).

## Auto deal refresh

- `scripts/update-deals.mjs` walks `content/deals.json`, fetches each item's `url`, parses the product price (JSON-LD / Open Graph meta), and updates `salePrice` only when the fetched price is *lower* than the stored one. Items whose `url` is a search/home page (e.g. `takealot.com/all?qsearch=...`) are skipped.
- `.github/workflows/refresh-deals.yml` runs the script daily at 02:00 UTC (also manual via "Run workflow"). If `deals.json` changes, it commits and pushes — which triggers the Vercel deploy workflow automatically.
- To enable refresh for an item, replace its `url` with the actual product page URL on the retailer site.

## Live conditions ("Best spot today")

- `app/api/conditions/route.ts` is a server route that fetches **Open-Meteo Forecast + Marine** (no API key required) for every spot in `content/spots.json`, scores them by wind / waves / rain / storm risk, and returns `bestToday`, `runnersUp`, and a computed moon phase.
- The route uses `export const revalidate = 14400` so Next caches the response for **4 hours** — the upstream APIs are only hit once per 4h window, regardless of how many users load the page.
- `components/BestSpotToday.tsx` is a client widget shown at the top of the Spots section. It calls `/api/conditions`, then renders the chosen spot, why it was picked, current wind/wave/temp, sunrise/sunset, moon phase, and 2 runners-up.

## Spots

- `content/spots.json` covers 26 locations: 20 saltwater (Atlantic + False Bay + South Coast) and 6 freshwater (Theewaterskloof, Clanwilliam, Berg River Paarl, Breede River Bonnievale, Garden Route Dam, Voëlvlei). Freshwater entries carry `freshwater: true` and skip the marine fetch.
- Each spot has a `microSpots[]` array — the named pinpoint sub-spots within (e.g. for Cape Point: "Buffels Bay corner", "Olifantsbos shelf"). They render as a "Best spots within" block on each card.
- Each card has a "Close-up satellite" toggle that opens a high-zoom (z=16, type=satellite) Google Maps iframe and an "Open in Maps" link.

## Deals routing

- All deal links go through `/out?to=<url>&id=<id>` (`app/out/route.ts`). The route allowlists `takealot.com`, `sportsmanswarehouse.co.za`, `capeunionmart.co.za`, `purefishing.com` and 302s to the destination. Anything else returns 400.
- The previous host `africanoutdoor.co.za` had dead DNS — every link 404'd. All entries were migrated to live Sportsmans Warehouse / Takealot search URLs.
