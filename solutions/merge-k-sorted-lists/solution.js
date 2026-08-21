'use strict';

// Per-problem source for the coding-puzzle loop - the SHIPPED artifact only.
// Seed solutions/<slug>/solution.js from this file and fill validateInput and
// solve. The brute oracle is test-only, so it lives in solution.test.js, not
// here. The paired solution.test.js requires this file and drives everything else.

// ── Input validation: the shipped solution's guard ────────────────────────────
// Reject a non-array top level, a non-array sublist, or a non-integer leaf
// value before any work begins; sortedness itself is trusted per the contract.
function validateInput(lists) {
  if (!Array.isArray(lists)) {
    throw new TypeError('lists must be an array of arrays');
  }
  if (!lists.every((list) => Array.isArray(list))) {
    throw new TypeError('every element of lists must be an array');
  }
  if (!lists.every((list) => list.every((value) => Number.isInteger(value)))) {
    throw new TypeError('every list element must be an integer');
  }
}

// ── Heap helpers: array-backed binary min-heap over {value, listIndex, elementIndex} ──
// Return the index of the smallest of a node and its (up to two) children.
function smallestChild(heap, index) {
  const left = 2 * index + 1;
  const right = 2 * index + 2;
  let smallest = index;
  if (left < heap.length && heap[left].value < heap[smallest].value) {
    smallest = left;
  }
  if (right < heap.length && heap[right].value < heap[smallest].value) {
    smallest = right;
  }
  return smallest;
}

// Sift the entry at index down until it is no larger than either child.
function siftDown(heap, index) {
  let current = index;
  let smallest = smallestChild(heap, current);
  while (smallest !== current) {
    [heap[current], heap[smallest]] = [heap[smallest], heap[current]];
    current = smallest;
    smallest = smallestChild(heap, current);
  }
}

// Turn an arbitrary array of entries into a valid min-heap in place, O(k).
function heapify(heap) {
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i -= 1) {
    siftDown(heap, i);
  }
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────
/**
 * Merge k already-sorted integer arrays into one sorted array, ascending.
 * @param {number[][]} lists - k arrays, each sorted ascending; lists or sublists may be empty.
 * @returns {number[]} A new array holding every element from every sublist, sorted ascending. Never mutates lists.
 * Time: O(k + N log k) - O(N+k) to validate/size, O(k) to heapify, N emissions each O(log k) to re-sift.
 * Space: O(min(k, N)) auxiliary for the heap, plus the required O(N) output array.
 */
function solve(lists) {
  // Reject malformed input before doing any work.
  validateInput(lists);

  // Total element count across all lists sizes the preallocated output.
  const total = lists.reduce((sum, list) => sum + list.length, 0);
  const merged = new Array(total);

  // Seed the heap with the current head of every non-empty list, then heapify once in place.
  const heap = lists.reduce((entries, list, listIndex) => {
    if (list.length > 0) {
      entries.push({ value: list[0], listIndex, elementIndex: 0 });
    }
    return entries;
  }, []);
  heapify(heap);

  // Repeatedly emit the global-minimum head, then advance (or drop) that entry's list.
  let writeIndex = 0;
  while (heap.length > 0) {
    const root = heap[0];
    merged[writeIndex] = root.value;
    writeIndex += 1;
    const nextIndex = root.elementIndex + 1;
    if (nextIndex < lists[root.listIndex].length) {
      heap[0] = { value: lists[root.listIndex][nextIndex], listIndex: root.listIndex, elementIndex: nextIndex };
      siftDown(heap, 0);
    } else {
      heap[0] = heap[heap.length - 1];
      heap.pop();
      if (heap.length > 0) {
        siftDown(heap, 0);
      }
    }
  }

  // Return the fully merged, sorted array.
  return merged;
}

module.exports = { solve };
