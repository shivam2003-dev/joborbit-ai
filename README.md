# JobOrbit AI

A premium, responsive job aggregator focused on DevOps, platform engineering,
cloud, SRE, MLOps and adjacent AI roles.

The catalogue contains real listings from the
[Himalayas public jobs API](https://himalayas.app/api). Every record is:

- published within the last 45 days;
- reported with a future expiry date at refresh time;
- explicitly states a minimum experience requirement between 1 and 4 years;
- excludes senior, staff, lead, principal, manager and director titles;
- linked to its original HTTPS job and application pages; and
- rechecked by the scheduled daily refresh before deployment.

Counts change as eligible listings are added, close or expire. Company logos
come from the same source feed and fall back to initials when unavailable.
Published salary ranges are also shown as indicative Indian rupee conversions
using dated public exchange-rate data while preserving the original currency.

## Product surfaces

- SaaS-style homepage with search, categories, region shortcuts, featured jobs,
  recent jobs, companies and alert CTA
- Desktop job search with filter sidebar, compact result list and job preview
- Mobile job search with responsive cards and slide-over filters
- Filters for region, date posted, work arrangement and skills
- Sort by relevance, newest and salary
- Full SEO-friendly job detail pages with JobPosting structured data
- Company directory and company profiles
- Saved-jobs interaction, job-alert form, dark theme and admin dashboard
- Static pages for India, international, remote and category searches
- Social preview card and complete GitHub Pages deployment workflow
- Daily automated catalogue refresh with expiry and recency validation

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm test
npm run build:pages
```

`npm run build` creates the Sites/Cloudflare-compatible build.  
`npm run build:pages` creates the fully static GitHub Pages site in `out/`.

## Updating the job catalogue

Run the same source refresh used in deployment:

```bash
npm run fetch:jobs
```

`scripts/fetch-jobs.mjs` searches the source across all supported categories,
normalises and deduplicates records, rejects listings older than 45 days,
rejects expired records, validates HTTPS URLs, removes higher-experience roles
and writes `data/jobs.json`.

`lib/job-data.ts` applies a second runtime freshness check so a stale generated
file cannot expose expired or older-than-45-day listings.

## Deployment

Pushes to `main` build all static routes and publish them to GitHub Pages.
The same workflow runs daily at 02:17 UTC, refreshes and commits the catalogue,
then deploys the current site. It can also be triggered manually from GitHub
Actions.

The same source is also compatible with the included Sites deployment
configuration.
