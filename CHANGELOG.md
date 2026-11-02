# Changelog

## Unreleased

- Joy × Responsibility view (⚖): two independent scores per task (attraction, responsibility; 0–100 or null with confidence and reason) from a local Ollama model chosen in the app, four categories plus Unrated, per-section sorting, configurable thresholds, evaluation only on explicit click; stored separately from impact/effort
- Server: `/api/ai/models` and `/api/ai/joy` bridge to Ollama (no mixed content or CORS in the browser)
- Dates are shown as ISO 8601 (YYYY-MM-DD) and times in 24-hour format (HH:MM) everywhere: due dates on cards, done-column day headers, task "created" date, archive and chat timestamps
- Due date in the task dialog is entered as YYYY-MM-DD plus a 24-hour time, with a calendar and a round clock-dial time picker that pop up from the fields, instead of the browser's locale-dependent date-time field

## 1.0.0

First public release.

- Kanban with pomodoro, Pareto prioritisation and analytics in one HTML file
- Live sync through a personal Cloudflare Worker, invite links and presence
- Optional SaaS Worker with accounts, email verification and an admin console
- Video calls (peer to peer WebRTC) and per board chat
