'use strict';

// Per-problem test harness for the coding-puzzle loop.
// Seed solutions/<slug>/solution.test.js from this file. Fill validateInput/solve
// in the paired solutions/<slug>/solution.js first and point the require below at
// it, fill the brute oracle just below, then the fixtures and inputArbitrary here.
// Run with:  node --test solutions/<slug>/solution.test.js
//
// Four things live here: the brute oracle (test-only, since it exists only to
// verify solve), hand-derived fixtures, the equivalence check for problems whose
// answer isn't unique, and the random cross-check (via fast-check) that asserts
// solve === bruteSolve. That cross-check is the load-bearing verification.

const { test } = require('node:test');
const assert = require('node:assert/strict');
// eslint-disable-next-line no-unused-vars -- stub; used once inputArbitrary/the cross-check are filled in
const fc = require('fast-check');
const { solve } = require('./solution'); // points at solutions/<slug>/solution.js once seeded

// ── Brute reference: the oracle (test-only, never shipped) ────────────────────
// Obviously correct, no cleverness - its only job is to be trustworthy so the
// cross-check can lean on it. It lives here, not in solution.js, because it is
// only ever used by these tests, and it runs on well-typed input alone (the
// cross-check only feeds good input), so it does no input validation. Write it
// for the plainest read - map/filter/reduce chains and built-in Set/Map/sort,
// clarity over speed (good-code rule 9).
// eslint-disable-next-line no-unused-vars -- stub; used by the cross-check once it's written in live
function bruteSolve(lists) {
  // Flatten every input list into one bag of elements - order of arrival doesn't matter.
  const flattened = lists.flat();

  // Sort that bag ascending, with an explicit numeric comparator (default .sort()
  // coerces to strings, which is wrong for negative/unbounded integers).
  const sorted = flattened.sort((a, b) => a - b);

  // Return the merged sorted list.
  return sorted;
}

// ── Equivalence: are two outputs both valid answers for this input? ────────────
// Many problems have more than one correct output (order unspecified, ties broken
// differently). Compare on the invariant, not the raw shape, so a valid difference
// is not flagged as a bug. `input` is the argument array, so a validity check that
// depends on the input (e.g. tie-broken selection) has what it needs.
function equivalent(input, a, b) {
  // This problem's output must be the fully sorted merge - order is exactly what's
  // under test, not don't-care (ties are equal-valued, so which tied element lands
  // at a position is moot). Plain ordered array equality, not the template's
  // order-independent default.
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);
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

test('fixture: empty', () => checkFixture('empty', [[]], []));
test('fixture: single-empty-list', () => checkFixture('single-empty-list', [[[]]], []));
test('fixture: two-empty-lists', () => checkFixture('two-empty-lists', [[[], []]], []));
test('fixture: single-list', () => checkFixture('single-list', [[[5]]], [5]));
test('fixture: one-empty-one-not', () => checkFixture('one-empty-one-not', [[[1, 2, 3], []]], [1, 2, 3]));
test('fixture: ties', () =>
  checkFixture('ties', [[[1, 4, 5], [1, 3, 4], [2, 6]]], [1, 1, 2, 3, 4, 4, 5, 6]));
test('fixture: negatives', () =>
  checkFixture('negatives', [[[-3, -1, 0], [-2, 2], [1]]], [-3, -2, -1, 0, 1, 2]));
test('fixture: throws-null', () => checkThrows('throws-null', [null], TypeError));
test('fixture: throws-string', () => checkThrows('throws-string', ['abc'], TypeError));
test('fixture: throws-non-array-element', () =>
  checkThrows('throws-non-array-element', [[[1, 2], 'bad']], TypeError));
test('fixture: throws-non-integer', () =>
  checkThrows('throws-non-integer', [[[1, 2], [1.5]]], TypeError));

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
// This block is a reference for the shape. In the real solutions/<slug>/solution.test.js,
// write the cross-check in live - uncommented, wired to the real inputArbitrary, running
// its NUM_RUNS. A commented-out cross-check is a no-op; see good-test.md.
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
