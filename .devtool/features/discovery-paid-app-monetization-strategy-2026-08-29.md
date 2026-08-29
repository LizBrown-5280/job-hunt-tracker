---
id: 'discovery-paid-app-monetization-strategy-2026-08-29'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'foundation-architecture-epic-2026-08-24'
dueDate: null
created: '2026-08-29T00:00:00.000Z'
modified: '2026-08-29T00:00:00.000Z'
completedAt: null
labels: ['discovery', 'monetization', 'auth']
order: 'aW'
---

# DISCOVERY: Paid App Monetization Strategy

Research what it would take to offer this app as a paid product (free tier vs. paid tier), what's required to publish it to app stores, and how that intersects with the current Firebase usage and auth work.

## Acceptance Criteria

- [ ] Define a candidate free tier: which features stay free (e.g. local-first tracking, core CRUD)
- [ ] Define a candidate paid tier: which features are gated (e.g. cloud sync, multi-device, backups, AI features)
- [ ] Document billing/subscription options (Stripe, RevenueCat, native store billing) and rough integration effort
- [ ] Research app store requirements for each target platform (iOS App Store, Google Play, or web-only/PWA distribution) — developer accounts, review guidelines, in-app purchase rules
- [ ] Assess how paid tiers interact with planned Authentication work (gh-2) — account/entitlement model
- [ ] Assess Firebase Spark (free) plan limits vs. Blaze (pay-as-you-go) plan given expected auth + sync + storage usage; identify the point at which upgrade is needed
- [ ] Summarize findings with a recommendation (e.g. freemium model, one-time purchase, subscription) and rough cost estimate at small scale

## Notes

This is a research/discovery ticket, not implementation. Output should be a written summary (in this ticket or a linked doc) that informs whether/how to scope paid tiers alongside the Authentication feature.
