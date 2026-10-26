# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains only `PRD.md`, an Indonesian draft specification for a business consulting and legal services website. No application code, tests, or assets exist yet. Read the PRD before implementing features; keep unresolved business details marked TBD.

The planned stack is Astro SSG, Directus, and MySQL, with independent web and CMS deployments. Follow the PRD's proposed layout:

- `apps/web/`: Astro routes, components, styles, and frontend assets.
- `infra/directus/`: Docker Compose configuration, schema snapshots/migrations, and flows.
- `docs/`: supporting specifications, content maps, and operational runbooks.
- `.github/workflows/`: validation, builds, and deployment automation.
- `.env.example`: configuration variable names with safe placeholder values.

## Build, Test, and Development Commands

No package manifest, executable scripts, Docker configuration, or test runner is configured yet. Do not assume build or test commands currently work.

When scaffolding `apps/web/`, provide and document `npm run dev`, `npm run build`, and `npm run preview` for local development, static builds, and previewing output. The PRD targets Astro on `localhost:4321` and Directus on `localhost:8055`, with MySQL internal to Docker. Document dependency installation and CMS startup commands alongside their configuration.

## Coding Style & Naming Conventions

No formatter or linter is established. Configure consistent formatting when introducing code; use two-space indentation for frontend files. Follow Astro route conventions, including `/layanan/[slug]` and `/artikel/[slug]`. Use readable component names and the PRD's snake_case collection/field names, such as `site_settings` and `consent_to_publish`. Preserve Indonesian public-facing content and semantic, accessible HTML.

## Testing Guidelines

No test framework or coverage threshold exists. Document the chosen runner, test locations, naming convention, and execution command when adding tests. Validate publishing filters, unique slugs, required SEO metadata, encoded WhatsApp links, and portfolio consent. Check representative pages for keyboard access, responsive layout, and Lighthouse performance against the PRD's mobile target of 90 or higher. CMS fetch failures must fail builds while preserving the live deployment.

## Commit & Pull Request Guidelines

No Git history is available to establish commit conventions. Use concise, imperative subjects, such as `Add service detail routes`. PRs should describe scope, reference relevant PRD requirements or issues, report validation results, and include screenshots for visual changes. Explain schema, configuration, or deployment changes.

## Security & Configuration

Keep tokens and real credentials out of commits and browser bundles. Expose only approved published content through public CMS permissions; portfolios also require publication consent. Keep WhatsApp contact details centralized in `site_settings`.
