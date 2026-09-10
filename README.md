# Foundations

An incremental city-building game with an automatically generated 3D settlement.

## Play the prototype

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the localhost address printed by Vite. Start a new settlement, research Masonry, build a Cottage, open Workers to create a Worker for **20 Food**, then assign a job. Spare housing reduces crowding. Food upkeep applies to every worker.

This playable foundation includes the complete five-Age economic technology tree, all non-religious buildings and resources, advanced production jobs, starvation, sickness, healing, burial, wolf attacks, a Three.js settlement, and save/load. Religion, percentage workforce automation, and Wonders remain future implementation work.

## Controls

- Left-drag to orbit; right-drag or canvas arrow keys to pan; scroll to zoom.
- R resets the view; Space pauses when the page/canvas is focused.
- 1 / 2 / 3 gather Food / Wood / Stone when the page/canvas is focused.
- Use the menu button or Escape for save slots, import/export, and reduced motion. Hover the ? button for camera and gathering shortcuts.
- All management controls support keyboard focus. Custom worker amounts must be positive integers.

The compact HUD keeps inventory at the top and gathering above the management tabs. Building effects use hover help. Workers share one assignment amount with minus/plus and All/Max controls; the resource tab shows production, consumption, and net rates without repeating inventory.

The HUD also shows net resource change per second. There is no calendar or day counter. Buildings plop into place over two seconds; roads join adjacent blocks into a shared grid. Farm count and crop-bed size follow assigned Farmers, with bounded representative plots for large workforces. Version 1 saves migrate to the seconds-based version 2 schema automatically.

The simulation pauses in menus and hidden tabs. There is no offline production. Three local slots are stored per browser and origin; export a JSON backup to transfer a settlement or keep it outside browser storage.

## Build and host

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to any static host. Relative asset URLs support GitHub project Pages and other subpaths. No server, secrets, API, remote art, or database is needed.

For GitHub Pages, set repository **Settings → Pages → Source → GitHub Actions**. The included Pages workflow tests/builds and deploys on pushes to `main` or `master`, or manual dispatch. The project has not been published by this task. Hosting follows [Vite’s static deployment guidance](https://vite.dev/guide/static-deploy).

## Verification

```sh
npm test
npm run format:check
npm run build
npx playwright install chromium
npm run test:e2e
```

On Windows with Edge installed, `$env:PW_CHANNEL='msedge'; npm run test:e2e` uses that browser without downloading Chromium. Browser tests exercise the production build, fresh-start gathering/construction/hiring, assignment and worker production, paused/menu/reload behavior, and invalid imports. Unit tests cover economic rules, save validation/recovery, placement, timing, and scene limits.

## Code map

- `src/game/` — pure economy, catalog, placement, clock, save schema, and browser storage adapter.
- `src/scene/` — procedural Three.js models, scenery, animation, and camera lifecycle. Rendering never changes economy.
- `src/ui/` — icons, formatting, screen templates, and menu content.
- `src/session.js` — session lifecycle, input routing, persistence, and frame-loop coordination.
- `src/styles/` — shared primitives, management screens, and menu styling.
- `tests/` — Node unit tests; `tests/browser/` — Playwright acceptance tests.

Each source file starts with a short responsibility description. Add economic behavior to the game modules first, test it without WebGL, then expose the behavior through UI and visuals. Save-schema changes should introduce an explicit version migration rather than silently altering existing saves.

## Design documents

- [Game overview](design/00-overview.md)
- [Resources](design/01-resources.md)
- [Buildings](design/02-buildings.md)
- [Technology and Ages](design/03-technology.md)
- [Wonders](design/04-wonders.md)
- [Religion](design/05-religion.md)
- [Design review and decisions](design/06-design-review.md)
- [Implementation rules](design/07-rules.md)

The game is named **Foundations**. References to **CivClicker** identify its design inspiration, not an alternative game title.

The implementation rules are the approved baseline for simulation behavior. The design review records resolved requirements and remaining delivery work. Initial balance values still require playtesting.
