'use strict';

// Worked example of the coding-interview loop: Top K Frequent Elements.
// Given an integer array and a number k, return the k most frequent elements.
// The order of the returned elements is not specified, and when several elements
// tie at the k-th frequency any valid selection among them is correct.
//
// This is the source half: the brute oracle and the shipped optimized solution.
// The paired top-k-frequent.test.js has the fixtures, the equivalence check, and
// the random cross-check.

// ── Input validation: shared between brute and optimized ─────────────────────
// Both must reject the same bad input identically. This isn't part of the
// algorithm the cross-check verifies (which only ever generates well-typed
// inputs), so sharing it doesn't undermine the oracle's independence - see
// good-code.md rule 7.
function validateInput(nums, k) {
  if (!Array.isArray(nums)) {
    throw new TypeError('nums must be an array');
  }
  if (!Number.isInteger(k) || k < 0) {
    throw new RangeError(`k must be a non-negative integer, got ${k}`);
  }
}

// ── Brute reference: the oracle ───────────────────────────────────────────────
// Reject bad input first, then count, sort the distinct values by count
// descending, and take the first k. Plainly correct; O(n + m log m) where m is
// the distinct count. Not shipped.
function bruteTopK(nums, k) {
  validateInput(nums, k);
  const counts = new Map();
  for (const n of nums) {counts.set(n, (counts.get(n) ?? 0) + 1);}
  return [...counts.keys()]
    .sort((a, b) => counts.get(b) - counts.get(a))
    .slice(0, k);
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────
/**
 * Return the k most frequent elements of nums, in any order.
 * Ties at the k-th frequency resolve to any valid selection.
 * @param {number[]} nums - the input array (not mutated)
 * @param {number} k - how many of the most frequent elements to return, 0..distinct
 * @returns {number[]} k elements, the most frequent in nums
 * Time: O(n)   Space: O(n)
 * Bucket sort by frequency beats a heap-of-size-k (O(n log k)) here because a
 * count can be at most n, so frequencies index directly into n+1 buckets - no
 * comparisons. The heap wins only when k is tiny and distinct count is huge and
 * materializing n buckets is the cost that dominates.
 */
function topKFrequent(nums, k) {
  // Reject bad input before doing any work.
  validateInput(nums, k);

  // Count how many times each value appears.
  const counts = new Map();
  for (const n of nums) {counts.set(n, (counts.get(n) ?? 0) + 1);}

  // buckets[c] = the values that appear exactly c times.
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [value, c] of counts) {buckets[c].push(value);}

  // Walk buckets from the highest count down, collecting values until we have k.
  // "Enough collected" is folded into each loop's own test expression, so both
  // loops terminate themselves the moment result is full - no break needed.
  const result = [];
  for (let c = buckets.length - 1; c >= 1 && result.length < k; c--) {
    const bucket = buckets[c];
    for (let i = 0; i < bucket.length && result.length < k; i++) {
      result.push(bucket[i]);
    }
  }
  return result;
}

module.exports = { topKFrequent, bruteTopK };
