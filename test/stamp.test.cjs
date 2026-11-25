const assert = require('node:assert/strict');
const test = require('node:test');
const { createStampLayout, defaults, drawPoster, motifs, width, height } = require('../src/stamp.js');
const ids = layout => layout.map(entry => entry.motif.id);

test('the catalog contains 50 distinct hand-drawn motifs', () => {
  assert.equal(motifs.length, 50);
  assert.equal(new Set(motifs.map(motif => motif.id)).size, 50);
  assert.equal(new Set(motifs.map(motif => motif.name)).size, 50);
  assert.equal(new Set(motifs.map(motif => motif.ink)).size, 50);
  motifs.forEach(motif => assert.ok(motif.ink && motif.cuts && motif.weight > 0));
});

test('the default stamp sheet preserves the four subjects from the reference', () => {
  assert.deepEqual(ids(createStampLayout()), ['ginkgo', 'snail', 'mushroom', 'acorn']);
  assert.deepEqual(createStampLayout('  '), createStampLayout(defaults.seed));
});

test('seeded sheets contain four unique motifs and reproduce their positions', () => {
  const layout = createStampLayout('山径');
  assert.deepEqual(createStampLayout(' 山径 '), layout);
  assert.notDeepEqual(ids(createStampLayout('海边')), ids(layout));
  assert.equal(layout.length, 4);
  assert.equal(new Set(ids(layout)).size, 4);
  for (const [index, { x, y, size, angle }] of layout.entries()) {
    assert.equal(x < width / 2, index % 2 === 0);
    assert.ok(x > 0 && x < width && y > 0 && y < height);
    assert.ok(size > 0 && Number.isFinite(angle));
  }
});

test('a motif ID can put every catalog entry first without repetition', () => {
  for (const motif of motifs) {
    const layout = ids(createStampLayout(motif.id));
    assert.equal(layout[0], motif.id);
    assert.equal(new Set(layout).size, 4);
  }
});

test('the stamp renderer rejects incompatible canvas dimensions', () => {
  assert.equal(width * 3, height * 2);
  assert.throws(() => drawPoster({ canvas: { width: 400, height: 400 } }), RangeError);
});
