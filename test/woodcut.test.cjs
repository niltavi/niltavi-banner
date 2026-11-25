const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { createStampLayout } = require('../src/stamp.js');
const { blockSize, createWoodcutLayout, defaults, drawMotif, drawPoster, motifs } = require('../src/woodcut.js');

test('all 50 woodcuts have distinct drawings and matching transparent PNGs', () => {
  const assets = path.join(__dirname, '../assets/woodcut');
  const ids = motifs.map(motif => motif.id);
  assert.equal(ids.length, 50);
  assert.equal(new Set(ids).size, 50);
  assert.equal(new Set(motifs.map(motif => motif.ink)).size, 50);
  assert.deepEqual(fs.readdirSync(assets).sort(), ids.map(id => id + '.png').sort());
  for (const id of ids) {
    const png = fs.readFileSync(path.join(assets, id + '.png'));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', id);
    assert.equal(png.readUInt32BE(16), blockSize, id);
    assert.equal(png.readUInt32BE(20), blockSize, id);
    assert.equal(png[25], 6, id);
  }
});

test('woodcuts use the same staggered 6 × 4 layout limits as folk stamps', () => {
  // Each renderer uses a different random sequence, while both use the same cells.
  const cells = layout => layout.map(({ x, y }) => [Math.floor(x / 256), Math.floor(y / 256)]);
  const stampCells = cells(createStampLayout('潮汐'));
  const woodcuts = createWoodcutLayout('潮汐');
  assert.equal(woodcuts.length, 24);
  assert.equal(new Set(woodcuts.map(({ motif }) => motif.id)).size, 24);
  assert.deepEqual(cells(woodcuts), stampCells);
  for (let row = 0; row < 6; row++) {
    const [left, middleLeft, middleRight, right] = woodcuts.slice(row * 4, row * 4 + 4);
    assert.ok(left.y < middleLeft.y && middleRight.y < middleLeft.y && middleRight.y < right.y);
  }
});

test('default, arbitrary and motif seeds are reproducible', () => {
  assert.deepEqual(createWoodcutLayout(), createWoodcutLayout(' ' + defaults.seed + ' '));
  assert.deepEqual(createWoodcutLayout().map(({ motif }) => motif.id), motifs.slice(0, 24).map(motif => motif.id));
  assert.deepEqual(createWoodcutLayout('海岸'), createWoodcutLayout('海岸'));
  assert.notDeepEqual(createWoodcutLayout('海岸'), createWoodcutLayout('长风'));
  for (const motif of motifs) {
    assert.equal(createWoodcutLayout(motif.id)[0].motif.id, motif.id);
  }
});

test('the renderer rejects unknown motifs and incompatible poster dimensions', () => {
  assert.throws(() => drawMotif({}, 'missing'), RangeError);
  assert.throws(() => drawPoster({ canvas: { width: 400, height: 400 } }), RangeError);
});
