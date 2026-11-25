# For Agents

Open `index.html` for geometric screenprint, `stamps.html` for folk rubber stamps, or `woodcut.html` for woodcut in a modern browser. The 1024 × 1536 preview updates as you type a seed.

## Render in another project

Load [`src/screenprint.js`](../../src/screenprint.js) as a classic browser script. It provides `globalThis.NiltaviBanner`. Give `drawPoster` a fresh 2D canvas context and pass the same seed and settings to reproduce a composition.

```js
const { width, height, drawPoster } = globalThis.NiltaviBanner;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
drawPoster(canvas.getContext('2d', { willReadFrequently: true }), {
  seed: '1300j89',
  wobble: 46,
  grain: 56,
});
```

`wobble` and `grain` accept numbers from 0 to 100 and default to 48 and 56. `paper` takes any canvas colour for the background, cut-outs and grain, and defaults to `#faf3e3`. The renderer supports any positive canvas dimensions with a 2:3 aspect ratio. Use `canvas.toBlob(callback, 'image/png')` to export the canvas. For predictable raster output, reuse the same renderer revision, browser and context settings. Antialiasing can vary across browsers.

`createPosterLayout(seed)` returns the motif plan in row order without requiring a canvas. Node scripts can import the plan with `require('./src/screenprint.js')`.

### Folk rubber stamps

Load [`src/stamp-motifs.js`](../../src/stamp-motifs.js) followed by [`src/stamp.js`](../../src/stamp.js) as classic browser scripts. Call `NiltaviStamp.drawPoster(context, { seed })` with a positive 2:3 canvas. Use `canvas.toBlob(callback, 'image/png')` for PNG export. The renderer uses `OffscreenCanvas` to build the paper and cut the ink mask.

`NiltaviStamp.motifs` is the catalog, and `NiltaviStamp.createStampLayout(seed)` returns 24 motifs in row order across six rows and four vertically staggered columns. Node can use both via `require('./src/stamp.js')`. Seed `林间` is the default. A [catalog ID](../stamp-motifs.md) pins the matching motif in the first position, and a free-form seed varies the whole sheet.

### Woodcut

Load the two stamp scripts above for the shared layout, then [`src/woodcut-motifs.js`](../../src/woodcut-motifs.js) and [`src/woodcut.js`](../../src/woodcut.js). Call `NiltaviWoodcut.drawPoster(context, { seed })` with a positive 2:3 canvas. The default seed `黑木` shows the first 24 designs. A [catalog ID](../woodcut-motifs.md) places that design first. `createWoodcutLayout(seed)` returns the layout in row order and also works in Node.

Use `drawMotif(context, id)` to reproduce any standalone PNG in [`assets/woodcut`](../../assets/woodcut). The shipped assets use a square 384 × 384 canvas, exposed as `NiltaviWoodcut.blockSize`, and a transparent background. The renderer uses `OffscreenCanvas` for each carved block and the paper.

## Verify

Run the built-in Node tests from the repository root.

```sh
node --test
```

Open each preview, type a different seed, and check that the artwork changes. Enter the original seed again to check that it restores the original artwork. Use `fern` on the stamp page and `crane` on the woodcut page to check that the selected motif moves to the first cell.
