# Folk rubber stamps

Start with [the catalog](../../../../src/stamp-motifs.js), [the renderer](../../../../src/stamp.js), and the [default stamp proof](../../../../docs/assets/stamp-preview.webp). Use `NiltaviStamp.createStampLayout(seed)` to inspect the plan. An exact motif ID places that stamp in the first cell. The default seed `林间` begins with ginkgo, snail, mushroom, and acorn.

## Visual decisions

- Use a recognizable, slightly rounded silhouette with broad, connected green masses. One leaf, animal, fungus, fruit, or small object per stamp keeps the outline readable when reduced.
- Carve the feature a viewer needs to recognize the subject. Use a few bold, paper-revealing strokes or holes for veins, a shell spiral, gills, or the angle of a wing. Interior marks belong inside the silhouette and follow the subject.
- Use the renderer's deep green ink on warm cream paper. Slight edge displacement, faint paper fibers, and sparse transfer loss give the impression of a hand stamp. Keep the green area visually solid at the preview scale.

## Add a catalog entry

Author the motif in the existing 100 × 100 local coordinate space. The catalog's `motif(id, name, ink, cuts, holes, weight)` keeps ink and carving separate. Join overlapping positive shapes with `|`. Use `cuts` for stroked `Path2D` geometry, `holes` for filled knockouts, and `weight` for the carved line width. Both kinds of cut remove alpha from the mask, so the real paper shows through.

Leave space inside the local bounds for rotation, stagger, and the edge treatment. Balance solid mass against open paper in the default 6 × 4 sheet. Compare the new silhouette with existing catalog subjects before assigning its ID.

Update [the seed index](../../../../docs/stamp-motifs.md) and [stamp tests](../../../../test/stamp.test.cjs), including the catalog count and access by ID. Render the motif by its new seed and check the strokes and holes in the first cell.
