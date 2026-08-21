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
const { solve } = require('./solution');

// ── Brute reference: the oracle (test-only, never shipped) ────────────────────
// Obviously correct, no cleverness - its only job is to be trustworthy so the
// cross-check can lean on it. It lives here, not in solution.js, because it is
// only ever used by these tests, and it runs on well-typed input alone (the
// cross-check only feeds good input), so it does no input validation. Write it
// for the plainest read - map/filter/reduce chains and built-in Set/Map/sort,
// clarity over speed (good-code rule 9).
// eslint-disable-next-line no-unused-vars -- stub; used by the cross-check once it's written in live
function bruteSolve(/* args */) {
  // TODO: the sort-then-index / functional version you'd never doubt.
  throw new Error('bruteSolve not implemented');
}

// ── Equivalence: are two outputs both valid answers for this input? ────────────
// Many problems have more than one correct output (order unspecified, ties broken
// differently). Compare on the invariant, not the raw shape, so a valid difference
// is not flagged as a bug. `input` is the argument array, so a validity check that
// depends on the input (e.g. tie-broken selection) has what it needs.
function equivalent(input, a, b) {
  // Default: order-independent structural equality. Replace when validity depends
  // on the input - see examples/top-k-frequent.test.js for the tie-aware form.
  // This is a single-use step, so it stays an inline block, not its own function
  // (good-code rule 12). The only hand-written part is order-independence, which no
  // standard routine provides: sort arrays into a canonical order first. The
  // element-by-element comparison underneath delegates to the built-in deep-equal
  // (rule 11) rather than a hand-rolled `.every()`.
  const canonical = (x) => (Array.isArray(x) ? [...x].map(String).sort() : x);
  let equal;
  try {
    assert.deepEqual(canonical(a), canonical(b));
    equal = true;
  } catch {
    equal = false;
  }
  return equal;
}

// ── Mock oracle builder: turns an edge list into a hasMessaged closure ────────
// `hasMessaged` is a black-box function parameter, not literal data, so each
// fixture's message graph is expressed as an ordered edge list ([a, b] means
// a has messaged b) and turned into the (a, b) => boolean the solve signature
// expects via a Set lookup. This helper is test-only and lives in this file.
function buildHasMessaged(edges) {
  const sent = new Set(edges.map(([a, b]) => `${a},${b}`));
  return (a, b) => sent.has(`${a},${b}`);
}

// ── Hardcoded fixtures: locked after the sample-cases gate ────────────────────
// Each expected value is worked out by hand from the statement, never copied from
// a solution's output. Span the clarified boundaries: empty, single, dupes, ties,
// k=0 and k=n, negatives. Reviewed as a table during the sample-cases gate, but
// written below as one test() call per fixture rather than a loop over the table -
// a GUI test explorer can only find and click-run a literally-named test() call,
// not one generated dynamically inside a loop.
// `input` here is always [people, hasMessagedFn]; the log line reports `people`
// and the edge list separately (not raw JSON.stringify(input)) since a function
// element serializes to `null` and would say nothing useful.
function checkFixture(name, input, expected, edges) {
  assert.ok(equivalent(input, solve(...input), expected), `optimized disagrees with fixture "${name}"`);
  console.log(
    `fixture "${name}": people=${JSON.stringify(input[0])} edges=${JSON.stringify(edges)} -> ${JSON.stringify(expected)}`,
  );
}

// A boundary fixture whose expected behavior is rejection - out of range or the
// wrong type entirely - rather than a value. See good-test.md rule 4.
function checkThrows(name, input, ErrorType, edges) {
  assert.throws(() => solve(...input), ErrorType, `optimized should reject fixture "${name}"`);
  console.log(
    `fixture "${name}": people=${JSON.stringify(input[0])} edges=${JSON.stringify(edges)} -> throws ${ErrorType.name}`,
  );
}

test('fixture: empty', () => {
  checkFixture('empty', [[], buildHasMessaged([])], [], []);
});

test('fixture: single (N=1)', () => {
  checkFixture('single (N=1)', [[1], buildHasMessaged([])], [], []);
});

test('fixture: clear qualifier', () => {
  const edges = [
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  checkFixture('clear qualifier', [[1, 2, 3], buildHasMessaged(edges)], [1], edges);
});

test('fixture: complete graph', () => {
  const edges = [
    [1, 2],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 2],
  ];
  checkFixture('complete graph', [[1, 2, 3], buildHasMessaged(edges)], [], edges);
});

test('fixture: empty graph', () => {
  checkFixture('empty graph', [[1, 2, 3], buildHasMessaged([])], [], []);
});

test('fixture: near-miss (one inbound)', () => {
  const edges = [
    [1, 2],
    [1, 3],
    [2, 1],
  ];
  checkFixture('near-miss (one inbound)', [[1, 2, 3], buildHasMessaged(edges)], [], edges);
});

test('fixture: invalid type in people', () => {
  checkThrows('invalid type in people', [[1, '2', 3], () => false], TypeError, []);
});

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
