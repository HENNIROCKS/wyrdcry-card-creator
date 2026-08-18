# Wyrdcry Card Creator

A card creator for Warhammer Age of Sigmar: Warcry, built with a modern stack. This is a fan project made for the community; it is not commercial and has no affiliation with or endorsement from Games Workshop.

## What it does

Browser-based tool for creating custom Warcry cards. No backend, no login, everything runs client-side.

**Fighter card editor** — upload a model photo, set name and characteristics (Move, Toughness, Wounds), and build a weapon profile table. On mobile, pan and pinch-to-zoom the model image directly on the preview. Export as a print-ready PNG.

**Text card editor** — set card name, card type (Ability, Reaction, Heroic Trait, Battle Trait, Divine Blessing, Lesser/Greater Artefact, or a custom label), and use the Card Elements checkboxes to toggle which sections appear on the card: activation cost (Double / Triple / Quad), flavour text, a points cost increases table (Regular/Elite rows), prerequisite text (framed box), body text with bold/italic markup, and an optional caption at the bottom of the card. A **Card Design** option switches the type label to a full-width banderole — a torn-edge ribbon that spans slightly beyond the card edges. The body/flavor/prerequisite text markup toolbar includes an **A↓ font size toggle** for denser cards. Export as a print-ready PNG.

**Card back editor** — create a matching card back with optional name text, a custom background image (pan and pinch-to-zoom on mobile), and configurable text colour. A "mirrored name" option repeats the name upside-down for a symmetrical playing-card style. Export as a print-ready PNG; printer-friendly mode forces black on white.

All three editors support **light and dark theme**, work on **desktop and mobile** (tab-based layout on small screens), and can be **installed as a PWA** from the browser.

## Developing

Requires Node v22+. Run `make dev` to start the dev server at http://localhost:5173.

```bash
make dev      # dev server (opens browser automatically)
make build    # production build
make preview  # preview production build
```

### Testing on a phone or other device

The dev server listens on all network interfaces. Start `make dev` and use the **Network** URL printed by Vite (e.g. `http://192.168.x.x:5173`) from any device on the same Wi-Fi network. If port 5173 is occupied, Vite will increment it — use whichever port appears in the terminal.

## Translations

The tool ships with English and German. Adding a new language requires a single JSON file — no code changes. See [`src/lib/i18n/README.md`](src/lib/i18n/README.md) for the full guide.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for code style, architecture constraints, and how to submit a PR.

## License

MIT — see [LICENSE](LICENSE). Fonts are SIL OFL. Warcry and all associated marks are property of Games Workshop Group PLC; this project is an unofficial fan tool.
