# For Agents

Open the repository's `index.html` directly in a modern browser. Change the seed to explore other compositions, then adjust stroke wobble and ink grain independently. The PNG export contains the artwork at 1024 × 1536.

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

`wobble` and `grain` accept numbers from 0 to 100. The renderer supports any positive canvas dimensions with a 2:3 aspect ratio. For predictable raster output, reuse the same renderer revision, browser and context settings. Antialiasing can vary across browsers.

`createPosterLayout(seed)` returns the motif plan in row order without requiring a canvas. Node scripts can import the plan with `require('./src/screenprint.js')`.

## Verify

Run the built-in Node tests from the repository root.

```sh
node --test
```

Open `index.html`, try both sliders and **随机一张**, then use **下载 PNG** and compare the result with the preview.
