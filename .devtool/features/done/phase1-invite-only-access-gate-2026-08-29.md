---
id: 'phase1-invite-only-access-gate-2026-08-29'
status: 'done'
priority: 'high'
assignee: null
epic: 'foundation-architecture-epic-2026-08-24'
dueDate: null
created: '2026-08-29T00:00:00.000Z'
modified: '2026-08-29T20:00:00.000Z'
completedAt: '2026-08-29T19:15:00.000Z'
labels: ['feature', 'auth', 'access-control']
order: 'a0'
---

# FEATURE: Phase 1 - Invite-Only Access Gate

Gate the deployed PWA behind Firebase Authentication so only approved people (you and anyone you explicitly allow) can reach the app. This is a smaller, scoped-down slice of gh-2 (Authentication) focused only on access control, not multi-user data sync.

## Acceptance Criteria

- [x] Enable Firebase Authentication with both Google Sign-In and Email/Password providers (both are free on the Spark plan)
- [x] Build a simple login page (Google button + email/password form)
- [x] Add an allowlist check after sign-in: Firestore collection `authorizedUsers` (doc id = lowercased email), managed from the Firebase console
- [x] Add a Vue Router `beforeEach` guard that redirects to `/login` unless the user is signed in AND passes the allowlist check
- [x] Show a clear "access pending/denied" message for signed-in users who are not on the allowlist
- [x] Display signed-in user info (email, logout button) somewhere in the layout (e.g. sidebar/header)
- [x] Add basic error handling for sign-in failures
- [x] Document how to add/remove an approved user (console steps) in the ticket or a short note

## Notes

Shipped and verified working end-to-end on the live deployed app (Google sign-in via popup, redirected into the dashboard after approval; sign-out redirects back to `/login`).

Firebase app registered (`job-hunt-tracker-d9d65`, Web app), `firebase` SDK installed, boot file (`src/boot/firebase.ts`), auth store (`src/stores/auth.ts`), login page (`src/pages/LoginPage.vue`), router guard (`src/router/index.ts`), header user info/logout (`src/layouts/MainLayout.vue`), and Firestore rules (`firestore.rules`) restricting each user to reading only their own `authorizedUsers` doc.

Google sign-in uses `signInWithPopup` (final choice, after testing `signInWithRedirect` too). Notes from debugging:

- `signInWithRedirect` repeatedly lost the pending sign-in result across the full-page round trip to Google and back (`onAuthStateChanged` fired `null`), both on `localhost` and the deployed `.web.app` domain, and in Incognito. Root cause not fully isolated; abandoned in favor of popup.
- Popup mode logs benign `Cross-Origin-Opener-Policy policy would block the window.closed call` console errors during sign-in — this is Firebase's own popup-closed polling being blocked by the browser's COOP defaults; it does not affect functionality (sign-in still completes successfully).
- The router guard must call `authStore.init()` for every route including `/login` (not skip it), since that's where the pending auth state actually gets consumed/consulted on first load.
- The login page has a `watch(() => authStore.status, ...)` that pushes to `/` once authorized, since sign-in completing doesn't itself trigger a route navigation.

### How to approve a new user

1. Firebase Console → Authentication → Users → confirm they've signed in at least once (creates their auth record), or have them attempt sign-in first.
2. Firebase Console → Firestore Database → Data → `authorizedUsers` collection → **Add document**.
3. Set the Document ID to their **lowercased email** (e.g. `someone@example.com`). Any field/value satisfies the form — only the document's existence is checked.
4. To revoke access, delete their document from `authorizedUsers`.

Related to [gh-2-feature-authentication-2026-08-24](gh-2-feature-authentication-2026-08-24.md), which covers the broader multi-user/cloud-sync auth system. This ticket intentionally does NOT include: password reset flow, per-user data sync, or account deletion — those remain in gh-2's scope for later.

Since this is a client-side SPA on Firebase Hosting, the gate is enforced in the Vue app/router, not at the Hosting layer.
