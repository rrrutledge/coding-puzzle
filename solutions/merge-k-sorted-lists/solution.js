'use strict';

// Per-problem source for the coding-puzzle loop - the SHIPPED artifact only.
// Seed solutions/<slug>/solution.js from this file and fill validateInput and
// solve. The brute oracle is test-only, so it lives in solution.test.js, not
// here. The paired solution.test.js requires this file and drives everything else.

// ── Input validation + heap seeding: one pass over lists ──────────────────────
// Walk lists once: check each sublist's shape and every element's type, and
// while already there, fold the element count into total and seed the heap
// with each non-empty sublist's head. Throwing partway through is fine -
// nothing built so far escapes solve.
function validateAndSeed(lists) {
  // Reject anything but an array at the top level before touching its contents.
  if (!Array.isArray(lists)) {
    throw new TypeError('lists must be an array of arrays');
  }

  // Accumulate the total element count and the heap's seed entries as we go.
  let total = 0;
  const heap = [];

  // Walk each list once: validate its shape and element types, fold its
  // length into total, and seed the heap with its head if it has one.
  for (let listIndex = 0; listIndex < lists.length; listIndex += 1) {
    const list = lists[listIndex];
    if (!Array.isArray(list)) {
      throw new TypeError('every element of lists must be an array');
    }
    for (let elementIndex = 0; elementIndex < list.length; elementIndex += 1) {
      if (!Number.isInteger(list[elementIndex])) {
        throw new TypeError('every list element must be an integer');
      }
    }
    total += list.length;
    if (list.length > 0) {
      heap.push({ value: list[0], listIndex, elementIndex: 0 });
    }
  }

  // Return the totals and seed entries for solve to heapify and drain.
  return { total, heap };
}

// ── Heap helpers: array-backed binary min-heap over {value, listIndex, elementIndex} ──
// Return the index of the smallest of a node and its (up to two) children.
function smallestChild(heap, index) {
  // Binary heap children of i: left = 2i+1, right = 2i+2.
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

// ── Drain: yield the heap's contents in ascending order ───────────────────────
// Each yield emits the current global minimum, then advances that entry's
// list to its next element (replace-top sift) or drops the entry entirely
// once its list is exhausted (move-last-to-root, shrink, sift).
function* drain(heap, lists) {
  while (heap.length > 0) {
    // Emit the current global minimum - the heap's root.
    const root = heap[0];
    yield root.value;

    // Advance that entry's list to its next element (replace-top sift), or
    // drop the entry once its list is exhausted (move-last-to-root, shrink, sift).
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
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────
/**
 * Merge k already-sorted integer arrays into one sorted array, ascending.
 * @param {number[][]} lists - k arrays, each sorted ascending; lists or sublists may be empty.
 * @returns {number[]} A new array holding every element from every sublist, sorted ascending. Never mutates lists.
 * Time: O(k + N log k) - O(N+k) to validate/size/seed, O(k) to heapify, N emissions each O(log k) to re-sift.
 * Space: O(min(k, N)) auxiliary for the heap, plus the required O(N) output array.
 */
function solve(lists) {
  // Validate, total the element count, and seed the heap with each list's head, in one pass.
  const { total, heap } = validateAndSeed(lists);
  const merged = new Array(total);

  // Heapify the seeded heads in place, O(k), starting from the last non-leaf node: floor(length/2)-1.
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i -= 1) {
    siftDown(heap, i);
  }

  // Drain the heap in ascending order, writing each emitted value into merged by index.
  let writeIndex = 0;
  for (const value of drain(heap, lists)) {
    merged[writeIndex] = value;
    writeIndex += 1;
  }

  // Return the fully merged, sorted array.
  return merged;
}

module.exports = { solve };
