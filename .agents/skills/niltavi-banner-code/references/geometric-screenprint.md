# Geometric screenprint

Start with [the renderer](../../../../src/screenprint.js), [the layout tests](../../../../test/screenprint.test.cjs), and the [default color proof](../../../../docs/assets/generator-preview.png). The public entry is `NiltaviBanner.drawPoster(context, settings)`. `createPosterLayout(seed)` exposes the 24 planned cells.

## Visual decisions

- Build circles, triangles, squares, hexagons, and occasional irregular cutouts with comparable visual weight. Alternating silhouettes keeps the sheet readable at a glance.
- Use one or two patterns per motif. The existing vocabulary includes waves, zigzags, stripes, dots, dashes, and nested contours. Use one or two inks from the renderer palette. Grass green is `#2e8246`, light green is `#a0c84c`, cyan blue is `#0498b8`, and lemon yellow is `#f6ca35`. The default paper is `#faf3e3`.
- Mix open marks, solid shapes with paper-colored cuts, and two-ink overprints. Clip patterns to the silhouette. Keep a few short overhangs and simplified sprigs localized so adjacent cells stay independent.
- Keep hand wobble continuous along each stroke. Use fine grain near the ink edge with a light touch in the interior. Each pattern should read at the icon size before grain is added.

## Add through the renderer

Evaluate `outline` and `drawMotif` first. Use `drawLines`, `drawMarks`, or `drawContours` when their geometry already fits. Keep the motif in local coordinates and rely on the renderer's clip and transform. Preserve the existing `paper` parameter through the negative space, sprigs, and exposed-paper grain.

The default shape sequence and six-pattern shuffles are part of the seeded output. Inserting a pattern into the shuffled list can change the pattern order and later random draws throughout the sheet. Give a new pattern or silhouette an intentional selection route and compare the old seed `2564` before updating the established pool.

The current API renders a sheet and exposes its plan. If the task calls for an individual asset, reuse the motif drawing path and document the selection entry point. Keep the default sheet layout and its callers intact.
