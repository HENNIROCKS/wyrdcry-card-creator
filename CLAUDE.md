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
- `WeaponTable.svelte` — the weapon stat table both cards render; `showGoldCoins` adds the fifth column (text card), `tight` drops the row height 55 → 46 px (fighter card), `printerFriendly` swaps fills for outlines
- `CardSizeSelect.svelte` — bridge/poker picker + live size info line; sits in every export dropdown
- `LangSwitch.svelte` — language switcher
- `ThemeToggle.svelte` — light/dark theme toggle

### Card rendering approach

Cards are rendered as **CSS/HTML components** (not Canvas). Export uses `dom-to-image-more` at 2× scale for crisp PNGs. This means card visual components are regular Svelte components styled with CSS — no coordinate math.

### Card structure

**Fighter card** (portrait, `cardSize.portrait` — 588×915 at bridge):

- Top band (175px), inset 38px left and right so it shares the parchment column's flush line: a row of two — a 175×175px model image on the left, masked with `runemark-shape.svg` (the gold coins badge's shape) and, in the space beside it, the centred fighter name plus subtitle. The torn-edge SVG mask is text-card-only
- Below: parchment area — characteristics table, optional weapons table, talents box, keywords as white pills (`.keyword-pill`, green outline, centred and wrapping; printer-friendly swaps the outline to black and drops the fill)
- Weapons table (`showWeapons` on `FighterCardData`): Weapon/Range/Attacks/Damage columns (name column left-aligned, values centred), rows via `weapons: FighterWeapon[]`, capped at `MAX_WEAPONS` = 3 with the add button disabled and a hint shown at the cap — same handling as the text card, minus the gold coins column
- A rendered weapons table also puts `.is-tight` on `.parchment`: characteristics rows 55 → 46 px, gap 20 → 14 px, padding 29/38 → 24/30 px, buying the talents box ~85 px (the weapon rows shrink through `WeaponTable`'s own `tight` prop). Text blocks keep their size; `fitTalentsBox` shrinks the talents copy no further than 13 px
- Gold coins badge and may-hire box are parked: the markup is commented out in `FighterCard.svelte` and the form fields are disabled, styles kept in place so re-enabling is a pure uncomment. They account for the "unused CSS selector" warnings `svelte-check` reports on that file
- `handleFileLoad` merges a loaded layout onto `defaultData`, so a JSON saved before a field existed still opens

**Text card** (portrait, same ratio):

- Three card types: **talent** (covers traits, abilities and reactions — the form shows that as a hint under the type picker), **equipment**, and a free custom label
- Top: banderole only (no standard/non-banderole layout, no activation badge) — a full-width torn-edge ribbon (`<div class="banderole">`) overhanging the card edges, top-anchored in the image section; shows the card label (preset slugs: talent, equipment — or custom text); printer-friendly renders a stroke outline SVG instead of the filled shape
- Parchment area — card name (rendered only if non-empty, no placeholder fallback), then: flavor text (italic, toggled), weapon stat table (Weapon/Range/Attacks/Damage/Gold Coins columns, rows via `weapons: TextCardWeapon[]`, shown only when `cardLabel === 'equipment'`, capped at `MAX_WEAPONS` = 3 with the add button disabled and a hint shown at the cap), prerequisite text (framed box, toggled — unavailable on equipment cards, the table and the prerequisite are mutually exclusive), body text
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
- Documenting a session always means checking and updating **all** of: `README.md`, `CLAUDE.md`, `src/lib/i18n/README.md`, `.github/ISSUE_TEMPLATE/*.md`, and memory files.
- **Never** run `git commit` or `git push` (any variant). User manages all git operations.
- When redundant files are identified (stale build output, `.DS_Store`, empty placeholders, orphaned assets), delete them without asking.
