'use strict';

// K Closest Points to Origin - fixtures and the load-bearing cross-check.
// See README.md in this folder for the problem, approach, and complexity.
// Run with:  node --test solutions/k-closest-points/solution.test.js
//
// Three things live here: hand-derived fixtures, the equivalence check for
// problems whose answer isn't unique, and the random cross-check (via
// fast-check) that asserts solve === bruteSolve. That cross-check is the
// load-bearing verification.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const { solve } = require('./solution');

// ── Brute reference: the oracle (test-only, never shipped) ────────────────────
// Obviously correct, no cleverness - its only job is to be trustworthy so the
// cross-check can lean on it. It lives here, not in solution.js, because it is
// only ever used by these tests, and it runs on well-typed input alone (the
// cross-check only feeds good input), so it does no input validation.
function bruteSolve(points, k) {
  // Squared distance preserves ordering vs. true Euclidean distance, so no
  // sqrt and no float rounding - exact equality for ties. Read points by
  // index only; never mutate it.
  const dist = points.map((point) => point[0] * point[0] + point[1] * point[1]);

  // Find the k-th smallest distance by sorting a copy.
  const sortedDist = [...dist].sort((a, b) => a - b);
  const cutoff = sortedDist[k - 1];

  // Every point whose distance is at or below the cutoff is a winner - ties
  // fall out automatically. Unsorted, untrimmed.
  return points.filter((point, i) => dist[i] <= cutoff);
}

// ── Equivalence: are two outputs both valid answers for this input? ────────────
// Many problems have more than one correct output (order unspecified, ties broken
// differently). Compare on the invariant, not the raw shape, so a valid difference
// is not flagged as a bug. `input` is the argument array, so a validity check that
// depends on the input (e.g. tie-broken selection) has what it needs.
//
// This problem's ties mean raw structural equality is wrong: neither solve nor
// bruteSolve is trusted as ground truth. Instead, recompute the canonical answer
// directly from [points, k] - sort squared distances, take the k-th smallest as
// the threshold, and every point at or under that threshold is correct (which is
// why output length can exceed k) - then check both candidates against it.
function equivalent(input, a, b) {
  const [points, k] = input;

  const sortedDist2 = points
    .map((point) => point[0] * point[0] + point[1] * point[1])
    .sort((x, y) => x - y);
  const threshold = sortedDist2[k - 1];

  const expected = points
    .filter((point) => point[0] * point[0] + point[1] * point[1] <= threshold)
    .map((point) => `${point[0]},${point[1]}`)
    .sort();

  function isWellFormed(output) {
    const got = [...output].map((point) => `${point[0]},${point[1]}`).sort();
    return got.length === expected.length && got.every((v, i) => v === expected[i]);
  }

  return isWellFormed(a) && isWellFormed(b);
}

// ── Hardcoded fixtures: locked after the sample-cases gate ────────────────────
// Each expected value is worked out by hand from the statement, never copied from
// a solution's output. Span the clarified boundaries: empty, single, dupes, ties,
// k=0 and k=n, negatives. Reviewed as a table during the sample-cases gate, but
// written below as one test() call per fixture rather than a loop over the table -
// a GUI test explorer can only find and click-run a literally-named test() call,
// not one generated dynamically inside a loop.
function checkFixture(name, input, expected) {
  assert.ok(equivalent(input, solve(...input), expected), `optimized disagrees with fixture "${name}"`);
  console.log(`fixture "${name}": ${JSON.stringify(input)} -> ${JSON.stringify(expected)}`);
}

// A boundary fixture whose expected behavior is rejection - out of range or the
// wrong type entirely - rather than a value. See good-test.md rule 4.
function checkThrows(name, input, ErrorType) {
  assert.throws(() => solve(...input), ErrorType, `optimized should reject fixture "${name}"`);
  console.log(`fixture "${name}": ${JSON.stringify(input)} -> throws ${ErrorType.name}`);
}

test('fixture: example 1', () => checkFixture('example 1', [[[1, 3], [-2, 2]], 1], [[-2, 2]]));
test('fixture: example 2', () =>
  checkFixture('example 2', [[[3, 3], [5, -1], [-2, 4]], 2], [[3, 3], [-2, 4]]));
test('fixture: single point', () => checkFixture('single point', [[[5, 5]], 1], [[5, 5]]));
test('fixture: k equals n', () =>
  checkFixture('k equals n', [[[3, 3], [5, -1], [-2, 4]], 3], [[3, 3], [5, -1], [-2, 4]]));
test('fixture: tie at boundary', () =>
  checkFixture('tie at boundary', [[[1, 0], [0, 1], [3, 4]], 1], [[1, 0], [0, 1]]));
test('fixture: duplicate point', () =>
  checkFixture('duplicate point', [[[1, 1], [1, 1], [5, 5]], 2], [[1, 1], [1, 1]]));
test('fixture: negative coordinates', () =>
  checkFixture('negative coordinates', [[[-3, -4], [2, 2], [-1, -1]], 1], [[-1, -1]]));
test('fixture: k is a string', () =>
  checkThrows('k is a string', [[[1, 2], [3, 4]], '1'], TypeError));
test('fixture: non-numeric coordinate', () =>
  checkThrows('non-numeric coordinate', [[[1, 2], ['a', 4]], 1], TypeError));
test('fixture: k below range', () => checkThrows('k below range', [[[1, 2], [3, 4]], 0], RangeError));
test('fixture: k above range', () => checkThrows('k above range', [[[1, 2], [3, 4]], 3], RangeError));
test('fixture: empty points array', () => checkThrows('empty points array', [[], 1], RangeError));

// ── Random input generator ────────────────────────────────────────────────────
// fast-check, not a hand-rolled PRNG - it already biases toward edge cases
// (empty, single-element, boundary values) and shrinks a failure to its
// minimal counterexample. Compose it from the problem's own shape; see
// examples/top-k-frequent.test.js for a worked one (a small element pool to
// force duplicates/ties, k derived from nums via .chain()).
// A small coordinate pool (11 values, 121 possible points) forces frequent
// duplicate points and boundary ties while still giving some variety.
const coordArb = fc.integer({ min: -5, max: 5 });
const pointArb = fc.tuple(coordArb, coordArb).map(([x, y]) => [x, y]);
const pointsArb = fc.array(pointArb, { minLength: 1, maxLength: 30 });
// k is always valid by construction - out-of-range/wrong-type k and points
// are intentionally out of scope here; the fixture lane covers those via
// checkThrows.
const inputArbitrary = pointsArb.chain((points) => fc
  .integer({ min: 1, max: points.length })
  .map((k) => [points, k]));

// ── Cross-validation: the load-bearing check ──────────────────────────────────
test('cross-check: optimized matches brute on random inputs', () => {
  const NUM_RUNS = 2000;
  fc.assert(
    fc.property(inputArbitrary, (input) => {
      const got = solve(...input);
      const want = bruteSolve(...input);
      assert.ok(
        equivalent(input, got, want),
        `mismatch\n`
          + `  input:     ${JSON.stringify(input)}\n`
          + `  optimized: ${JSON.stringify(got)}\n`
          + `  brute:     ${JSON.stringify(want)}`,
      );
    }),
    { numRuns: NUM_RUNS, seed: 1 },
  );
  console.log(`cross-check: ${NUM_RUNS} fast-check runs (seed 1), 0 mismatches`);
});
