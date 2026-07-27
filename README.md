# JobOrbit AI

A premium, responsive job-discovery prototype focused on DevOps, platform
engineering, cloud, SRE, MLOps and adjacent AI roles.

> The repository currently contains **100 fictional sample jobs**. They are
> deliberately labelled as sample data throughout the UI and do not represent
> active vacancies. Replace the demo provider before using the site for live
> applications.

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

The data contract, filter configuration, categories, companies and demo provider
are in `lib/job-data.ts`. The UI reads the exported `JOBS`, `COMPANIES` and
`CATEGORIES` collections rather than embedding records in components.

For a live aggregator:

1. Keep the `Job` interface as the normalised destination schema.
2. Add one adapter per source (company career page, ATS, API or scraper).
3. Normalise each source into `Job`.
4. Deduplicate using the source URL plus company/title/location.
5. Validate timestamps and application URLs.
6. Replace the demo `JOBS` export with a server/API-backed provider.
7. Schedule refreshes and expire records that fail verification.

The UI already exposes discovered/verified/source fields and clearly separates
the application URL from the aggregator.

## Deployment

Pushes to `main` run `.github/workflows/deploy-pages.yml`, build all static
routes and publish them to GitHub Pages.

The same source is also compatible with the included Sites deployment
configuration.
