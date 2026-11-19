// Leonida Trophy Atlas: tracker for the 55 GTA VI trophies.
// Progress lives in localStorage (by trophy id) and can be exported to a
// file and imported back. Filters: kind (story / missable / collectibles /
// activities), grade, text search, hide-earned. The spoiler setting hides
// the name, description and guide of story trophies until they are earned.
// Deep links for screenshots: ?view=roadmap, ?trophy=<id> opens that
// trophy's guide, ?filter=<kind>, ?grade=<grade>, ?spoilers=on, ?hide=earned.

const KEY = 'gta6-trophy-atlas-v2';
const grid = document.getElementById('grid');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hideEarned');
const countLine = document.getElementById('countLine');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeChips = document.getElementById('gradeChips');

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
const openGuides = new Set();
const params = new URLSearchParams(location.search);

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(g) {
  return g === 'platinum' ? 'Platinum' : g[0].toUpperCase() + g.slice(1);
}

function kindLabel(k) {
  if (k === 'story') return 'Story';
  if (k === 'missable') return 'Missable';
  if (k === 'collectibles') return 'Collectibles';
  if (k === 'activities') return 'Activities';
  return 'Platinum';
}

function isSpoiled(t) {
  return spoilersEl.checked && t.kinds.includes('story') && !earned.has(t.id);
}

function matches(t) {
  if (kindEl.value !== 'all' && !t.kinds.includes(kindEl.value)) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kinds.join(' ')}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  progressText.textContent = `${done} of ${total} earned`;
  const pct = Math.round((done / total) * 100);
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  gradeChips.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = trophies.filter((t) => t.grade === g);
    const got = all.filter((t) => earned.has(t.id)).length;
    const chip = document.createElement('span');
    chip.className = `gchip ${g}`;
    chip.textContent = `${gradeLabel(g)} ${got}/${all.length}`;
    gradeChips.append(chip);
  }
}

function buildCard(t) {
  const card = document.createElement('article');
  card.className = `card grade-${t.grade}${earned.has(t.id) ? ' earned' : ''}${t.missable ? ' missable-card' : ''}`;
  card.id = `trophy-${t.id}`;

  const head = document.createElement('header');
  const badge = document.createElement('span');
  badge.className = `badge ${t.grade}`;
  badge.textContent = t.grade.toUpperCase();
  head.append(badge);
  const name = document.createElement('h3');
  name.textContent = isSpoiled(t) ? 'Hidden story trophy' : t.name;
  head.append(name);
  const box = document.createElement('label');
  box.className = 'earned-check';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = earned.has(t.id);
  input.setAttribute('aria-label', `Mark ${t.name} as earned`);
  input.addEventListener('change', () => {
    if (input.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    render();
  });
  box.append(input, document.createTextNode('Earned'));
  head.append(box);
  card.append(head);

  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = isSpoiled(t)
    ? 'Earn this story trophy to reveal its name, description and guide.'
    : t.description;
  card.append(desc);

  const meta = document.createElement('div');
  meta.className = 'meta';
  if (t.missable) {
    const m = document.createElement('span');
    m.className = 'chip missable';
    m.textContent = 'MISSABLE';
    meta.append(m);
  }
  if (t.hidden) {
    const h = document.createElement('span');
    h.className = 'chip hidden';
    h.textContent = 'Hidden';
    meta.append(h);
  }
  for (const k of t.kinds) {
    if (k === 'missable' && t.missable) continue; // the red MISSABLE chip already says it
    const c = document.createElement('span');
    c.className = 'chip';
    c.textContent = kindLabel(k);
    meta.append(c);
  }
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'chip count';
    c.textContent = t.count;
    meta.append(c);
  }
  const stage = document.createElement('span');
  stage.className = 'chip stage';
  stage.textContent = `Roadmap step ${t.stage}`;
  meta.append(stage);
  card.append(meta);

  if (!isSpoiled(t)) {
    const open = openGuides.has(t.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'guide-toggle';
    btn.textContent = open ? 'Hide guide' : 'Guide & sources';
    btn.setAttribute('aria-expanded', String(open));
    const guide = document.createElement('div');
    guide.className = 'guide';
    guide.hidden = !open;
    const p = document.createElement('p');
    p.textContent = t.guide;
    guide.append(p);
    const src = document.createElement('p');
    src.className = 'sources';
    src.append(document.createTextNode('Sources: '));
    t.sources.forEach((s, i) => {
      if (i > 0) src.append(document.createTextNode(' · '));
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.rel = 'noopener';
        src.append(a);
      } else {
        src.append(document.createTextNode(s.name));
      }
    });
    guide.append(src);
    btn.addEventListener('click', () => {
      if (openGuides.has(t.id)) openGuides.delete(t.id);
      else openGuides.add(t.id);
      render();
    });
    card.append(btn, guide);
  }
  return card;
}

function render() {
  renderProgress();
  const shown = trophies.filter(matches);
  countLine.textContent = shown.length === trophies.length
    ? `${trophies.length} trophies`
    : `Showing ${shown.length} of ${trophies.length} trophies`;
  grid.replaceChildren();
  for (const t of shown) grid.append(buildCard(t));
  window.__atlasReady = true;
}

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exported: new Date().toISOString() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(id)));
    save();
    render();
  } catch {
    countLine.textContent = 'That file could not be imported — it is not a trophy progress file.';
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  save();
  render();
});
for (const el of [searchEl, kindEl, gradeEl, spoilersEl, hideEarnedEl]) {
  el.addEventListener('input', render);
}

// Deep links: ?filter=missable, ?grade=silver, ?spoilers=on, ?hide=earned,
// ?search=..., ?view=roadmap, ?trophy=<id> (opens that trophy's guide).
if (params.get('filter')) kindEl.value = params.get('filter');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('spoilers') === 'on') spoilersEl.checked = true;
if (params.get('hide') === 'earned') hideEarnedEl.checked = true;
if (params.get('search')) searchEl.value = params.get('search');
const trophyParam = Number(params.get('trophy'));
if (trophyParam && trophies.some((t) => t.id === trophyParam)) openGuides.add(trophyParam);

render();
if (params.get('view') === 'roadmap') {
  document.getElementById('roadmap').scrollIntoView();
} else if (trophyParam) {
  // 'nearest' scrolls only if the trophy is off-screen, so a cover shot of a
  // trophy near the top keeps the hero and progress bar in view.
  document.getElementById(`trophy-${trophyParam}`)?.scrollIntoView({ block: 'nearest' });
}
