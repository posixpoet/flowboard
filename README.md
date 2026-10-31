# FlowBoard

> **This is `flowboard-personal`**, a personal copy of [anasachouri/flowboard](https://github.com/anasachouri/flowboard) (via [posixpoet/flowboard](https://github.com/posixpoet/flowboard)). Everything below the next section is the upstream README and still applies. What this copy adds:
>
> - **🧭 Joy × Responsibility**: an AI view that estimates, for each open task, how engaging it looks and what happens if it is neglected, using your own Ollama server. See [the section below](#joy--responsibility-personal-addition).
> - **⏸ Pause / ▶ Resume** on tasks with an optional "where I left off" note.
> - **Recent progress** built from completions, column moves and logged time. Completions stay on record when a task is reopened.
> - ISO 8601 dates and a 24-hour time picker, and due badges counting days left (the open upstream PR `iso-dates-24h-time`).
> - `flowboard-server.js` accepts `PORT=…` when 8765 is taken.
>
> **Keeping up with upstream:** `git remote add upstream https://github.com/anasachouri/flowboard.git`, then `git fetch upstream && git merge upstream/main`. The additions are concentrated in a few clearly marked blocks of `flowboard.html`, so merges stay small.

A kanban board that fits in one file. Drag tasks between columns, run a pomodoro timer on them, see which tasks are worth your time, work on the same board with a friend, talk to them over video and chat, all inside the board. No account to create, no software to install, nothing to pay.

**[Try it in your browser](https://anasachouri.github.io/flowboard/)** (nothing is uploaded, it runs entirely on your device) or read on to host your own for free.

![FlowBoard: a sprint board with the chat open](docs/board.png)

Made by **Dr Anas Achouri**, materials engineer with a PhD and founder of a UK deep-tech startup. I built FlowBoard to run my own sprints and it grew from there. Say hello on [LinkedIn](https://www.linkedin.com/in/anas-achouri/).

## Who this is for

Anyone who wants a simple, private task board. You do not need to be a programmer. If you can download a file and double click it, you can use FlowBoard. If you can follow a five minute setup once, you can also use it online from your phone and share it with a friend.

## What it does

- Boards with columns and rows (swimlanes). Drag tasks around, or use the small arrow on each task to send it to another column.
- Each task has notes, subtasks, labels, a due date, attachments, a time estimate and a repeat option.
- A pomodoro timer. Press play on a task and the time you spend is logged to it.
- A Pareto view that tells you which tasks give the most value for the least effort. It works out of the box, learns from quick "which matters more" questions, and can ask an AI to rank your tasks against a goal you type.
- Charts: how work flows through your columns, how many tasks you finish per day, where your hours went.
- Works on phones. Swipe between columns, tap and hold a task to drag it.
- Live sync between your laptop and phone when you host it online (see below).
- Invite links so a friend can see and edit one board without seeing your others.
- Video calls and a chat on every shared board. Peer to peer, nothing is recorded.
- Dark mode, search, filters, undo, keyboard shortcuts, backups.

## Three ways to use it

### 1. Just open the file (no setup at all)

1. Download this repository (green **Code** button on GitHub, then **Download ZIP**) and unzip it.
2. Double click `flowboard.html`. It opens in your browser and that is the whole app.
3. Everything you type is saved inside that browser on that computer. Use the menu (⋯) then **Export backup** now and then to keep a copy.

Good for: one person, one computer. Not good for: using it on your phone as well, or sharing with anyone.

### 2. Put it online for free (about five minutes, once)

This gives you a private web address for your board that works on every device and syncs between them. It runs on Cloudflare's free plan, which is enough for one person or a small team. You pay nothing and do not need a credit card.

You need two free things first:

1. **A Cloudflare account.** Sign up at https://dash.cloudflare.com/sign-up with your email. Nothing else to configure.
2. **Node.js.** This is a small program that the deploy script uses. Download it from https://nodejs.org (choose the LTS version), run the installer, accept the defaults.

Then, on Windows:

1. Download and unzip this repository as in option 1.
2. Double click `deploy-online.bat`. A black window opens. The first time, your browser opens and asks you to allow Cloudflare: click **Allow**. Wait for the window to print a line that looks like `https://flowboard.yourname.workers.dev`. That is your board's address. Write it down.
3. Double click `set-key.bat`. Type a strong key (think of it as the password for your board), twice. Your typing is hidden on purpose.
4. Open your address with the key at the end, like this: `https://flowboard.yourname.workers.dev/#key=THE-KEY-YOU-CHOSE`. Bookmark that link on each device. On a phone, use "Add to Home Screen" and it behaves like an app.

On a Mac or Linux, open a terminal in the folder and run these three commands instead of the two scripts:

```
mkdir -p public && cp flowboard.html public/index.html
npx wrangler@latest deploy
npx wrangler@latest secret put BOARD_KEY
```

The last command asks you for the key.

To update FlowBoard later, download the new version and run `deploy-online.bat` again. Your tasks are stored on Cloudflare, not in the file, so they are kept.

### 3. Run a small service for friends

The `saas` folder is a second, separate version with email and password accounts, where each person has their own boards and can share them. It is what you would use for a small team or a club. It needs one more free account (Resend, for sending the verification emails). The steps are in `saas/README.md`.

## Sharing a board with a friend (option 2)

1. Open the board you want to share.
2. Menu ⋯ then **Board members** then **Invite links**. Type their name and click **Create invite link**.
3. Send them the link. It opens that one board only. You can revoke it any time from the same place.

Never send your own key to anyone. The invite link is the safe way.

## Calls and chat

On any board that is online (option 2 or 3), the header has two buttons:

- 📹 opens the call window. Click **Start call** and everyone who has the board open gets a ring and a **Join** button. There are controls for mute, camera, screen share and leave. The 👥 tab lists who is on the board and gives you a **Copy call link** to send to someone who is not looking at the board right now.
- 💬 is a chat for that board. Paste links, leave notes. The last 150 messages are kept.

Sound and video go directly between your browsers. The server only helps the two browsers find each other. Nothing is recorded or stored. If a call stays on "connecting", one of you is on a strict office network. The fix is in the section for the person who set the board up, below.

## The Pareto view

Click 🎯 in the header. Tasks are listed from best value to worst. "Value" is impact divided by effort. You can set both numbers on each task, but you do not have to:

- Effort is taken from the time estimate if you gave one, or from how long similar finished tasks took.
- Impact is raised automatically when a deadline is close.
- **⚔ Duel** shows you two tasks and asks which matters more. Answer six to ten times and the ranking follows your judgement.
- **✨ AI rank** sends your open task titles to an AI model on Cloudflare and scores them against the goal you typed at the top. It only runs when you click it and keeps nothing. Scores you typed yourself are never overwritten.

The best 20% get a small 🎯 on their card on the board.

![The Pareto view with a goal, duel and AI rank](docs/pareto.png)

## Joy × Responsibility (personal addition)

Click 🧭 in the header. Each open task gets two separate estimates from a model on **your own Ollama server**:

- **Attraction (0 to 100):** how engaging the task is likely to be, based on curiosity, challenge, problem-solving and room to explore.
- **Responsibility (0 to 100):** what neglecting it would cost, based on stated obligations, real deadlines and their consequences, risks, and people or tasks that depend on it.

The two are never combined into one number. Either can be *unknown* (`null`) when the task says too little. An unknown score is never treated as zero. Each score has a confidence level (low / medium / high) and a one-sentence reason. Click **ⓘ why** on a card to see them.

Tasks fall into four groups (the thresholds default to 50 and can be changed in ⚙ Settings, a score at or above the threshold counts as high):

| | Lower attraction | Higher attraction |
|---|---|---|
| **Higher responsibility** | Responsibilities | Engaging & Important |
| **Lower responsibility** | Low signal | Exploration |

Tasks not evaluated yet, or with an unknown score, are listed separately under the grid. The Kanban board always shows every task, rated or not. The board's search and filters apply to the grid.

Below the grid:

- **Responsibilities** lists every open task that is high on responsibility and low on attraction. Each row shows both scores, the due date, the last activity and an Open / Resume button. It shows; it never asks for anything: no pop-ups, reminders, warnings, escalation or nudges, however long a task sits there. Collapse it and it stays collapsed on that device.
- **Recent progress** shows completions (last 30 days), column moves (last 14 days) and logged time (last 7 days). It is built only from what the board already records. Nothing to fill in, and no score.

### What is sent, and when

In the browser, nothing is sent until you click **✨ Evaluate** on a task, or **✨ Evaluate unrated**. The optional [nightly job](#nightly-evaluation-optional) evaluates on the server instead. The bulk button says how many tasks it will send and asks you to confirm. Each request contains **one** task: today's date, title, notes (first 2000 characters), label names, due date, subtask texts, and the impact rating if you set one yourself. It never includes other tasks, the creation date or the column. Requests run one at a time, show progress and can be cancelled. Every finished evaluation is saved straight away, and a failed request does not undo the others.

The model gets a fixed system prompt and the task as JSON marked as untrusted data, with `stream: false`, `temperature: 0.2` and a JSON schema in `format`. The answer is validated strictly: scores must be whole numbers from 0 to 100 or `null`, confidence must be low, medium or high. An answer that breaks these rules is rejected as a whole and nothing is stored. Values are never clamped or guessed.

### Stale scores, and what the scores never touch

When the title, notes, labels, subtasks or due date change, the scores stay visible but are drawn dashed and marked "changed". Moving a task, ticking a subtask or pausing does not count as a change. **Evaluate unrated** sends tasks that were never evaluated plus changed ones, and skips the rest.

The scores never change your impact/effort, the Pareto ranking or the 🎯 marks. Scores and reasons are stored on the task (`task.motivation`), so they sync, back up and restore with the board. The Ollama address, the model choice and collapsed sections are kept per browser (`localStorage`).

### Setting it up with your Ollama server

1. **Open FlowBoard from an origin Ollama accepts.** Ollama only answers browsers whose page origin is allowed. By default that is `http://localhost` and `http://127.0.0.1` on any port, plus `file://`.
   - **Chrome / Edge, double-clicked `flowboard.html`:** works. These browsers send `Origin: file://`.
   - **Firefox, double-clicked file:** refused. Firefox sends `Origin: null`. Don't add `null` to `OLLAMA_ORIGINS`: any sandboxed page could then use your Ollama.
   - **Any browser via the local server:** works:

     ```
     node flowboard-server.js              # or start-flowboard.bat on Windows
     PORT=8766 node flowboard-server.js    # if port 8765 is already taken
     ```

     Open the `http://localhost:…/#key=…` address it prints.

2. **⚙ Settings → Joy × Responsibility (Ollama):** set the address. It is prefilled with `http://ovas01.xtremnet.de:7869`, or with the HTTPS proxy `https://ovas01.xtremnet.de:7870` when the board itself is served over HTTPS. Type the model name (for example `qwen3.5:9b`) and press **Save**. **↻ Load models** is optional: it only offers the server's model names as suggestions. The list comes from the server's `/api/tags`. Embedding-only models are left out. FlowBoard never switches the model by itself: if the saved model disappears from the server, it says so and asks you to choose again.

3. **🧭 → ✨ Evaluate unrated → Start.** The first request can take a while because the model has to load (timeout: 3 minutes per task). FlowBoard always sends `think: false`: reasoning models would otherwise think for minutes, and models without thinking ignore it. Two scores don't need a long hidden monologue, and it saves minutes per task.

**Other origins** (a phone on the Wi-Fi at `http://192.168.x.x:8765`, your hosted board) must be added to `OLLAMA_ORIGINS` on the machine running Ollama, comma separated, for example:

```
# systemd:  sudo systemctl edit ollama   then add
[Service]
Environment="OLLAMA_ORIGINS=http://192.168.0.20:8765,https://board.example.com"

# docker:   docker run … -e OLLAMA_ORIGINS="http://192.168.0.20:8765,https://board.example.com" ollama/ollama
```

Restart Ollama afterwards. Avoid `*` and `null`: they let any web page you visit use your Ollama.

**FlowBoard served over HTTPS** (the Cloudflare deploy or any `https://` address) cannot call a plain `http://` Ollama. Browsers block that as mixed content, and FlowBoard says so instead of trying. Put Ollama behind an HTTPS reverse proxy and enter the `https://` address in Settings. With Caddy, which already runs on the Ollama host in this setup, a separate port is enough:

```
# Caddyfile on the Ollama host: HTTPS on port 7870 in front of Ollama on 7869
ovas01.xtremnet.de:7870 {
    reverse_proxy 127.0.0.1:7869
}
```

Then add the board's origin (for example `https://flowboard.yourname.workers.dev`) to `OLLAMA_ORIGINS`: the proxy passes the `Origin` header through and Ollama still checks it. Keep the proxy reachable only on your own network. Ollama has no login of its own. When an HTTPS page on the internet calls an address on your local network, recent Chrome versions ask once for permission to access local network devices. Allow it for your board. This reverse proxy is not part of this repository and does not exist yet; set it up only if you use the HTTPS board.

Without Ollama, or offline, everything else works as before. The 🧭 view still shows the stored scores, and Evaluate reports what went wrong (server unreachable, origin refused, mixed content, model missing, invalid answer).

### Nightly evaluation (optional)

`tools/jr-nightly.mjs` evaluates by itself at night, so the scores are ready in the morning. It picks open tasks that have no scores yet or whose content changed since they were scored, sends them one at a time, and writes the results to the board. Browsers that are open pick them up like any other change.

- **When:** run it from cron every hour. It only works inside the window (default **00:00–06:00 Europe/Zurich**, also across DST changes) and stops starting new requests at the end of it. Outside the window it exits immediately and silently. A lock file keeps two runs from overlapping.
- **Same results as the page:** it loads the prompt, schema, validation and change detection from the board's own `flowboard.html`, so nightly scores look exactly like ones from **✨ Evaluate** and are not shown as "changed". It sends the same data per task. Answers that fail validation are skipped. A connection or model error ends that night's run.
- **Safe writes:** before each write it loads the current board, changes only `motivation` and `updatedAt` on that one task, and reads the result back. If a browser saved at the same moment, it retries. Edits made at night in a browser are kept.
- **Where it runs:** on a machine that reaches both the board and Ollama. It needs Node 18+ and nothing else. It uses the board's master key and plain HTTP to Ollama, so no CORS, certificates or browser are involved.

```
# crontab -e   (on a machine that reaches both)
5 * * * *  FB_URL=https://fb.prayforsnow.ch FB_KEY_FILE=$HOME/.flowboard-key OLLAMA=http://ovas01.xtremnet.de:7869 JR_MODEL=qwen3.5:9b node /path/to/tools/jr-nightly.mjs >> $HOME/jr-nightly.log 2>&1
```

Check first with `--dry-run`, which lists what would be evaluated and sends nothing. `--now` runs once outside the window. `JR_TZ`, `JR_FROM`, `JR_TO` change the window.

### Pause and resume

In a task, **⏸ Pause** banks any running timer time on the task and marks it paused. The pomodoro itself keeps running, so you can attach it to something else. The card shows ⏸, and the optional **Where I left off** note appears in its tooltip and in the Responsibilities list. Opening the task again shows the note and a **▶ Resume** button. Starting its timer or moving it also resumes it. Nothing has to be filled in to switch tasks. The pomodoro stays optional.

## Your data

- With option 1, everything stays in your browser.
- With option 2, your tasks live in your own Cloudflare account. Nobody else, including the author of FlowBoard, can see them.
- Attachments never leave the device they were added on.
- Menu ⋯ then **Export backup** saves everything as one file. **Import backup** restores it, also on another computer.

## For the person who set up the board (technical)

- **Strict networks and calls.** Add a TURN relay: in the Cloudflare dashboard open Realtime, then TURN, create a key, then in the folder run `npx wrangler secret put TURN_KEY_ID` and `npx wrangler secret put TURN_KEY_API_TOKEN`. No redeploy needed.
- **AI rank.** Uses Workers AI through the `ai` binding already present in `wrangler.jsonc`. The free allowance is 10,000 neurons a day, and one ranking of 40 tasks costs about 200. To use a different model add an `AI_MODEL` variable in `wrangler.jsonc`. To remove the feature delete the `ai` line.
- **Local network sync without Cloudflare.** `start-flowboard.bat` runs a tiny server on your laptop so your phone can sync over the same Wi-Fi. See the help inside the app.
- **How it is built.** One HTML file, no framework, no build step. Board data in a Cloudflare Durable Object. The architecture is described in `flowboard-how-it-works.md`.

## Licence

MIT. Use it, change it, share it. See `LICENSE`.

## Contributing

Issues and pull requests are welcome. Please keep the single file idea: no build step, no runtime dependencies, nothing that would stop `flowboard.html` from working on its own when double clicked.
