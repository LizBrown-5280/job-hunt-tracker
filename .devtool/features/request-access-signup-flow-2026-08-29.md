---
id: 'request-access-signup-flow-2026-08-29'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'foundation-architecture-epic-2026-08-24'
dueDate: null
created: '2026-08-29T00:00:00.000Z'
modified: '2026-08-29T00:00:00.000Z'
completedAt: null
labels: ['feature', 'auth', 'access-control']
order: 'aZ'
---

# FEATURE: Request-Access Sign-Up Flow

Instead of open self-serve sign-up, let a visitor submit a "request access" form (name + email + optional message) that emails the admin (you) for approval, rather than granting access automatically.

## Acceptance Criteria

- [ ] Add a "Request Access" link/form on the login page for users who aren't yet approved
- [ ] Capture name, email, and optional message on submission
- [ ] Send an email notification to the admin with the request details (e.g. via a Firebase Cloud Function + email provider, or a simple form-to-email service)
- [ ] Store pending requests somewhere reviewable (e.g. a Firestore `accessRequests` collection) so they aren't lost if an email is missed
- [ ] Provide a simple way for the admin to approve a request (e.g. adding the email to the `authorizedUsers` allowlist from the Firebase console, or a small admin-only approve button/page)
- [ ] Notify the requester once approved (manual email is fine for v1; automated is a stretch goal)
- [ ] Rate-limit or otherwise guard the request form against spam/abuse

## Notes

Depends on [phase1-invite-only-access-gate-2026-08-29](phase1-invite-only-access-gate-2026-08-29.md) existing first, since this flow feeds into that allowlist.

v1 can be manual on the admin side (you personally add approved emails after reviewing requests) — full self-service approval tooling is a later enhancement if needed.
