'use strict';

// Per-problem source for the coding-puzzle loop - the SHIPPED artifact only.
// The brute oracle is test-only, so it lives in solution.test.js, not here.

// ── Input validation: the shipped solution's guard ────────────────────────────
// solve rejects bad input here. Cover range (too high, too low) and type (wrong
// type entirely, not just wrong value) - both, not just one, per good-code.md
// rule 2.
function validateInput(people, hasMessaged) {
  // Reject the wrong shape outright: a non-array roster, or a missing/non-callable oracle.
  if (!Array.isArray(people)) {
    throw new TypeError(`people must be an array, got ${typeof people}`);
  }
  if (typeof hasMessaged !== 'function') {
    throw new TypeError(`hasMessaged must be a function, got ${typeof hasMessaged}`);
  }

  // Reject a bad person id: wrong type first (a string, null, a fraction), then out of range.
  people.forEach((person) => {
    if (!Number.isInteger(person)) {
      throw new TypeError(`people must contain only integers, got ${JSON.stringify(person)}`);
    }
    if (person <= 0) {
      throw new RangeError(`people must contain only positive integers, got ${person}`);
    }
  });
}

// ── Disqualification: permanent, and counted exactly once ─────────────────────
// Marks one person as out for good and reports how many live candidates that
// removed - 1 the first time, 0 when they were already out - so the caller's
// running count of live candidates stays in step without re-scanning `alive`.
function kill(alive, idx) {
  const eliminated = alive[idx] ? 1 : 0;
  alive[idx] = false;

  return eliminated;
}

// ── One oracle call, read for both of the two facts it carries ────────────────
// A call is worth making only while one of its endpoints could still qualify;
// once both are out it can teach us nothing, so it is skipped. The answer always
// disqualifies exactly one of the two: a true send means the receiver has
// received a message, a false send means the sender missed someone. Returns how
// many live candidates the call eliminated (0 or 1).
function askIfUseful(people, hasMessaged, alive, fromIdx, toIdx) {
  let eliminated = 0;

  if (alive[fromIdx] || alive[toIdx]) {
    const sent = hasMessaged(people[fromIdx], people[toIdx]);
    eliminated = kill(alive, sent ? toIdx : fromIdx);
  }

  return eliminated;
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────
/**
 * Finds everyone who has sent a message to every one of the other N-1 people and
 * has never received a message from any of them. `people` is neither mutated nor
 * assumed sorted; ids come back in ascending order (at most one can qualify for
 * N >= 2, but each person is judged independently on their own evidence).
 * @param {number[]} people - distinct positive integer person ids
 * @param {(a: number, b: number) => boolean} hasMessaged - oracle: true iff a sent b a message
 * @returns {number[]} the qualifying ids, ascending; [] when nobody qualifies (including N < 2)
 * @throws {TypeError} if people is not an array, hasMessaged is not a function, or an id is not an integer
 * @throws {RangeError} if an id is not positive
 * Time: O(N^2)   Space: O(N)
 * Each ordered pair (i, j) is asked at most once, so at most N*(N-1) oracle calls -
 * half the 2*N*(N-1) a per-candidate check costs, since that re-asks each pair from
 * both sides. Auxiliary space is the one live/dead flag per person.
 */
function solve(people, hasMessaged) {
  // Reject malformed input before spending a single oracle call.
  validateInput(people, hasMessaged);

  // Everyone starts a live candidate and dies on the first disqualifying answer.
  // Nobody qualifies without someone else to message, so N=0 and N=1 start with
  // no live candidates at all - a lone person does not qualify vacuously - which
  // makes the sweep below a no-op and the answer [].
  const MIN_PEOPLE = 2; // one person to message and one to hear back from
  const n = people.length;
  const alive = new Array(n).fill(n >= MIN_PEOPLE);
  let aliveCount = n >= MIN_PEOPLE ? n : 0;

  // Visit each unordered pair once and ask it in both directions, letting every
  // answer eliminate whichever endpoint it disqualifies. An explicit loop, not a
  // functional pass: it carries mutable state across the pairs and stops early.
  // Both headers carry `aliveCount > 0`, so the sweep ends the moment no live
  // candidate remains - a dead person never revives, so nothing later can matter.
  for (let i = 0; i < n - 1 && aliveCount > 0; i += 1) {
    for (let j = i + 1; j < n && aliveCount > 0; j += 1) {
      aliveCount -= askIfUseful(people, hasMessaged, alive, i, j);
      aliveCount -= askIfUseful(people, hasMessaged, alive, j, i);
    }
  }

  // A survivor was never skipped over (a pair with a live endpoint is always
  // asked), so it messaged everyone and heard back from no one. `filter` builds a
  // fresh array, so sorting it leaves the caller's `people` untouched.
  const qualifiers = people.filter((_, idx) => alive[idx]).sort((a, b) => a - b);

  return qualifiers;
}

module.exports = { solve };
