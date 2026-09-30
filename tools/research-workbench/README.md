# Research Tree Workbench

A drag-and-drop copy of the Main research tab, used to plan the Unified Research Tree layout before it goes into the game.

Open `research-workbench.html` in a browser. No install needed.

## What it does

- Starts from the vanilla RimWorld layout. Mod projects wait in a tray under the tree until you drag them in.
- Borders show where a project comes from: solid for the base game, dashed and coloured for each DLC, dotted for mods. Renamed vanilla projects show their vanilla name underneath.
- Drag, box-select (the view scrolls when you reach an edge), nudge with the arrow keys, and lock projects so they stay put.
- Click a line to remove it or hide it (still required, just not drawn). Add new requirements from a project's panel. Loops are blocked.
- Live scores: line crossings, lines behind boxes, distance from vanilla, and problems (overlaps, or a project left of what it needs).
- The sidebar shows only what is selected, with the matching keyboard shortcuts at the bottom.

## Saving

Autosave and named versions only work when the page is opened as a Claude artifact. Opened from this folder, everything else works: use **View → Copy layout as text** to export positions and connection changes.

## Editing the tool

The page is built from `src/`:

- `page.html`: layout and styles
- `workbench.js`: behaviour
- `tree.json`: the research data (positions, requirements, vanilla spots and names, costs, unlocks)

After changing any of them, run `python3 src/build.py` to rebuild `research-workbench.html`.
