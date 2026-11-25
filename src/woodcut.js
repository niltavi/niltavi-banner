(() => {
  'use strict';

  const inNode = typeof module === 'object' && module.exports;
  const motifs = inNode ? require('./woodcut-motifs.js') : globalThis.NiltaviWoodcutMotifs;
  const { printLayout } = inNode ? require('./stamp.js') : globalThis.NiltaviStamp;
  const { randomFrom, createLayout } = printLayout;
  const width = 1024;
  const height = 1536;
  const blockSize = 384;
  const defaults = Object.freeze({ seed: '黑木' });
  const ink = [24, 22, 17];
  const paperColor = '#f8ecd7';
  const byId = new Map(motifs.map(motif => [motif.id, motif]));
  const blocks = new WeakMap();
  const papers = new WeakMap();

  function createWoodcutLayout(seed) {
    seed = String(seed ?? '').trim() || defaults.seed;
    const first = byId.get(seed);
    const useProof = seed === defaults.seed;
    const presets = useProof ? motifs.slice(0, 24) : motifs.filter(motif => motif === first);
    const layout = createLayout(motifs, presets, randomFrom(seed + '|woodcut'));
    return useProof ? layout.map(item => ({ ...item, angle: 0 })) : layout;
  }

  function chipEdges(context, id) {
    const size = context.canvas.width;
    const image = context.getImageData(0, 0, size, size);
    const pixels = image.data;
    const alpha = pixels.filter((_, index) => index % 4 === 3);
    const random = randomFrom(id + '|transfer');
    const phase = random() * Math.PI * 2;
    const uneven = Float32Array.from({ length: size }, (_, index) =>
      1.7 * Math.sin(index / 6 + phase) + 1.3 * Math.sin(index / 17 - phase));
    // Shift the carved edge slightly, then leave occasional pinholes at that edge.
    for (let y = 6; y < size - 6; y++) {
      for (let x = 6; x < size - 6; x++) {
        const offset = y * size + x;
        const sourceX = x + Math.round(uneven[y] + 0.2 * uneven[x]);
        const sourceY = y + Math.round(uneven[x] - 0.2 * uneven[y]);
        const source = sourceY * size + sourceX;
        let coverage = alpha[source];
        if (coverage && random() < 0.09
          && (alpha[source - 2] < 200 || alpha[source + 2] < 200
            || alpha[source - size * 2] < 200 || alpha[source + size * 2] < 200)) {
          coverage *= random() * 0.7;
        }
        if (coverage !== alpha[offset]) {
          const pixel = offset * 4;
          pixels[pixel] = ink[0];
          pixels[pixel + 1] = ink[1];
          pixels[pixel + 2] = ink[2];
          pixels[pixel + 3] = coverage;
        }
      }
    }
    context.putImageData(image, 0, 0);
  }

  function carveGouges(context, [centerX, centerY, degrees, length, count], id) {
    const angle = degrees * Math.PI / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const random = randomFrom(id + '|gouges');
    for (let index = 0; index < count; index++) {
      const offset = (index - (count - 1) / 2) * 5.2;
      const strokeLength = length * (0.79 + random() * 0.35);
      const halfWidth = 1.2 + random() * 0.6;
      const x = centerX - dx * (strokeLength / 2 + offset * 0.36) - dy * offset;
      const y = centerY - dy * (strokeLength / 2 + offset * 0.36) + dx * offset;
      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(
        x + dx * strokeLength * 0.33 - dy * halfWidth * 2.3,
        y + dy * strokeLength * 0.33 + dx * halfWidth * 2.3,
        x + dx * strokeLength,
        y + dy * strokeLength,
      );
      context.quadraticCurveTo(
        x + dx * strokeLength * 0.54 + dy * halfWidth * 0.8,
        y + dy * strokeLength * 0.54 - dx * halfWidth * 0.8,
        x, y,
      );
      context.fill();
    }
  }

  function blockSurface(motif) {
    let surface = blocks.get(motif);
    if (surface) return surface;

    surface = new OffscreenCanvas(blockSize, blockSize);
    const context = surface.getContext('2d', { willReadFrequently: true });
    context.setTransform(blockSize / 100, 0, 0, blockSize / 100, 0, 0);
    context.fillStyle = 'rgb(' + ink.join(', ') + ')';
    for (const shape of motif.ink.split('|')) context.fill(new Path2D(shape), 'evenodd');
    context.globalCompositeOperation = 'destination-out';
    if (motif.cut) context.fill(new Path2D(motif.cut), 'evenodd');
    if (motif.gouge) carveGouges(context, motif.gouge, motif.id);
    if (!motif.fromProof) chipEdges(context, motif.id);
    blocks.set(motif, surface);
    return surface;
  }

  function paperSurface(context) {
    const { width: canvasWidth, height: canvasHeight } = context.canvas;
    let surface = papers.get(context);
    if (surface && surface.width === canvasWidth && surface.height === canvasHeight) return surface;

    surface = new OffscreenCanvas(canvasWidth, canvasHeight);
    const paper = surface.getContext('2d');
    paper.scale(canvasWidth / width, canvasHeight / height);
    paper.fillStyle = paperColor;
    paper.fillRect(0, 0, width, height);
    paper.lineCap = 'round';
    const random = randomFrom('niltavi|ivory-block-paper');
    for (const [stroke, opacity, lineWidth] of [['#a38157', 0.11, 0.55], ['#fffaf0', 0.22, 0.7]]) {
      paper.strokeStyle = stroke;
      paper.globalAlpha = opacity;
      paper.lineWidth = lineWidth;
      paper.beginPath();
      for (let index = 0; index < 15500; index++) {
        const x = random() * width;
        const y = random() * height;
        const angle = random() * Math.PI * 2;
        const length = 0.8 + random() ** 2 * 4.2;
        paper.moveTo(x, y);
        paper.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      }
      paper.stroke();
    }
    papers.set(context, surface);
    return surface;
  }

  function drawMotif(context, id) {
    const motif = byId.get(id);
    if (!motif) throw new RangeError('Unknown woodcut motif: ' + id);
    const { width: canvasWidth, height: canvasHeight } = context.canvas;
    const size = Math.min(canvasWidth, canvasHeight);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(blockSurface(motif), (canvasWidth - size) / 2, (canvasHeight - size) / 2, size, size);
  }

  function drawPoster(context, settings = {}) {
    const { width: canvasWidth, height: canvasHeight } = context.canvas;
    if (canvasWidth <= 0 || canvasWidth * 3 !== canvasHeight * 2) {
      throw new RangeError('The woodcut canvas must have a 2:3 aspect ratio.');
    }
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(paperSurface(context), 0, 0);
    const scale = canvasWidth / width;
    context.scale(scale, scale);
    for (const { motif, x, y, size, angle } of createWoodcutLayout(settings.seed)) {
      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.drawImage(blockSurface(motif), -size / 2, -size / 2, size, size);
      context.restore();
    }
    context.restore();
  }

  const api = Object.freeze({ width, height, blockSize, defaults, motifs, createWoodcutLayout, drawMotif, drawPoster });
  if (inNode) module.exports = api;
  else globalThis.NiltaviWoodcut = api;
})();
