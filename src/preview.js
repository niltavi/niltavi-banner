(() => {
  'use strict';

  const root = document.getElementById('screenprint-patterns');
  const canvas = root.querySelector('[data-poster]');
  const preview = canvas.getContext('2d');
  const raster = document.createElement('canvas');
  raster.width = canvas.width;
  raster.height = canvas.height;
  const context = raster.getContext('2d', { willReadFrequently: true });
  const seedField = root.querySelector('[data-seed]');
  const status = root.querySelector('[data-status]');
  const downloadButton = root.querySelector('[data-export]');
  const sliders = [...root.querySelectorAll('[data-setting]')];
  const { defaults, drawPoster } = globalThis.NiltaviBanner;

  function readings() {
    return {
      seed: seedField.value.trim() || defaults.seed,
      ...Object.fromEntries(sliders.map(slider => [slider.dataset.setting, Number(slider.value)])),
    };
  }

  let redraw;
  function paint(values) {
    drawPoster(context, values);
    preview.drawImage(raster, 0, 0);
  }

  function update() {
    const values = readings();
    sliders.forEach(slider => {
      root.querySelector('[data-value="' + slider.dataset.setting + '"]').textContent = slider.value + '%';
    });
    cancelAnimationFrame(redraw);
    redraw = requestAnimationFrame(() => paint(values));
  }

  function announce() {
    status.textContent = '图案已更新，种子 ' + readings().seed;
  }

  root.querySelector('[data-shuffle]').addEventListener('click', () => {
    const randomBytes = crypto.getRandomValues(new Uint32Array(1));
    seedField.value = randomBytes[0].toString(36);
    update();
    announce();
  });
  seedField.addEventListener('input', update);
  seedField.addEventListener('change', announce);
  sliders.forEach(slider => {
    slider.addEventListener('input', update);
    slider.addEventListener('change', announce);
  });
  downloadButton.addEventListener('click', () => {
    const values = readings();
    paint(values);
    raster.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const filenameSeed = values.seed.replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 48);
      anchor.href = url;
      anchor.download = 'screenprint-' + (filenameSeed || defaults.seed) + '.png';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  });
  seedField.value = defaults.seed;
  sliders.forEach(slider => { slider.value = defaults[slider.dataset.setting]; });
  update();
})();
