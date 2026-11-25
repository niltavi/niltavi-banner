# Modernist woodcuts

Start with [the catalog](../../../../src/woodcut-motifs.js), [the renderer](../../../../src/woodcut.js), and the [reference proof](../../../../docs/assets/woodcut-preview.webp). The default `黑木` proof preserves the supplied first 24 silhouettes, their original orientation, and their cut contours. Use those assets to judge how much of each block remains black and how the short cuts look at small sizes.

## Visual decisions

- Make one compact subject from one or two full black masses. Use asymmetrical facets, a few abrupt turns, and occasional small edge chips. A taper, fold, neck, or seam should be readable from the outline and the main cut.
- Give the silhouette a conspicuous primary knockout, shaped for the subject. Then group two or three visible, short gouges near one edge or turn. Give each a broad bite that tapers to a point, and vary their length and position. Aim them along the form as it bends, such as the direction of a wing or the edge of a carved slab. Confine the cluster to one region so most of the block stays black.
- Judge the short gouges as actual openings in the ink. They must survive reduction to the intended icon size. Use very subtle edge transfer loss and light ivory paper fibers. Keep the interior of the remaining block flat and near-black.

## Author and export a block

Use `block(id, name, ink, cut)` in the 100 × 100 space. Ink paths separated by `|` are filled independently. Put the main knockout in `cut` and describe the local cluster in `gougeGroups[id]` as `[centerX, centerY, angleInDegrees, length, count]`. `blockSurface` subtracts the cuts and gouges from the ink. Inspect the actual PNG to catch a cluster that lands outside the ink, merges with a main cut, or becomes too small after rendering.

The existing `proof` entries are traced reference outlines with their cut holes already in the path. Preserve their even-odd fill and their place in the default sheet. Build newly designed subjects with `block` so the main cut and local cluster can be adjusted separately.

Use the renderer to produce a 384 × 384 transparent PNG at `assets/woodcut/<id>.png`. From the loaded [woodcut preview](../../../../woodcut.html), this browser snippet renders one entry:

```js
const { blockSize, drawMotif } = NiltaviWoodcut;
const canvas = document.createElement('canvas');
canvas.width = canvas.height = blockSize;
drawMotif(canvas.getContext('2d', { willReadFrequently: true }), 'kite');
const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
```

Save the blob under the matching ID. Check that background and gouges are transparent and that ink stays inside the canvas. Update the [woodcut index](../../../../docs/woodcut-motifs.md) and [woodcut tests](../../../../test/woodcut.test.cjs). The tests compare the catalog IDs and count against the shipped assets. Review the default proof separately when changing a referenced contour.
