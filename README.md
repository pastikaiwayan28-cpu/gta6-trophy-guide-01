[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/pastikaiwayan28-cpu/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/pastikaiwayan28-cpu/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Trophy Atlas — GTA 6 Trophy Guide + Tracker

The best offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

- **Every trophy**: official name, description and grade as PlayStation publishes them, plus a guide in our own words — what to do, where and how, when it can be missed — with its sources cited beside it.
- **Roadmap to the platinum**: three steps (story → 100% checklist → cleanup), with the one missable trophy flagged.
- **Tracker**: checklist saved in the browser (localStorage), export/import/reset, filters by kind and grade, search, hide-earned, and a spoiler setting that hides story trophies until they are earned.
- **Offline**: static files under `app/`, no build step, no network request at run time. Open `app/index.html` in desktop Chrome, or serve with `node serve.ts` (http://localhost:8080).

## Layout

- `app/` — the guide (index.html, app.js, style.css, data/trophies.json)
- `screenshots/` — 4 screenshots of the guide (the first is the cover)
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`
- `vendor/makefun-frontend.ts` — the kit's library, unchanged
- `shots.json` — which views the screenshots were taken of
