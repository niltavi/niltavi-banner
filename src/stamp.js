(() => {
  'use strict';

  const inNode = typeof module === 'object' && module.exports;
  const motifs = inNode ? require('./stamp-motifs.js') : globalThis.NiltaviStampMotifs;
  const width = 1024;
  const height = 1536;
  const defaults = Object.freeze({ seed: '林间' });
  const paperColor = [246, 231, 203];
  const inkColor = [24, 61, 35];
  const surfaceCache = new WeakMap();
  const pathCache = new WeakMap();

  const rows = 6;
  const columnOffsets = [-18, 20, -14, 17];
  const columns = columnOffsets.length;

  function randomFrom(seed) {
    let value = 2166136261;
    for (const character of seed) {
      value = Math.imul(value ^ character.codePointAt(0), 16777619);
    }
    value ||= 1;
    return () => {
      value ^= value << 13;
      value ^= value >>> 17;
      value ^= value << 5;
      return (value >>> 0) / 4294967296;
    };
  }

  function createLayout(motifs, firstMotifs, random) {
    const chosen = [...firstMotifs];
    const pool = motifs.filter(motif => !chosen.includes(motif));
    while (chosen.length < rows * columns) {
      chosen.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
    }
    return chosen.map((motif, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      return {
        motif,
        x: 169 + 229 * column + (random() - 0.5) * 18,
        y: 206 + 225 * row + columnOffsets[column] + (random() - 0.5) * 20,
        size: 164 + random() * 22,
        angle: (random() - 0.5) * 0.32,
      };
    });
  }

  function normalizeSeed(seed) {
    return String(seed ?? '').trim() || defaults.seed;
  }

  function createStampLayout(seed) {
    seed = normalizeSeed(seed);
    const random = randomFrom(seed + '|layout');
    // A motif ID pins the first stamp so every design can be found directly.
    const chosen = seed === defaults.seed ? motifs.slice(0, 4) : motifs.filter(motif => motif.id === seed);
    return createLayout(motifs, chosen, random);
  }

  function noiseField(random, columns, rows) {
    const values = Float32Array.from({ length: columns * rows }, () => random() * 2 - 1);
    return (x, y) => {
      const column = Math.floor(x);
      const row = Math.floor(y);
      const offset = row * columns + column;
      const u = x - column;
      const v = y - row;
      const top = values[offset] * (1 - u) + values[offset + 1] * u;
      const bottom = values[offset + columns] * (1 - u) + values[offset + columns + 1] * u;
      return top * (1 - v) + bottom * v;
    };
  }

  function createPaper(canvasWidth, canvasHeight) {
    const surface = new OffscreenCanvas(canvasWidth, canvasHeight);
    const context = surface.getContext('2d', { willReadFrequently: true });
    const image = context.createImageData(canvasWidth, canvasHeight);
    const random = randomFrom('niltavi|cotton-paper');
    const pulp = noiseField(random, 38, 55);
    const clouds = noiseField(random, 9, 13);
    const pixels = image.data;
    for (let y = 0; y < canvasHeight; y++) {
      const v = y / canvasHeight;
      for (let x = 0; x < canvasWidth; x++) {
        const u = x / canvasWidth;
        const tone = 6 * clouds(u * 7, v * 11) + 7 * pulp(u * 36, v * 53) + (random() - 0.5) * 10;
        const index = (y * canvasWidth + x) * 4;
        pixels[index] = paperColor[0] + tone * 0.7;
        pixels[index + 1] = paperColor[1] + tone;
        pixels[index + 2] = paperColor[2] + tone * 1.2;
        pixels[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);

    context.scale(canvasWidth / width, canvasHeight / height);
    context.strokeStyle = '#97734a';
    context.lineCap = 'round';
    for (let index = 0; index < 28500; index++) {
      const x = random() * width;
      const y = random() * height;
      const angle = random() * Math.PI * 2;
      const length = 0.9 + random() ** 2 * 6.5;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      context.globalAlpha = 0.05 + random() * 0.16;
      context.lineWidth = 0.35 + random() * 0.65;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo((x + endX) / 2 + 0.9, (y + endY) / 2 - 0.8, endX, endY);
      context.stroke();
    }
    return context.getImageData(0, 0, canvasWidth, canvasHeight).data;
  }

  function getSurfaces(context) {
    const { width: canvasWidth, height: canvasHeight } = context.canvas;
    let surfaces = surfaceCache.get(context);
    if (!surfaces || surfaces.width !== canvasWidth || surfaces.height !== canvasHeight) {
      const stencil = new OffscreenCanvas(canvasWidth, canvasHeight).getContext('2d', { willReadFrequently: true });
      surfaces = {
        width: canvasWidth,
        height: canvasHeight,
        stencil,
        paper: createPaper(canvasWidth, canvasHeight),
        output: context.createImageData(canvasWidth, canvasHeight),
      };
      surfaceCache.set(context, surfaces);
    }
    return surfaces;
  }

  function pathsFor(motif) {
    let paths = pathCache.get(motif);
    if (!paths) {
      paths = {
        ink: motif.ink.split('|').map(path => new Path2D(path)),
        cuts: new Path2D(motif.cuts),
        holes: new Path2D(motif.holes),
      };
      pathCache.set(motif, paths);
    }
    return paths;
  }

  function stampMask(surfaces, layout, random) {
    const { stencil, width: canvasWidth, height: canvasHeight } = surfaces;
    stencil.clearRect(0, 0, canvasWidth, canvasHeight);
    stencil.save();
    stencil.scale(canvasWidth / width, canvasHeight / height);
    for (const { motif, x, y, size, angle } of layout) {
      const paths = pathsFor(motif);
      stencil.save();
      stencil.translate(x, y);
      stencil.rotate(angle);
      stencil.scale(size / 100, size / 100);
      stencil.translate(-50, -50);
      for (const path of paths.ink) stencil.fill(path);
      stencil.globalCompositeOperation = 'destination-out';
      stencil.lineCap = 'round';
      stencil.lineJoin = 'round';
      stencil.lineWidth = motif.weight;
      stencil.stroke(paths.cuts);
      stencil.fill(paths.holes);
      stencil.restore();
    }

    stencil.globalCompositeOperation = 'destination-out';
    for (let index = 0; index < 7400; index++) {
      const x = random() * width;
      const y = random() * height;
      const radius = 0.25 + random() ** 4 * 2.35;
      const angle = random() * Math.PI;
      stencil.globalAlpha = 0.22 + random() * 0.77;
      stencil.beginPath();
      stencil.ellipse(x, y, radius * 1.15, radius * 0.63, angle, 0, Math.PI * 2);
      stencil.fill();
    }
    stencil.restore();
    return stencil.getImageData(0, 0, canvasWidth, canvasHeight).data;
  }

  function printInk(surfaces, mask, seed) {
    const { output, paper, width: canvasWidth, height: canvasHeight } = surfaces;
    const pixels = output.data;
    pixels.set(paper);
    const random = randomFrom(seed + '|impression');
    const scale = canvasWidth / width;
    const spacing = Math.max(1, 7 * scale);
    const columns = Math.ceil(canvasWidth / spacing) + 2;
    const rows = Math.ceil(canvasHeight / spacing) + 2;
    const horizontal = noiseField(random, columns, rows);
    const vertical = noiseField(random, columns, rows);
    const pressure = noiseField(random, 16, 22);
    const reach = Math.max(1, Math.ceil(3.2 * scale));
    const stride = canvasWidth * 4;
    for (let y = reach; y < canvasHeight - reach; y++) {
      const v = y / spacing;
      for (let x = reach; x < canvasWidth - reach; x++) {
        const index = (y * canvasWidth + x) * 4;
        if (!(mask[index + 3] || mask[index + 3 - reach * 4] || mask[index + 3 + reach * 4]
          || mask[index + 3 - reach * stride] || mask[index + 3 + reach * stride])) continue;
        const u = x / spacing;
        const sourceX = x + Math.round(horizontal(u, v) * 3.1 * scale);
        const sourceY = y + Math.round(vertical(u, v) * 3.1 * scale);
        const alpha = mask[(sourceY * canvasWidth + sourceX) * 4 + 3] / 255;
        if (!alpha) continue;
        const press = pressure(x / canvasWidth * 14, y / canvasHeight * 20);
        const coverage = alpha * (0.939 + 0.026 * press + random() * 0.034);
        for (let channel = 0; channel < 3; channel++) {
          pixels[index + channel] = paper[index + channel] * (1 - coverage) + inkColor[channel] * coverage;
        }
      }
    }
  }

  function drawPoster(context, settings = {}) {
    const { width: canvasWidth, height: canvasHeight } = context.canvas;
    if (canvasWidth <= 0 || canvasWidth * 3 !== canvasHeight * 2) {
      throw new RangeError('The stamp canvas must have a 2:3 aspect ratio.');
    }
    const seed = normalizeSeed(settings.seed);
    const surfaces = getSurfaces(context);
    const mask = stampMask(surfaces, createStampLayout(seed), randomFrom(seed + '|wear'));
    printInk(surfaces, mask, seed);
    context.putImageData(surfaces.output, 0, 0);
  }

  const printLayout = Object.freeze({ randomFrom, createLayout });
  const api = Object.freeze({ width, height, defaults, motifs, createStampLayout, drawPoster, printLayout });
  if (inNode) module.exports = api;
  else globalThis.NiltaviStamp = api;
})();
