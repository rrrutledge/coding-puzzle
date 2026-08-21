'use strict';

// Per-problem source for the coding-puzzle loop - the SHIPPED artifact only.
// Seed solutions/<slug>/solution.js from this file and fill validateInput and
// solve. The brute oracle is test-only, so it lives in solution.test.js, not
// here. The paired solution.test.js requires this file and drives everything else.

// ── Input validation: the shipped solution's guard ────────────────────────────
// solve rejects bad input here. Cover range (too high, too low) and type (wrong
// type entirely, not just wrong value) - both, not just one, per good-code.md
// rule 2.
// eslint-disable-next-line no-unused-vars -- stub; called by solve once filled in
function validateInput(/* args */) {
  // TODO: throw on bad input before any work, e.g.:
  // if (!Array.isArray(nums)) { throw new TypeError('nums must be an array'); }
  // if (!Number.isInteger(k) || k < 1 || k > nums.length) {
  //   throw new RangeError(`k must be in [1, ${nums.length}], got ${k}`);
  // }
  throw new Error('validateInput not implemented');
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

module.exports = { solve };
