# Merge k Sorted Lists

> Given k already-sorted arrays of integers, merge them into one fully sorted array.

## Problem

Input is an array of k arrays (plain arrays, not linked-list nodes - clarified up front), each
already sorted ascending; the outer array or any sublist may be empty. Values are integers, can be
negative, with no stated bound. Return a single array holding every element from every sublist,
sorted ascending. k can be up to ~10^4 and the total element count (N) up to ~10^4.

## Approach

**Mental model.** At any point during the merge, the next output value must be the smallest
"still-live" head among the k lists - so the problem reduces to repeatedly asking "which of these
k heads is smallest right now?" A min-heap of size k answers that in O(log k) instead of the O(k)
a linear scan over the heads would cost, and each list only ever contributes one live candidate at
a time, so the heap never needs to hold more than k entries.

**The approach.** One pass over `lists` (`validateAndSeed`) does three things at once: validates
the top-level array and every sublist and element, counts nothing extra, and seeds the heap with
`{value, listIndex, elementIndex: 0}` for each non-empty sublist's head. That seed array is then
heapified in place, O(k), from the last non-leaf node down (`siftDown` restores the heap property
at a node by swapping down toward its smaller child, via `smallestChild`). Draining is a generator
(`function* drain`): each step yields the root's value, then either advances that entry to its
list's next element and sifts it down in place, or - once its list is exhausted - moves the last
heap entry to the root, shrinks the heap, and sifts. `solve` collects the generator's output with
`[...drain(heap, lists)]`. `lists` is never mutated.

## Complexity

- **Time:** O(k + N log k) - O(N + k) to validate/seed in one pass, O(k) to heapify, then N
  emissions each paying O(log k) to re-sift the heap.
- **Space:** O(min(k, N)) auxiliary for the heap (it never holds more entries than there are lists,
  or more than there are elements), plus the required O(N) output array.
- **Tradeoff:** three viable approaches. Flatten-and-sort is O(N log N) - and is literally the
  brute oracle's algorithm, so reaching for it wouldn't have been an optimization at all. Pairwise
  divide-and-conquer merging matches the heap's O(N log k) time, but each merge level allocates a
  fresh O(N) array, versus the heap's one-time O(min(k, N)) allocation. The k-way min-heap wins on
  both counts, so it's the pick.

## Verification

- **Brute oracle** - `bruteSolve` flattens every sublist into one bag and sorts it with an explicit
  numeric comparator. No cleverness, so it's trustworthy as ground truth; it only runs on
  well-typed input, since the cross-check never feeds it anything else.
- **Fixtures** - eleven cases worked out by hand. Valid-answer cases: the fully empty input, a
  single empty sublist, two empty sublists, a single one-element list, an empty sublist mixed with
  a non-empty one, ties/duplicates spread across multiple lists, and negatives mixed with
  non-negatives. Rejected-input cases: a `null` top-level argument, a string top-level argument, a
  non-array element inside `lists`, and a non-integer element inside a sublist - each expected to
  throw `TypeError`.
- **Cross-check** - 2000 fast-check runs (seed 1) over random inputs: k and each sublist's length
  both default to `minLength: 0` (so k=0 and empty-sublists-mixed-with-non-empty arise naturally),
  values drawn from -1000..1000, each sublist generated unsorted then sorted numerically before use.
  Asserts `solve` matches `bruteSolve` via plain ordered array equality (sortedness pins the exact
  value at every position, so this isn't a multiset comparison) - 0 mismatches.
- **A real bug the cross-check couldn't catch** - the inner integer-validation check originally
  read `list.every(Number.isInteger)`, which silently skips holes in a sparse array, letting
  `undefined` slip past validation. `/code-review` caught it mid-rep; fast-check never generates
  sparse arrays, so the randomized run had no way to surface it. Fixed by replacing `.every(...)`
  with a plain indexed `for` loop over the sublist.

A few further simplifications came out of live code review: fusing validation, and heap-seeding
into the single traversal described above instead of three separate passes; dropping a single-use
`heapify` helper in favor of inlining it in `solve`; expressing the drain step as a generator
yielded into the output array rather than a manual write-index loop; and having `validateAndSeed`
return the heap array directly instead of wrapping it in an object.

## Code

- [`solution.js`](./solution.js) - the shipped `solve` (min-heap merge: `validateAndSeed`,
  `smallestChild`, `siftDown`, `drain`).
- [`solution.test.js`](./solution.test.js) - the `bruteSolve` oracle, the fixtures, and the
  randomized cross-check.

Run: `node --test solutions/merge-k-sorted-lists/solution.test.js`
