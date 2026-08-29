# Job Hunt Tracker

[![Reliability Smoke](../../actions/workflows/reliability-smoke.yml/badge.svg)](../../actions/workflows/reliability-smoke.yml)
[![Typecheck](../../actions/workflows/typecheck.yml/badge.svg)](../../actions/workflows/typecheck.yml)
[![Firebase Hosting](../../actions/workflows/firebase-hosting.yml/badge.svg)](../../actions/workflows/firebase-hosting.yml)

## Install the dependencies

```bash
npm install
```

### Start the app in development mode (HMR, error reporting, etc.)

```bash
quasar dev
```

### Format & Lint the files

```bash
npm run lint
```

...or just check formatting & linting:

```bash
npm run lint:check
```

### Build the app for production

```bash
quasar build
```

## Firebase Hosting Deployment

This repository is configured to deploy to Firebase Hosting for:

1. Pull requests: preview channels
2. Pushes to `main`: live channel

Two Hosting sites are deployed from this one Firebase project:

- **`spa` target** → site `job-hunt-tracker-d9d65` → `dist/spa` (plain SPA build) → https://job-hunt-tracker-d9d65.web.app
- **`pwa` target** → site `job-hunt-tracker-pwa` → `dist/pwa` (installable PWA build, `quasar build -m pwa`) → https://job-hunt-tracker-pwa.web.app

`npm run build:all` builds both. `firebase deploy --only hosting` deploys both targets in one command (target mapping lives in `.firebaserc`).

### Project Defaults

1. Firebase project ID: `job-hunt-tracker-d9d65`
2. SPA rewrite: all routes to `/index.html` (both targets)

### One-Time Setup

1. Create (or confirm) the Firebase project `job-hunt-tracker-d9d65`.
2. In Firebase Hosting, ensure sites `job-hunt-tracker-d9d65` and `job-hunt-tracker-pwa` exist.
3. Create a GitHub Actions service account secret named `FIREBASE_SERVICE_ACCOUNT_JOB_HUNT_TRACKER`.
4. Add that secret in GitHub repository settings:
   `Settings > Secrets and variables > Actions > New repository secret`.

### Custom Domain (`tracker.lizbrown5280.com`)

The PWA site (`job-hunt-tracker-pwa`) is intended to carry this custom domain, so the installable app lives at a branded URL while the plain SPA keeps its default `.web.app` address.

1. In Firebase Hosting, on the `job-hunt-tracker-pwa` site, add custom domain `tracker.lizbrown5280.com`.
2. Firebase will provide DNS records.
3. In GoDaddy DNS, add the exact records provided by Firebase.
4. Wait for Firebase domain verification and SSL certificate provisioning.
5. In Authentication → Settings → Authorized domains, confirm `tracker.lizbrown5280.com` was added automatically (add manually if not).

### Workflow Files

1. `.firebaserc`
2. `firebase.json`
3. `.github/workflows/firebase-hosting.yml`

## Feature Backlog Workflow

Use GitHub Issues as the source of truth for feature planning and execution.

1. Substantial work: `.github/ISSUE_TEMPLATE/feature-request.md`
2. Small scoped work: `.github/ISSUE_TEMPLATE/small-enhancement.md`

Recommended labels:

1. `feature`
2. `enhancement`
3. `priority-high`, `priority-medium`, `priority-low`
4. `area-applications`, `area-companies`, `area-positions`, `area-recruiters`

## Deferred Smoke Workflow

When reliability smoke is intentionally skipped for velocity, log it immediately.

1. Create a tracking issue with `.github/ISSUE_TEMPLATE/deferred-smoke-check.md`
2. Add or update a local entry in `docs/deferred-smoke-log.md`
3. Before release, close all pending deferred smoke entries

### Local Manual Deploy (optional)

```bash
npm run build:all
npx firebase-tools deploy --only hosting --project job-hunt-tracker-d9d65
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).
