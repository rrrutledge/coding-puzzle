'use strict';

// Worked example of the coding-puzzle loop: Top K Frequent Elements.
// Given an integer array and a number k, return the k most frequent elements.
// The order of the returned elements is not specified, and when several elements
// tie at the k-th frequency any valid selection among them is correct.
//
// This is the source half: the shipped optimized solution only. The brute oracle
// is test-only, so it lives in the paired top-k-frequent.test.js alongside the
// fixtures, the equivalence check, and the random cross-check.

// ── Input validation: the shipped solution's guard ────────────────────────────
// topKFrequent rejects bad input here.
function validateInput(nums, k) {
  if (!Array.isArray(nums)) {
    throw new TypeError('nums must be an array');
  }
  if (!Number.isInteger(k) || k < 0) {
    throw new RangeError(`k must be a non-negative integer, got ${k}`);
  }
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

  // Count how many times each value appears - one reduce pass into a Map.
  const counts = nums.reduce((m, n) => m.set(n, (m.get(n) ?? 0) + 1), new Map());

  // buckets[c] = the values that appear exactly c times. Scattering into a
  // pre-sized array by index is a loop, not a functional pass (rule 4).
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

module.exports = { topKFrequent };
