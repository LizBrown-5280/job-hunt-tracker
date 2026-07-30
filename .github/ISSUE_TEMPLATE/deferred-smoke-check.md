---
name: Deferred smoke check
about: Track smoke checks intentionally skipped for later execution
title: 'Deferred Smoke: '
labels: ['reliability', 'debt']
assignees: ''
---

## Why deferred

- Deadline or credit reason:
- Date deferred:

## Scope

- Feature or slice name:
- Commit SHA(s):
- Files or areas touched:

## Risk

- [ ] Low
- [ ] Medium
- [ ] High
- Notes:

## Smoke commands to run later

- [ ] `pnpm typecheck`
- [ ] `SMOKE_PORT=9020 pnpm smoke:reliability`

## Completion checklist

- [ ] Smoke run completed
- [ ] Failures triaged and fixed
- [ ] Related feature issue updated
- [ ] This issue can be closed
