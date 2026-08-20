'use strict';

// Worked example of the coding-interview loop: Top K Frequent Elements.
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
const { topKFrequent, bruteTopK } = require('./top-k-frequent');

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
const FIXTURES = [
  { name: 'typical', input: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
  { name: 'k = distinct (return all)', input: [[4, 5, 6], 3], expected: [4, 5, 6] },
  { name: 'empty, k=0', input: [[], 0], expected: [] },
  { name: 'single element', input: [[7], 1], expected: [7] },
  { name: 'all duplicates', input: [[9, 9, 9], 1], expected: [9] },
  { name: 'negatives', input: [[-1, -1, -2, -2, -2, 3], 2], expected: [-2, -1] },
  { name: 'tie at boundary (either is valid)', input: [[1, 2], 1], expected: [1] },
];

for (const f of FIXTURES) {
  test(`fixture: ${f.name}`, () => {
    assert.ok(
      equivalent(f.input, bruteTopK(...f.input), f.expected),
      `brute disagrees with fixture "${f.name}"`,
    );
    assert.ok(
      equivalent(f.input, topKFrequent(...f.input), f.expected),
      `optimized disagrees with fixture "${f.name}"`,
    );
  });
}

// ── Random input generator: spans the edge dimensions ─────────────────────────
// Small value pool forces frequent duplicates and ties; length reaches 0 and 1;
// negatives appear; k ranges 0..distinct so both extremes get hit.
function randomInput(rng) {
  const len = Math.floor(rng() * 12); // 0..11, so empty and single occur
  const nums = [];
  for (let i = 0; i < len; i++) {
    nums.push(Math.floor(rng() * 9) - 4); // pool -4..4, heavy repeats
  }
  const distinct = new Set(nums).size;
  const k = Math.floor(rng() * (distinct + 1)); // 0..distinct
  return [nums, k];
}

function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

// ── Cross-validation: the load-bearing check ──────────────────────────────────
test('cross-check: optimized matches brute on random inputs', () => {
  const TRIALS = 2000;
  for (let i = 0; i < TRIALS; i++) {
    const rng = makeRng(i + 1);
    const input = randomInput(rng);
    const got = topKFrequent(...input);
    const want = bruteTopK(...input);
    assert.ok(
      equivalent(input, got, want),
      `mismatch on trial ${i}\n` +
        `  input:     ${JSON.stringify(input)}\n` +
        `  optimized: ${JSON.stringify(got)}\n` +
        `  brute:     ${JSON.stringify(want)}`,
    );
  }
});
