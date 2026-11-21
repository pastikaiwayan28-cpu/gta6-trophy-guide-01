# Leonida Trophy Atlas

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/pastikaiwayan28-cpu/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/pastikaiwayan28-cpu/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the **55 PlayStation 5 trophies of Grand Theft Auto VI**, built for the [make.fun bounty “Build the best GTA 6 trophy guide”](https://make.fun/bounty/gta6-trophy-guide-01).

## What it covers

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — each with its official name, description and grade exactly as PlayStation publishes them.
- **A guide for every trophy, in our own words, with its source cited beside it.** A cited guide beats an uncited one, and no source text is copied.
- **Roadmap to platinum** in four phases: story, open-world feats, collectibles, then the 100% cleanup.
- **The one missable trophy flagged everywhere:** Positive Mental Attitude (bronze) — meditate at the Chapter 1 balcony spot before Chapter 1 ends, or it is gone for this playthrough.
- **Five trophies honestly marked unconfirmed** — In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin. No verified method exists for them yet, so their guides say so instead of guessing.

## Tracker

- Checklist saved in your browser (localStorage) — nothing leaves your device.
- Export your checklist as JSON, import it on another device.
- Filters by kind (story / missable / collectibles / activities / online) and by grade, plus text search.
- Spoiler setting: hidden story trophies stay masked until you earn them.
- Progress bar and counts, earned-only and unconfirmed-only views.

## Use it offline

The guide is plain static files under `app/` and fetches nothing from the network.

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Everything — data, styles, logic — loads from your own files.

## Hand it in

`main.ts` at the repository root validates the trophy data first (55 trophies, non-blank names, descriptions, guides and sources, the exact grade counts, 28 hidden, the 5 unconfirmed, the single missable trophy) and fails hard if anything is wrong. Then it copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

Official trophy names, descriptions and grades: PlayStation official trophy list. Guides draw on the official descriptions plus GTA Wiki (gta.fandom.com), PSNProfiles and PowerPyx, cited per trophy. Fan-made guide — not affiliated with Rockstar Games, Take-Two Interactive or PlayStation, and no Rockstar artwork or logos are used anywhere.
