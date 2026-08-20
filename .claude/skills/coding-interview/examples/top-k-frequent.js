'use strict';

// Worked example of the coding-interview loop: Top K Frequent Elements.
// Given an integer array and a number k, return the k most frequent elements.
// The order of the returned elements is not specified, and when several elements
// tie at the k-th frequency any valid selection among them is correct.
//
// This is the source half: the brute oracle and the shipped optimized solution.
// The paired top-k-frequent.test.js has the fixtures, the equivalence check, and
// the random cross-check.

// ── Brute reference: the oracle ───────────────────────────────────────────────
// Count, sort the distinct values by count descending, take the first k. Plainly
// correct; O(n + m log m) where m is the distinct count. Not shipped.
function bruteTopK(nums, k) {
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
  // Count how many times each value appears.
  const counts = new Map();
  for (const n of nums) {counts.set(n, (counts.get(n) ?? 0) + 1);}

  // buckets[c] = the values that appear exactly c times.
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [value, c] of counts) {buckets[c].push(value);}

  // Walk buckets from the highest count down, collecting values until we have k.
  const result = [];
  for (let c = buckets.length - 1; c >= 1 && result.length < k; c--) {
    for (const value of buckets[c]) {
      if (result.length === k) {break;}
      result.push(value);
    }
  }
  return result;
}

module.exports = { topKFrequent, bruteTopK };
