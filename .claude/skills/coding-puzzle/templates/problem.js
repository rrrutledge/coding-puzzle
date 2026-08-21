'use strict';

// Per-problem source for the coding-puzzle loop.
// Copy this to a working file (e.g. rep.js) and fill bruteSolve and solve.
// The paired <file>.test.js requires this file and drives everything else.

// ── Input validation: shared between brute and optimized ─────────────────────
// Both must reject the same bad input identically. This isn't part of the
// algorithm the cross-check verifies, so sharing it doesn't undermine the
// oracle's independence - see good-code.md rule 7. Cover range (too high, too
// low) and type (wrong type entirely, not just wrong value) - both, not just
// one, per rule 2.
// TODO: fill in the real checks, e.g.:
// function validateInput(nums, k) {
//   if (!Array.isArray(nums)) { throw new TypeError('nums must be an array'); }
//   if (!Number.isInteger(k) || k < 1 || k > nums.length) {
//     throw new RangeError(`k must be in [1, ${nums.length}], got ${k}`);
//   }
// }

// ── Brute reference: the oracle ───────────────────────────────────────────────
// Obviously correct, no cleverness. Its only job is to be trustworthy so the
// cross-check can lean on it. Slower is fine.
function bruteSolve(/* args */) {
  // TODO: validateInput(...) first, then the sort-then-index / nested-loop
  // version you'd never doubt.
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
  // TODO: validateInput(...) first, then the better-complexity approach from
  // the approved plan.
  throw new Error('solve not implemented');
}

module.exports = { solve, bruteSolve };
