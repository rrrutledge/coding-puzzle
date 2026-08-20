# K Closest Points to Origin

> Given a list of 2-D points and a number `k`, return the `k` points nearest the origin.

## Problem

Input is an array of points, each `[x, y]`, and an integer `k`.
Return the `k` points closest to the origin `(0, 0)` by Euclidean distance.
The result may be in any order.

## Clarifications

- **How are ties at the k-th distance handled?** - Every point tied at the boundary distance is included, so the output can be longer than `k` (returning an arbitrary `k` of the tied points would be a different, harder-to-verify contract).
- **Does the output need to be sorted?** - No. Any order is accepted, which is what lets us stop at a partition instead of a full sort.
- **What is the valid range of `k`?** - `[1, n]`. `k = 0` and `k > n` are rejected.
- **Distance metric** - Euclidean, but compared as *squared* distance: it preserves ordering, avoids `sqrt`, and stays exact so ties compare with real equality instead of float rounding.

Two assumptions hold on every problem and were not asked:

- The input is never mutated - both solutions read `points` by index and build their own scratch.
- The code defends against malformed input: `points` must be a non-empty array of `[x, y]` pairs of finite numbers, and `k` must be an integer in `[1, n]`, else it throws `TypeError` or `RangeError`.

## Approach

**Mental model.** We never need the points *sorted* by distance - only *partitioned* around the k-th smallest distance, because any order is an acceptable answer. Quickselect finds that k-th element in linear average time without paying for a full sort. The wrinkle is heavy ties: many points can share a distance, so a two-way partition would scatter the equal values. A three-way (Dutch-flag) partition instead groups everything equal to the pivot into one block, which is exactly what a "include all ties at the boundary" contract needs, and it keeps the all-duplicates case from degrading to quadratic.

**The approach.** Build two parallel scratch arrays - the squared distances and the points they came from - and swap them together, so a distance and its point never drift apart during partitioning. Run an iterative randomized three-way quickselect, narrowing the active window `[lo, hi]` each round until the target index `k - 1` lands inside the equal block. At that point the scratch is globally partitioned: everything before the equal block is strictly closer, everything after is strictly farther. The prefix of the points scratch through the end of the equal block is the whole answer, ties included, with no second filtering pass.

## Complexity

- **Time:** O(n) average, O(n^2) worst case. A random pivot makes the worst case vanishingly unlikely, and the three-way partition guards against the duplicate-heavy degenerate input.
- **Space:** O(n) auxiliary for the two scratch arrays, plus up to O(n) for the output.
- **Tradeoff:** the three viable approaches are sort-by-distance at O(n log n), a max-heap of size `k` at O(n log k) time and O(k) space, and quickselect at O(n) average. The heap wins when `k` is tiny relative to `n` or the input streams. Here `k` can be as large as `n` and we want the entire closest *set* (with its ties), so quickselect's linear average beats the sort's log factor, and the three-way partition is what makes the tie-heavy case cheap - so quickselect is the pick.

## Verification

- **Brute oracle** - map every point to its squared distance, sort a copy, take the k-th smallest as the cutoff, and return every point at or under it. No cleverness, so it is trustworthy as the reference; ties fall out of the `<=` automatically.
- **Fixtures** - twelve hand-derived cases spanning single point, `k = n`, duplicate points, a tie at the boundary, negative coordinates, and rejection cases for a wrong-type `k`, a non-numeric coordinate, `k` below and above range, and an empty array.
- **Cross-check** - 2000 fast-check runs over random inputs drawn from a small coordinate pool (`-5..5`, so ties are frequent), asserting the optimized and brute outputs are equivalent. Neither is trusted as ground truth: the check recomputes the canonical answer independently from `[points, k]` and confirms both candidates match it, so a validly-different ordering is never flagged as a bug.

## Code

- [`solution.js`](./solution.js) - the shipped `solve` (quickselect) and the `bruteSolve` reference it is checked against.
- [`solution.test.js`](./solution.test.js) - the fixtures and the randomized cross-check.

Run: `node --test solutions/k-closest-points/solution.test.js`
