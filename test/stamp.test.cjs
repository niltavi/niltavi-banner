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
  assert.deepEqual(ids(createStampLayout()).slice(0, 4), ['ginkgo', 'snail', 'mushroom', 'acorn']);
  assert.deepEqual(createStampLayout('  '), createStampLayout(defaults.seed));
});

test('seeded sheets reproduce their 24 unique motifs and positions', () => {
  const layout = createStampLayout('山径');
  assert.deepEqual(createStampLayout(' 山径 '), layout);
  assert.notDeepEqual(ids(createStampLayout('海边')), ids(layout));
  assert.equal(layout.length, 24);
  assert.equal(new Set(ids(layout)).size, 24);
});

test('the 24 stamps keep six rows and four vertically staggered columns', () => {
  for (const seed of [defaults.seed, '山径', '海边', 'fern']) {
    const layout = createStampLayout(seed);
    assert.equal(layout.length, 24);
    assert.equal(new Set(ids(layout)).size, 24);
    for (let row = 0; row < 6; row++) {
      const group = layout.slice(row * 4, row * 4 + 4);
      for (const [column, { x, y, size, angle }] of group.entries()) {
        assert.equal(Math.floor(x / (width / 4)), column);
        assert.equal(Math.floor(y / (height / 6)), row);
        assert.ok(size > 0 && Number.isFinite(angle));
      }
      const [first, second, third, fourth] = group;
      assert.ok(first.y < second.y && third.y < second.y && third.y < fourth.y);
      const ys = group.map(stamp => stamp.y);
      assert.ok(Math.max(...ys) - Math.min(...ys) < 64);
    }
  }
});

test('a motif ID can put every catalog entry first without repetition', () => {
  for (const motif of motifs) {
    const layout = ids(createStampLayout(motif.id));
    assert.equal(layout[0], motif.id);
    assert.equal(new Set(layout).size, 24);
  }
});

test('the stamp renderer rejects incompatible canvas dimensions', () => {
  assert.equal(width * 3, height * 2);
  assert.throws(() => drawPoster({ canvas: { width: 400, height: 400 } }), RangeError);
});
