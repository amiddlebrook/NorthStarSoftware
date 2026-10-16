# NorthStar Software — public portfolio

A complete, automatically updated, responsive portfolio for every public GitHub repository owned by [@amiddlebrook](https://github.com/amiddlebrook).

## Features

- Every public repository is indexed, including archived and forked repositories, not just featured projects.
- Featured projects and categorization, search, sort, grid/list view, responsive layouts and keyboard search shortcut (Ctrl/Cmd+K).
- Descriptions, languages, stars, forks and website URLs come from GitHub; no fake demos or fabricated metrics.
- The GitHub Actions workflow fetches all public repository pages (100/page), builds the React/Vite site and deploys to Cloudflare Workers static assets.
- Sync happens on every push to main, manually, and every six hours. New public repositories are added automatically without a code change.
- No database, runtime GitHub API quota, paid service, external analytics, or client-side API keys.

## Deployment

GitHub repository Settings > Secrets and variables > Actions:

- CLOUDFLARE_API_TOKEN: API token with Workers Scripts Edit access in the destination account.
- CLOUDFLARE_ACCOUNT_ID: Cloudflare account ID.

These are deployment credentials only and are never sent to the browser or committed to Git.

The workflow at .github/workflows/cloudflare.yml runs automatically after a push to main. In Cloudflare Workers, the service is named northstarsoftware and is available on your account's workers.dev subdomain when workers.dev is enabled.

## Develop locally

1. Install Node.js 22 or newer.
2. Run npm ci.
3. Run npm run sync:repos (optional; downloads public catalog; GitHub token is optional locally).
4. Run npm run dev.
5. Run npm run build before publishing.

The repository includes an initial catalog of all public repositories identified on October 16, 2026, so development still works if the GitHub API is unavailable.

## Architecture

- React + Vite frontend built into dist/
- Cloudflare Workers static assets configured by wrangler.toml
- GitHub Actions scheduled metadata refresh and deployment
- No Cloudflare D1, KV, R2, external hosting, or API-token runtime storage needed

Public repository metadata is retrieved at build time. A repository's Website button is shown only when that repository exposes a valid homepage URL in GitHub metadata. Website availability is not guaranteed.

## Real app previews and click-throughs

The build reads each public repository's Wrangler configuration, discovers its Worker name, checks whether `https://<worker>.averymiddlebrook2014.workers.dev/` actually serves an HTML page, and captures a real 1440×900 screenshot with Playwright. Where no Cloudflare Worker can be verified, a functioning HTTPS repository homepage is used when available. Where no live app exists, a genuine screenshot or demo image from the repository may be displayed and the card explicitly identifies it as source-only; the card falls back to the GitHub repository rather than inventing a working deployment.

Clicking a card's main area opens the verified live application in a new tab. The separate GitHub source link always opens the source repository. CI regenerates screenshots on deployment and every six hours.
