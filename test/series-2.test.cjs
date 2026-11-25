const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const screenprint = require('../src/screenprint.js');
const stamp = require('../src/stamp.js');
const woodcut = require('../src/woodcut.js');

const styles = [
  ['screenprint', screenprint, screenprint.createPosterLayout],
  ['stamp', stamp, stamp.createStampLayout],
  ['woodcut', woodcut, woodcut.createWoodcutLayout],
];

// Layout fingerprints captured from 86e43d2, before the new catalogs were installed.
const legacy = [
  [
    ['2564', '5fe89fcb66800b7dd3d3131cd245ce88c7fd28de1a097999aae548bed627e4dc'],
    ['1300j89', 'f54c3a0588adf1faa252efed1531b7512f49632b858062573bab1d09a20443ae'],
    ['v2:海边', '2bef39a2dc8ef1f382f9573fbf039293107a7d7330da37cfac16fdefa18408c4'],
  ],
  [
    ['林间', 'd3c4588315e31e54bee7ff3b1176aadc40f224a1f6decc7e1b50b929f93a4977'],
    ['fern', '7b553bda1e9fe2dc0d61a1e617ca00ecb13a0a39f547e5c6dfa669f8effa8aa0'],
    ['v2:海边', '7a7bb94475f22762693aa9d640e6f24a2b9a55b12aed28f905e72f2ffbd1eb15'],
  ],
  [
    ['黑木', '870d9d33dd7aa5f1b0bb45aa6d952f6dc5c88caf46b9990f51dad7b6d3ffad90'],
    ['crane', 'ed9160af1c3e68b6dec956d2a0a67e96b1b7c32c6e19b938715a9e8a4d08986b'],
    ['v2:海边', '259b3f6e4d84e78ad4e7c9cffe53b191f62b2c87f9ee24124e14da349b7cf8bc'],
  ],
];

function digest(data) {
  return createHash('sha256').update(data).digest('hex');
}

test('installing the new catalogs preserves the original seed namespace and layouts', () => {
  styles.forEach(([style, , layout], index) => {
    for (const [seed, expected] of legacy[index]) {
      assert.equal(digest(JSON.stringify(layout(seed))), expected, style + ': ' + seed);
      assert.deepEqual(layout(seed, 1), layout(seed));
    }
  });
});

test('each series-2 catalog has 50 distinct code motifs and their transparent assets', () => {
  for (const [style, api] of styles) {
    const ids = api.series2Motifs.map(motif => motif.id);
    const directory = path.join(__dirname, '../assets/series-2', style);
    assert.equal(ids.length, 50, style);
    assert.equal(new Set(ids).size, 50, style);
    assert.equal(new Set(api.series2Motifs.map(motif => motif.name)).size, 50, style);
    const legacyIds = new Set(api.motifs?.map(motif => motif.id));
    assert.ok(ids.every(id => !legacyIds.has(id)), style);
    assert.deepEqual(fs.readdirSync(directory).sort(), ids.map(id => id + '.png').sort(), style);
    const hashes = new Set();
    for (const id of ids) {
      const png = fs.readFileSync(path.join(directory, id + '.png'));
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', id);
      assert.equal(png.readUInt32BE(16), api.blockSize, id);
      assert.equal(png.readUInt32BE(20), api.blockSize, id);
      assert.equal(png[25], 6, id);
      hashes.add(digest(png));
    }
    assert.equal(hashes.size, ids.length, style);
  }
});

test('series-2 seeds select 24 new motifs in the existing layout and pin named motifs', () => {
  for (const [style, { series2Motifs }, layout] of styles) {
    const ids = plan => plan.map(entry => (entry.motif ?? entry).id);
    const newIds = new Set(series2Motifs.map(motif => motif.id));
    const plan = layout('新作', 2);
    assert.deepEqual(layout(' 新作 ', 2), plan);
    assert.notDeepEqual(ids(layout('回声', 2)), ids(plan));
    assert.equal(plan.length, 24, style);
    assert.equal(new Set(ids(plan)).size, 24, style);
    assert.ok(ids(plan).every(id => newIds.has(id)), style);
    for (const [index, { x, y }] of plan.entries()) {
      if (style === 'screenprint') {
        assert.equal(x, 194 + 212 * (index % 4));
        assert.equal(y, 238 + 212 * Math.floor(index / 4));
      } else {
        assert.ok(Math.abs(x - (169 + 229 * (index % 4))) <= 9);
        const center = 206 + 225 * Math.floor(index / 4) + [-18, 20, -14, 17][index % 4];
        assert.ok(Math.abs(y - center) <= 10);
      }
    }
    for (const { id } of series2Motifs) {
      const pinned = ids(layout(id, 2));
      assert.equal(pinned[0], id);
      assert.equal(new Set(pinned).size, 24, id);
    }
  }
});

test('every new woodcut keeps a primary cut and a local group of tapered cuts', () => {
  for (const { id, cut, gouge } of woodcut.series2Motifs) {
    assert.ok(cut && gouge.length === 5 && gouge.every(Number.isFinite), id);
    assert.ok(gouge[4] === 2 || gouge[4] === 3, id);
  }
});
