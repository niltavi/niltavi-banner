(() => {
  'use strict';

  const root = document.querySelector('[data-generator]');
  const canvas = root.querySelector('[data-poster]');
  const preview = canvas.getContext('2d');
  const raster = document.createElement('canvas');
  raster.width = canvas.width;
  raster.height = canvas.height;
  const context = raster.getContext('2d', { willReadFrequently: true });
  const seedField = root.querySelector('#poster-seed');
  const status = root.querySelector('[data-status]');
  const renderers = {
    screenprint: globalThis.NiltaviBanner,
    stamp: globalThis.NiltaviStamp,
    woodcut: globalThis.NiltaviWoodcut,
  };
  const renderer = renderers[root.dataset.generator];
  const { defaults, drawPoster } = renderer;

  let redraw;
  function update(event) {
    if (event?.isComposing) return;
    const seed = seedField.value.trim() || defaults.seed;
    cancelAnimationFrame(redraw);
    redraw = requestAnimationFrame(() => {
      drawPoster(context, { seed });
      preview.drawImage(raster, 0, 0);
    });
  }

  seedField.addEventListener('input', update);
  seedField.addEventListener('compositionend', update);
  seedField.addEventListener('change', () => {
    seedField.value = seedField.value.trim() || defaults.seed;
    status.textContent = '图案已更新，种子 ' + seedField.value;
  });
  seedField.value = defaults.seed;
  update();
})();
