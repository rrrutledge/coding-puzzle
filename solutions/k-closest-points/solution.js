'use strict';

// K Closest Points to Origin - the shipped solution and its brute oracle.
// See README.md in this folder for the problem, approach, and complexity.
// solution.test.js requires this file and drives the fixtures + cross-check.

// ── Input validation: shared between brute and optimized ─────────────────────
// Both must reject the same bad input identically. This isn't part of the
// algorithm the cross-check verifies, so sharing it doesn't undermine the
// oracle's independence - see good-code.md rule 7. Cover range (too high, too
// low) and type (wrong type entirely, not just wrong value) - both, not just
// one, per rule 2. Points shape is checked before k's range, since k's bound
// depends on points.length.
function validateInput(points, k) {
  if (!Array.isArray(points)) {
    throw new TypeError('points must be an array');
  }
  if (points.length === 0) {
    throw new RangeError('points must not be empty');
  }
  for (const point of points) {
    const isPair = Array.isArray(point) && point.length === 2;
    const isNumericPair = isPair
      && typeof point[0] === 'number' && Number.isFinite(point[0])
      && typeof point[1] === 'number' && Number.isFinite(point[1]);
    if (!isNumericPair) {
      throw new TypeError('each point must be a 2-element array of finite numbers');
    }
  }
  if (!Number.isInteger(k)) {
    throw new TypeError('k must be an integer');
  }
  if (k < 1 || k > points.length) {
    throw new RangeError(`k must be in [1, ${points.length}], got ${k}`);
  }
}

// ── Brute reference: the oracle ───────────────────────────────────────────────
// Obviously correct, no cleverness. Its only job is to be trustworthy so the
// cross-check can lean on it. Slower is fine.
function bruteSolve(points, k) {
  // Reject bad input before doing any work.
  validateInput(points, k);

  // Squared distance preserves ordering vs. true Euclidean distance, so no
  // sqrt and no float rounding - exact equality for ties. Read points by
  // index only; never mutate it.
  const dist = points.map((point) => point[0] * point[0] + point[1] * point[1]);

  // Find the k-th smallest distance by sorting a copy.
  const sortedDist = [...dist].sort((a, b) => a - b);
  const cutoff = sortedDist[k - 1];

  // Every point whose distance is at or below the cutoff is a winner - ties
  // fall out automatically. Unsorted, untrimmed.
  return points.filter((point, i) => dist[i] <= cutoff);
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────

// Swaps the same pair of indices in both scratch arrays together, so the
// distances and their points never drift out of alignment during partitioning.
function swap(distScratch, pointsScratch, i, j) {
  const tempDist = distScratch[i];
  distScratch[i] = distScratch[j];
  distScratch[j] = tempDist;

  const tempPoint = pointsScratch[i];
  pointsScratch[i] = pointsScratch[j];
  pointsScratch[j] = tempPoint;
}

/**
 * Returns the points closest to the origin by squared Euclidean distance, in
 * any order, including every point tied at the k-th boundary distance.
 * @param {number[][]} points - array of [x, y] pairs; not mutated.
 * @param {number} k - how many closest points to select.
 * @returns {number[][]} the closest points, ties included (may exceed k).
 * Time: O(n) average, O(n^2) worst case (randomized pivot + three-way
 * partition guard against the duplicate-heavy degenerate case).
 * Space: O(n) auxiliary (the two scratch arrays) plus up to O(n) output.
 */
function solve(points, k) {
  // Reject bad input before doing any work.
  validateInput(points, k);

  // Build parallel scratch arrays so distances can be partitioned alongside
  // the points they belong to, without ever writing to the caller's array.
  const distScratch = new Array(points.length);
  const pointsScratch = new Array(points.length);
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    distScratch[i] = point[0] * point[0] + point[1] * point[1];
    pointsScratch[i] = point;
  }

  // Iterative randomized three-way quickselect for the k-th smallest distance:
  // narrow [lo, hi] each round until target index t lands in the equal block.
  const t = k - 1;
  let lo = 0;
  let hi = points.length - 1;
  let boundary = -1;
  while (boundary === -1) {
    // Choose a random pivot within the current window.
    const pivotIndex = lo + Math.floor(Math.random() * (hi - lo + 1));
    const pivotValue = distScratch[pivotIndex];

    // Three-way (Dutch flag) partition of [lo, hi] around pivotValue, via
    // swap, into [< pivotValue][== pivotValue][> pivotValue].
    let lt = lo;
    let gt = hi;
    let i = lo;
    while (i <= gt) {
      if (distScratch[i] < pivotValue) {
        swap(distScratch, pointsScratch, lt, i);
        lt++;
        i++;
      } else if (distScratch[i] > pivotValue) {
        swap(distScratch, pointsScratch, i, gt);
        gt--;
      } else {
        i++;
      }
    }

    // t landing left, right, or inside the equal block picks the next window
    // (excluding the equal block either way) or ends the search.
    if (t < lt) {
      hi = lt - 1;
    } else if (t > gt) {
      lo = gt + 1;
    } else {
      boundary = gt;
    }
  }

  // The scratch points array is now partitioned in place around the k-th
  // smallest distance; the prefix through the equal block is the full
  // answer, ties included, with no further filtering needed.
  return pointsScratch.slice(0, boundary + 1);
}

module.exports = { solve, bruteSolve };
