const assert = require('node:assert/strict');
const test = require('node:test');
const { createPosterLayout, defaults, drawPoster, width, height } = require('../src/screenprint.js');

test('the same seed recreates the plan and another seed varies it', () => {
  const plan = createPosterLayout('1300j89');
  assert.deepEqual(createPosterLayout(' 1300j89 '), plan);
  assert.deepEqual(createPosterLayout('1300j89'), plan);
  assert.notDeepEqual(createPosterLayout('绿洲'), plan);
  assert.deepEqual(createPosterLayout(''), createPosterLayout(defaults.seed));
});

test('24 cells keep their spacing and cover every shape, pattern, and ink', () => {
  for (const seed of ['2564', '1300j89', '绿洲', 'alpha', '000']) {
    const plan = createPosterLayout(seed);
    assert.equal(plan.length, 24);
    assert.equal(new Set(plan.map(motif => motif.shape)).size, 5);
    assert.equal(new Set(plan.map(motif => motif.pattern)).size, 6);
    assert.equal(new Set(plan.map(motif => motif.ink)).size, 4);
    assert.equal(plan.filter(motif => motif.overhang).length, 3);
    assert.equal(plan.filter(motif => motif.sprig).length, 3);
    assert.equal(plan.filter(motif => motif.open).length, 3);
    plan.forEach((motif, index) => {
      assert.equal(motif.x, 194 + 212 * (index % 4));
      assert.equal(motif.y, 238 + 212 * Math.floor(index / 4));
      assert.ok(!motif.open || (!motif.overprint && !motif.overhang && !motif.sprig));
    });
  }
});

test('drawing rejects dimensions outside the 2:3 format', () => {
  assert.equal(width * 3, height * 2);
  assert.throws(() => drawPoster({ canvas: { width, height: width } }), RangeError);
  assert.throws(() => drawPoster({ canvas: { width: 0, height: 0 } }), RangeError);
});

function recordingContext() {
  const fills = new Set();
  const context = new Proxy({ canvas: { width, height } }, {
    get(target, key) {
      if (key in target) return target[key];
      return () => {};
    },
    set(target, key, value) {
      if (key === 'fillStyle' || key === 'strokeStyle') fills.add(value);
      target[key] = value;
      return true;
    },
  });
  return { context, fills };
}

test('paper colour defaults to the cream stock and can be replaced', () => {
  globalThis.Path2D ??= class { moveTo() {} lineTo() {} closePath() {} };
  const standard = recordingContext();
  drawPoster(standard.context, { seed: '1300j89' });
  assert.ok(standard.fills.has(defaults.paper));

  const custom = recordingContext();
  drawPoster(custom.context, { seed: '1300j89', paper: '#f5f1e6' });
  assert.ok(custom.fills.has('#f5f1e6'));
  assert.ok(!custom.fills.has(defaults.paper));
});
