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

### Project Defaults

1. Firebase project ID: `job-hunt-tracker`
2. Hosting site ID: `job-hunt-tracker`
3. Hosting public directory: `dist/spa`
4. SPA rewrite: all routes to `/index.html`

### One-Time Setup

1. Create (or confirm) the Firebase project `job-hunt-tracker`.
2. In Firebase Hosting, ensure site `job-hunt-tracker` exists.
3. Create a GitHub Actions service account secret named `FIREBASE_SERVICE_ACCOUNT_JOB_HUNT_TRACKER`.
4. Add that secret in GitHub repository settings:
	`Settings > Secrets and variables > Actions > New repository secret`.

### Custom Domain (`tracker.lizbrown5280.com`)

1. In Firebase Hosting, add custom domain `tracker.lizbrown5280.com`.
2. Firebase will provide DNS records.
3. In GoDaddy DNS, add the exact records provided by Firebase.
4. Wait for Firebase domain verification and SSL certificate provisioning.

### Workflow Files

1. `.firebaserc`
2. `firebase.json`
3. `.github/workflows/firebase-hosting.yml`

### Local Manual Deploy (optional)

```bash
npm run build
npx firebase-tools deploy --only hosting --project job-hunt-tracker
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-file).
