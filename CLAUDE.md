# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based tool for creating Warcry (Warhammer Age of Sigmar) fighter cards, text/ability cards, and card backs with custom image uploads and editable values. No backend, no persistent storage — everything runs client-side. Forked from warcry-card-creator-2026 with the runemark system, faction hierarchy, monster damage brackets, and the deployment/reference card editors removed.

## Stack

- **SvelteKit 2 + Vite** (Svelte 5 runes syntax)
- **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin, no config file needed)
- **dom-to-image-more** — PNG export (desktop); **modern-screenshot** (`domToPng`) — PNG export (mobile)
- **PWA** — installable via `static/site.webmanifest`; no service worker, no offline mode

## Commands

Node v22+ is required. The system default may be v16 (via Laravel Herd). Use `make` or prefix commands with the Herd Node path.

```bash
make dev       # dev server at http://localhost:5173
make build     # production build
make preview   # preview production build
```

Or directly with the correct Node:

```bash
PATH="$HOME/Library/Application Support/Herd/config/nvm/versions/node/v22.22.0/bin:$PATH" npm run dev
```

## Architecture

### Routes

- `/` — landing page, links to all three card editors
- `/fighter` — fighter card editor
- `/text` — text/ability card editor
- `/card-back` — card back editor

### Key files

- `src/lib/card-size.svelte.ts` — card size store; exports `cardSize`, `CARD_SIZES`, `EXPORT_SCALE`
- `src/lib/types.ts` — all TypeScript interfaces (`FighterCardData`, `TextCardData`, `CardBackData`, `Weapon`, etc.)
- `src/lib/i18n/index.svelte.ts` — i18n store; exports `t(key)` function and `i18n` reactive object
- `src/lib/i18n/locales/en.json` — source locale (en + de ship); all user-visible strings live here
- `src/lib/theme.svelte.ts` — light/dark theme store; exports `toggleTheme()`
- `src/app.css` — global styles, Tailwind import, custom font declarations, theme CSS vars
- `static/fonts/` — self-hosted font files and license texts

### Components

- `FighterCard.svelte` / `FighterForm.svelte` — fighter card visual + form
- `TextCard.svelte` / `TextForm.svelte` — text/ability card visual + form
- `CardSizeSelect.svelte` — bridge/poker picker + live size info line; sits in every export dropdown
- `LangSwitch.svelte` — language switcher
- `ThemeToggle.svelte` — light/dark theme toggle

### Card rendering approach

Cards are rendered as **CSS/HTML components** (not Canvas). Export uses `dom-to-image-more` at 2× scale for crisp PNGs. This means card visual components are regular Svelte components styled with CSS — no coordinate math.

### Card structure

**Fighter card** (portrait, `cardSize.portrait` — 588×915 at bridge):

- Top ~55%: model image area, clipped by an SVG mask for the torn paper edge divider
- Bottom ~45%: parchment area — fighter name, characteristics table, weapons table

**Text card** (portrait, same ratio):

- Top: banderole only (no standard/non-banderole layout, no activation badge) — a full-width torn-edge ribbon (`<div class="banderole">`) overhanging the card edges, top-anchored in the image section; shows the card label (preset slugs: trait, ability, reaction, weapon, equipment — or custom text; pluralizes to "Weapons" when the weapon type has more than one row); printer-friendly renders a stroke outline SVG instead of the filled shape
- Parchment area — card name (rendered only if non-empty, no placeholder fallback), then: flavor text (italic, toggled), weapon stat table (Weapon/Range/Attacks/Damage/Gold Coins columns, any number of rows via `weapons: TextCardWeapon[]`, shown only when `cardLabel === 'weapon'`), prerequisite text (framed box, toggled — unavailable when `cardLabel === 'weapon'`, the two are mutually exclusive), body text
- Show/hide flags on `TextCardData`: `showFlavorText`, `showPrerequisite`, `showCaption` — collapsing both the card element and its form field
- `smallBodyText: boolean` — when true, reduces body text 20→16 px, flavor text 18→15 px, prerequisite text 18→14 px via `.small-body` class on `.parchment`
- Body/prerequisite text markup toolbar has B / I / A↓ buttons (bold, italic, font-size toggle); markup is `**bold**` / `*italic*` only, parsed by `parseMarkup()` in `TextCard.svelte`

**Card back** (portrait, same `cardSize.portrait`):

- Full-card background: `static/background.jpg` texture by default; replaced entirely when a custom background image is uploaded (no double-layering)
- Centred overlay: optional name (Grenze Gotisch, large) + optional mirrored name (rotated 180°) for playing-card symmetry
- `showFlippedName` flag on `CardBackData` controls the mirrored duplicate
- `textColor` (`'white' | 'black' | 'green'`) drives a `--card-text-color` CSS variable for the name; printer-friendly export keeps the chosen text color (only the background image is desaturated to grayscale)
- Custom background image: pan/zoom via sliders on desktop, touch drag + pinch-to-zoom on mobile (`adjustMode` toggle)

### Card size

Two output sizes ship, both standard playing-card proportions: **bridge** (57 × 89 mm) and **poker** (63 × 88 mm). `src/lib/card-size.svelte.ts` holds the dimension table and a `localStorage`-persisted store (`warcry-card-size`), restored in the store's constructor rather than from `onMount`, so the first client render already uses the saved size.

| | bridge | poker |
| --- | --- | --- |
| `portrait` — fighter, text, card back | 588×915 | 654×915 |

All three card types are portrait and hold the 915px height, varying only the width — the parchment column is vertically tight.

Card components never hardcode dimensions — they set `--card-w` / `--card-h` inline from the store and their CSS reads `width: var(--card-w)`. Route files read `cardSize.portrait` for export dimensions, the preview `cardScale` divisor and the mobile touch-drag factors, and `EXPORT_SCALE` (2) for the PNG scale factor.

Stats and weapons columns use fractional widths (`flex: 1 1 0` on `.stat-col`/`.stat-val`/`.weapon-col`/`.weapon-val`, `flex: 2 2 0` on the name variants) so the tables fill the parchment at any card width.

`CardSizeSelect.svelte` renders the picker plus a live info line, and sits at the bottom of every editor's export dropdown. Its click handler calls `stopPropagation()` — the routes close their dropdown on any document click.

### Fonts

- **Grenze Gotisch** (`static/fonts/GrenzeGotisch-Regular.ttf`, family `'Grenze Gotisch'`, weight 400, SIL OFL) — card names, stats values, all block-style text
- **Alegreya** (`static/fonts/Alegreya-Regular.ttf` + `Alegreya-Italic.ttf`, family `'Alegreya'`, SIL OFL) — damage table, text card body/flavor text

### Background / textures

- Parchment texture: `static/background.jpg` applied to `.card` (full card coverage)
- Accent colour (dark header / stat tables / banderole / card back background): `#16754A`
- Table value rows and parchment section are transparent so the texture shows through

### i18n

All user-visible strings use `t(key)` imported from `$lib/i18n/index.svelte`. The source locale is `src/lib/i18n/locales/en.json`; German (`de.json`) also ships. When adding new UI strings or card-rendered text, add a key to both locale files and call `t('namespace.key')` in the template — never hardcode English strings directly. See `src/lib/i18n/README.md` for namespace conventions.

### Theme

Light/dark theme uses CSS custom properties declared on `:root` (dark) and `[data-theme="light"]` in `src/app.css`. Theme state and persistence live in `src/lib/theme.svelte.ts`; `ThemeToggle.svelte` calls `toggleTheme()`. Default is the OS/browser preference; the user's choice persists in `localStorage`.

## Code style

- **Import groups**: sorted alphabetically by the name the variable represents (not by variable name prefix). Each logical group has one header comment; no orphan imports between groups.
- **Object key quoting**: only quote keys that require it — keys containing spaces or hyphens. Single-word plain-identifier keys are unquoted.
- **On-touch cleanup**: when editing any file, also fix incremental-accumulation artifacts in that file — unsorted imports, duplicate or `(additional)`-suffixed section headers, unnecessary quotes. Do not audit unrelated files speculatively.

## Workflow preferences

- Explain plan before making changes. Wait for confirmation.
- At session start, consult `docs/index.html` for prior decisions.
- When asked to "document the session", append a new session panel to `docs/index.html`. Do NOT create separate session files.
- At session end, offer to update/append to `docs/index.html`.
- Documenting a session always means checking and updating **all** of: `docs/index.html`, `README.md`, `CLAUDE.md`, `src/lib/i18n/README.md`, `.github/ISSUE_TEMPLATE/*.md`, and memory files. Not just the session log.
- **Never** run `git commit` or `git push` (any variant). User manages all git operations.
- When redundant files are identified (stale build output, `.DS_Store`, empty placeholders, orphaned assets), delete them without asking.

## Documentation conventions (`docs/index.html`)

Single-file, multi-session format. All sessions live in one file with a sidebar nav.

**One session per day.** If multiple conversations happen on the same date, merge them into one panel.

**Session IDs** use `march-DD` format (e.g. `march-12`). Panel element: `id="session-march-DD"`. Section IDs inside: `march-DD-sectionname`.

**Adding a session:**

1. Add a `<button class="session-btn" data-session="march-DD">` entry at the top of the `#session-list` ul (newest first).
2. Add the panel `<div id="session-march-DD" class="session-panel">` before the previous session's panel.
3. Add the new ID at the front of `const sessions = [...]` in the script block.
4. Update the Topic Index (`session-index`) with links to notable new sections.

**Every `<section>` inside a panel must have both** `id="march-DD-sectionname"` and `data-nav="Label"` attributes — `data-nav` populates the sidebar nav.

**Standard panel structure:**

- Hero: date badge (`badge-blue`) + exactly 3 `badge-green` badges (short noun phrases, never "Done") + title + one-line summary
- **What Was Built** — `<h2><span class="icon" style="background:rgba(52,211,153,0.15)">✓</span> What Was Built</h2>` + `<ul>`
- **Key Decisions** — `<h2><span class="icon" style="background:rgba(196,144,108,0.15)">💡</span> Key Decisions</h2>` + `<div class="decision">` blocks (`.decision-q` / `.decision-a`)
- **Still Pending** — `<h2><span class="icon" style="background:rgba(251,191,36,0.15)">⏳</span> Still Pending</h2>` + `<table>` with Status / Item columns; badge (`badge-amber`) in first `<td>`, item text in second. Do NOT use `.todo-list` / `.todo-item` divs.
- **Files Changed** (optional) — `<h2><span class="icon" style="background:rgba(212,112,112,0.12)">📁</span> Files Changed</h2>` + `<table>` with File / Change columns

**Badges:** `badge-blue` = date, `badge-green` = done, `badge-amber` = pending/todo, `badge-purple` = reference.

**Index links** use `onclick="activateSession('march-DD')"` alongside the `href="#section-id"` to switch to the correct panel.

**After every edit to `docs/index.html`:** read back the changed area and verify HTML structure — all new content sits inside a `<section>`, no orphaned tags, no mismatched `</section>` closers.
