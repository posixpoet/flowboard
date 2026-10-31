# Changelog

## Unreleased

- 🧭 Joy × Responsibility view: per-task attraction and responsibility estimates (0–100 or unknown, with confidence and reasons) from your own Ollama server, four quadrants with configurable thresholds, a passive Responsibilities list and Recent progress. Evaluation only on request, one task per call, answers validated before they are stored, stale scores marked when a task changes
- ⏸ Pause / ▶ Resume on tasks, with an optional "where I left off" note
- Tasks record their last activity and column changes, so a completion stays on record when the task is reopened
- `flowboard-server.js` port can be set with `PORT=…`

- Dates are shown as ISO 8601 (YYYY-MM-DD) and times in 24-hour format (HH:MM) everywhere: due dates on cards, done-column day headers, task "created" date, archive and chat timestamps
- Due date in the task dialog is entered as YYYY-MM-DD plus a 24-hour time, with a calendar and a round clock-dial time picker that pop up from the fields, instead of the browser's locale-dependent date-time field

## 1.0.0

First public release.

- Kanban with pomodoro, Pareto prioritisation and analytics in one HTML file
- Live sync through a personal Cloudflare Worker, invite links and presence
- Optional SaaS Worker with accounts, email verification and an admin console
- Video calls (peer to peer WebRTC) and per board chat
