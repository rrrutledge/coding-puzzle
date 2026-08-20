'use strict';

// Per-problem test harness for the coding-interview loop.
// Fill bruteSolve/solve in the paired source file first (e.g. rep.js), point
// the require below at it, then fill the fixtures and inputArbitrary here.
// Run with:  node --test <file>
//
// Three things live here: hand-derived fixtures, the equivalence check for
// problems whose answer isn't unique, and the random cross-check (via
// fast-check) that asserts solve === bruteSolve. That cross-check is the
// load-bearing verification.

// eslint-disable-next-line no-unused-vars -- stub; used once the fixture/cross-check test() calls are added below
const { test } = require('node:test');
const assert = require('node:assert/strict');
// eslint-disable-next-line no-unused-vars -- stub; used once inputArbitrary/the cross-check are filled in
const fc = require('fast-check');
const { solve, bruteSolve } = require('./problem'); // TODO: point at the working source file

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
  let equal;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      equal = false;
    } else {
      const sa = [...a].map(String).sort();
      const sb = [...b].map(String).sort();
      equal = sa.every((v, i) => v === sb[i]);
    }
  } else {
    try {
      assert.deepEqual(a, b);
      equal = true;
    } catch {
      equal = false;
    }
  }
  return equal;
}

// ── Hardcoded fixtures: locked after the sample-cases gate ────────────────────
// Each expected value is worked out by hand from the statement, never copied from
// a solution's output. Span the clarified boundaries: empty, single, dupes, ties,
// k=0 and k=n, negatives. Reviewed as a table during the sample-cases gate, but
// written below as one test() call per fixture rather than a loop over the table -
// a GUI test explorer can only find and click-run a literally-named test() call,
// not one generated dynamically inside a loop.
// eslint-disable-next-line no-unused-vars -- stub; used once test() calls are added below
function checkFixture(name, input, expected) {
  assert.ok(equivalent(input, bruteSolve(...input), expected), `brute disagrees with fixture "${name}"`);
  assert.ok(equivalent(input, solve(...input), expected), `optimized disagrees with fixture "${name}"`);
  console.log(`fixture "${name}": ${JSON.stringify(input)} -> ${JSON.stringify(expected)}`);
}

// A boundary fixture whose expected behavior is rejection - out of range or the
// wrong type entirely - rather than a value. See good-test.md rule 4.
// eslint-disable-next-line no-unused-vars -- stub; used once test() calls are added below
function checkThrows(name, input, ErrorType) {
  assert.throws(() => bruteSolve(...input), ErrorType, `brute should reject fixture "${name}"`);
  assert.throws(() => solve(...input), ErrorType, `optimized should reject fixture "${name}"`);
  console.log(`fixture "${name}": ${JSON.stringify(input)} -> throws ${ErrorType.name}`);
}

// TODO: one test() per locked fixture, e.g.:
// test('fixture: empty', () => checkFixture('empty', [[], 0], []));
// test('fixture: single', () => checkFixture('single', [[5], 1], [5]));
// test('fixture: wrong type', () => checkThrows('k is a string', [[1, 2, 3], '2'], TypeError));

// ── Random input generator ────────────────────────────────────────────────────
// fast-check, not a hand-rolled PRNG - it already biases toward edge cases
// (empty, single-element, boundary values) and shrinks a failure to its
// minimal counterexample. Compose it from the problem's own shape; see
// examples/top-k-frequent.test.js for a worked one (a small element pool to
// force duplicates/ties, k derived from nums via .chain()).
// TODO: build the real arbitrary, e.g.:
// const inputArbitrary = fc
//   .array(fc.integer({ min: -100, max: 100 }))
//   .chain((nums) => fc.integer({ min: 1, max: Math.max(nums.length, 1) }).map((k) => [nums, k]));

// ── Cross-validation: the load-bearing check ──────────────────────────────────
// TODO: uncomment once inputArbitrary is filled in.
// test('cross-check: optimized matches brute on random inputs', () => {
//   const NUM_RUNS = 2000;
//   fc.assert(
//     fc.property(inputArbitrary, (input) => {
//       const got = solve(...input);
//       const want = bruteSolve(...input);
//       assert.ok(
//         equivalent(input, got, want),
//         `mismatch\n` +
//           `  input:     ${JSON.stringify(input)}\n` +
//           `  optimized: ${JSON.stringify(got)}\n` +
//           `  brute:     ${JSON.stringify(want)}`,
//       );
//     }),
//     { numRuns: NUM_RUNS, seed: 1 },
//   );
//   console.log(`cross-check: ${NUM_RUNS} fast-check runs (seed 1), 0 mismatches`);
// });
