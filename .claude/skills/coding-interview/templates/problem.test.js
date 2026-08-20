'use strict';

// Per-problem template for the coding-interview loop.
// Copy this to a working file, fill the four slots, run with:  node --test <file>
//
// Three artifacts live here together on purpose:
//   bruteSolve  - the obviously-correct oracle (not shipped)
//   solve       - the optimized, shipped solution
//   the harness - runs both on many random inputs and asserts they agree
// The optimized === brute cross-check is the load-bearing verification. Everything
// else supports it.

const { test } = require('node:test');
const assert = require('node:assert/strict');

// ── Brute reference: the oracle ───────────────────────────────────────────────
// Obviously correct, no cleverness. Its only job is to be trustworthy so the
// cross-check can lean on it. Slower is fine.
function bruteSolve(/* args */) {
  // TODO: the sort-then-index / nested-loop version you'd never doubt.
  throw new Error('bruteSolve not implemented');
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────
/**
 * TODO one-line contract: what it takes and what it returns.
 * @param {*} TODO
 * @returns {*} TODO
 * Time: O(?)   Space: O(?)
 */
function solve(/* args */) {
  // TODO: the better-complexity approach from the approved plan.
  throw new Error('solve not implemented');
}

// ── Equivalence: are two outputs both valid answers for this input? ────────────
// Many problems have more than one correct output (order unspecified, ties broken
// differently). Compare on the invariant, not the raw shape, so a valid difference
// is not flagged as a bug. `input` is the argument array, so a validity check that
// depends on the input (e.g. tie-broken selection) has what it needs.
function equivalent(input, a, b) {
  // Default: order-independent structural equality. Replace when validity depends
  // on the input - see examples/top-k-frequent.test.js for the tie-aware form.
  return deepEqualUnordered(a, b);
}

function deepEqualUnordered(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    const sa = [...a].map(String).sort();
    const sb = [...b].map(String).sort();
    return sa.every((v, i) => v === sb[i]);
  }
  try {
    assert.deepEqual(a, b);
    return true;
  } catch {
    return false;
  }
}

// ── Hardcoded fixtures: locked after the sample-cases gate ────────────────────
// Each expected value is worked out by hand from the statement, never copied from
// a solution's output. Span the clarified boundaries: empty, single, dupes, ties,
// k=0 and k=n, negatives.
const FIXTURES = [
  // { name: 'empty',  input: [[], 0],       expected: [] },
  // { name: 'single', input: [[5], 1],      expected: [5] },
];

for (const f of FIXTURES) {
  test(`fixture: ${f.name}`, () => {
    assert.ok(
      equivalent(f.input, bruteSolve(...f.input), f.expected),
      `brute disagrees with fixture "${f.name}"`,
    );
    assert.ok(
      equivalent(f.input, solve(...f.input), f.expected),
      `optimized disagrees with fixture "${f.name}"`,
    );
  });
}

// ── Random input generator ────────────────────────────────────────────────────
// Deliberately reaches the edge dimensions: sometimes empty, sometimes one
// element, forces duplicates and negatives, and varies k across its whole range -
// so a boundary bug actually gets generated instead of hidden.
function randomInput(rng) {
  // TODO: build and return the argument array, e.g. [nums, k].
  throw new Error('randomInput not implemented');
}

// Tiny seeded PRNG so every trial is reproducible and a failure can be re-run.
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
    const got = solve(...input);
    const want = bruteSolve(...input);
    assert.ok(
      equivalent(input, got, want),
      `mismatch on trial ${i}\n` +
        `  input:     ${JSON.stringify(input)}\n` +
        `  optimized: ${JSON.stringify(got)}\n` +
        `  brute:     ${JSON.stringify(want)}`,
    );
  }
});

module.exports = { solve, bruteSolve };
