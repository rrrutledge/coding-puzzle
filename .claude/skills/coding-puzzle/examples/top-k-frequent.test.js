'use strict';

// Worked example of the coding-puzzle loop: Top K Frequent Elements.
// This is the test half: hand-derived fixtures, the equivalence check, and the
// random cross-check that leans on the oracle from the paired top-k-frequent.js.
// The one subtlety worth narrating: the answer is not unique when frequencies
// tie, so the cross-check compares the frequency profile of the selection, not
// the raw elements - comparing elements directly would flag two equally-correct
// answers as a bug.
//
// Run:  node --test examples/top-k-frequent.test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const { topKFrequent } = require('./top-k-frequent');

// ── Brute reference: the oracle (test-only, never shipped) ────────────────────
// Count, sort the distinct values by count descending, and take the first k.
// Plainly correct; O(n + m log m) where m is the distinct count. It lives here,
// not in the source file, because it is only ever used by these tests, and it
// runs on well-typed input alone (the cross-check only feeds good input), so it
// does no input validation.
function bruteTopK(nums, k) {
  const counts = nums.reduce((m, n) => m.set(n, (m.get(n) ?? 0) + 1), new Map());
  return [...counts.keys()]
    .sort((a, b) => counts.get(b) - counts.get(a))
    .slice(0, k);
}

// ── Equivalence: both outputs valid answers for this input? ───────────────────
// Two selections are both correct iff they pick the same multiset of frequencies -
// a valid top-k always takes the k highest counts. Comparing the frequency profile
// absorbs order differences and tie-broken differences at once.
function equivalent([nums, k], a, b) {
  const counts = new Map();
  for (const n of nums) {counts.set(n, (counts.get(n) ?? 0) + 1);}
  return (
    isWellFormed(a, k, counts) &&
    isWellFormed(b, k, counts) &&
    frequencyProfile(a, counts) === frequencyProfile(b, counts)
  );
}

// A selection is well-formed if it has no duplicates and picks min(k, distinct) elements.
function isWellFormed(sel, k, counts) {
  return new Set(sel).size === sel.length && sel.length === Math.min(k, counts.size);
}

// The sorted list of frequencies a selection picks - an order-independent fingerprint.
function frequencyProfile(sel, counts) {
  return sel
    .map((v) => counts.get(v))
    .sort((x, y) => x - y)
    .join(',');
}

// ── Hardcoded fixtures: derived by hand from the statement ────────────────────
// One test() call per fixture, not a loop - a GUI test explorer can only find and
// click-run a literally-named test() call, not one generated dynamically.
function checkFixture(name, input, expected) {
  assert.ok(equivalent(input, topKFrequent(...input), expected), `optimized disagrees with fixture "${name}"`);
  console.log(`fixture "${name}": ${JSON.stringify(input)} -> ${JSON.stringify(expected)}`);
}

// A boundary fixture whose expected behavior is rejection - the wrong type
// entirely, not just a wrong value. See good-test.md rule 4.
function checkThrows(name, input, ErrorType) {
  assert.throws(() => topKFrequent(...input), ErrorType, `optimized should reject fixture "${name}"`);
  console.log(`fixture "${name}": ${JSON.stringify(input)} -> throws ${ErrorType.name}`);
}

test('fixture: typical', () => checkFixture('typical', [[1, 1, 1, 2, 2, 3], 2], [1, 2]));
test('fixture: k = distinct (return all)', () =>
  checkFixture('k = distinct (return all)', [[4, 5, 6], 3], [4, 5, 6]));
test('fixture: empty, k=0', () => checkFixture('empty, k=0', [[], 0], []));
test('fixture: single element', () => checkFixture('single element', [[7], 1], [7]));
test('fixture: all duplicates', () => checkFixture('all duplicates', [[9, 9, 9], 1], [9]));
test('fixture: negatives', () =>
  checkFixture('negatives', [[-1, -1, -2, -2, -2, 3], 2], [-2, -1]));
test('fixture: tie at boundary (either is valid)', () =>
  checkFixture('tie at boundary (either is valid)', [[1, 2], 1], [1]));
test('fixture: wrong type (k is a string)', () =>
  checkThrows('k is a string', [[1, 2, 3], '2'], RangeError));
test('fixture: wrong type (nums is not an array)', () =>
  checkThrows('nums is not an array', ['not an array', 2], TypeError));

// ── Random input generator: spans the edge dimensions ─────────────────────────
// fast-check, not a hand-rolled PRNG - it already biases toward edge cases
// (empty, single-element, boundary values) and shrinks a failure to its minimal
// counterexample, which a hand-rolled generator only does if you build it
// yourself. A small element pool forces frequent duplicates and ties, which
// matters for this problem specifically; k is derived from nums so it always
// lands in the valid 0..distinct range.
const inputArbitrary = fc
  .array(fc.integer({ min: -4, max: 4 }), { maxLength: 30 })
  .chain((nums) => fc.integer({ min: 0, max: new Set(nums).size }).map((k) => [nums, k]));

// ── Cross-validation: the load-bearing check ──────────────────────────────────
test('cross-check: optimized matches brute on random inputs', () => {
  const NUM_RUNS = 2000;
  fc.assert(
    fc.property(inputArbitrary, ([nums, k]) => {
      const got = topKFrequent(nums, k);
      const want = bruteTopK(nums, k);
      assert.ok(
        equivalent([nums, k], got, want),
        `mismatch\n` +
          `  input:     ${JSON.stringify([nums, k])}\n` +
          `  optimized: ${JSON.stringify(got)}\n` +
          `  brute:     ${JSON.stringify(want)}`,
      );
    }),
    { numRuns: NUM_RUNS, seed: 1 },
  );
  console.log(`cross-check: ${NUM_RUNS} fast-check runs (seed 1), 0 mismatches`);
});
