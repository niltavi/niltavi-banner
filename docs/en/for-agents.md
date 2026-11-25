# For Agents

Open `index.html` for geometric screenprint or `stamps.html` for folk rubber stamps in a modern browser. The 1024 × 1536 preview updates as you type a seed.

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

`NiltaviStamp.motifs` is the catalog, and `NiltaviStamp.createStampLayout(seed)` returns a sheet with four motifs in stamp order. Node can use both via `require('./src/stamp.js')`. Seed `林间` is the default. A [catalog ID](../stamp-motifs.md) pins the matching motif in the first position, and a free-form seed varies the whole sheet.

## Verify

Run the built-in Node tests from the repository root.

```sh
node --test
```

Open each preview, type a different seed, and check that the artwork changes. Enter the original seed again to check that it restores the original artwork. On the stamp page, use `fern` to check that the first stamp is a fern.
