---
id: 'implement-browser-notifications-for-reminders-2026-08-24'
status: 'backlog'
priority: 'medium'
assignee: null
epic: 'data-features-epic-2026-08-24'
dueDate: null
created: '2026-08-24T17:30:00.000Z'
modified: '2026-08-24T17:30:00.000Z'
completedAt: null
labels: ['feature', 'notifications', 'v1-local-only']
order: 'a9'
---

# Implement Browser Notifications for Reminders

Add local browser notifications for next-action due dates and interview reminders (V1 is local-only, no backend push service).

## Acceptance Criteria

- [ ] Request browser notification permission on first launch
- [ ] Set up notification triggers for next-action due dates
- [ ] Set up notification triggers for upcoming interviews (e.g., 1 hour before)
- [ ] Test notification delivery in dev/prod
- [ ] Support notification dismiss/snooze
- [ ] Log notification history (optional)

## Notes

V1 uses browser Notification API only (local). No backend service. Future: could add Pub/Sub or Firebase Cloud Messaging for push.
