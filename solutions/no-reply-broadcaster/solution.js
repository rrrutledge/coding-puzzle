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

// ── Memoizing oracle proxy: one real call per ordered pair ────────────────────
// The cost metric is real oracle invocations, and elimination and verification
// overlap: every fact elimination learns about the survivor is a fact
// verification would otherwise re-ask. Wrapping the oracle in a per-pair cache
// lets solve query freely while the real oracle is hit at most once per distinct
// (a, b) - so verification reuses what elimination already discovered with zero
// bookkeeping in the algorithm itself. Takes the oracle as a parameter (rule 5)
// and returns a same-signature function; the returned closure over its own cache
// is the memoizer's essence, the one legitimate reason a function nests here.
function memoizeOracle(hasMessaged) {
  const answered = new Map();
  return (a, b) => {
    const key = `${a},${b}`;
    if (!answered.has(key)) {
      answered.set(key, hasMessaged(a, b));
    }
    return answered.get(key);
  };
}

// ── Optimized solution: the shipped artifact ──────────────────────────────────
/**
 * Finds everyone who has sent a message to every one of the other N-1 people and
 * has never received a message from any of them. `people` is neither mutated nor
 * copied. At most one person can qualify for N >= 2 (whoever qualifies has messaged
 * every other person, so everyone else has received something), so the answer is an
 * array of at most one id - already in ascending order, no sort needed.
 * @param {number[]} people - distinct positive integer person ids
 * @param {(a: number, b: number) => boolean} hasMessaged - oracle: true iff a sent b a message
 * @returns {number[]} the qualifying id in a one-element array, or [] when nobody qualifies (including N < 2)
 * @throws {TypeError} if people is not an array, hasMessaged is not a function, or an id is not an integer
 * @throws {RangeError} if an id is not positive
 * Time: O(N)   Space: O(N)
 * At most 3N-4 real oracle calls for N >= 2 (2N-2 best case): N-1 to eliminate down
 * to one candidate, then up to 2*(N-1) to confirm that candidate in both directions,
 * less the checks the elimination pass already cached. Auxiliary space is the pair
 * cache, O(N) distinct pairs asked, plus two scalars - the candidate index and a flag.
 */
function solve(people, hasMessaged) {
  // Reject malformed input before spending a single oracle call.
  validateInput(people, hasMessaged);

  // Query through a memoizing proxy so any pair asked twice - always some of the
  // survivor's checks, seen once during elimination and again during verification
  // - costs only one real oracle call. Both loops below call `ask`, never the raw
  // oracle, so the reuse is automatic and the loops stay free of cache bookkeeping.
  const ask = memoizeOracle(hasMessaged);

  const n = people.length;

  // Elimination: one call per person, and whichever way it answers exactly one of
  // the two is out for good - a true send means the receiver has received a
  // message, a false send means the sender missed someone. So the running
  // candidate is always the only person seen so far who could still qualify, and
  // nobody is ever eliminated without an observed fact that disqualifies them.
  // An explicit loop, not a functional pass: it carries the candidate across
  // iterations, and it runs to completion because every person must be consumed.
  let candidateIdx = 0;
  for (let i = 1; i < n; i += 1) {
    if (!ask(people[candidateIdx], people[i])) {
      candidateIdx = i;
    }
  }

  // Verification: the survivor is only a candidate - the calls above were made
  // against earlier candidates, and no incoming direction was ever asked - so
  // confirm it against everyone else, both directions. The proxy serves any of
  // these already learned during elimination from cache. `verified` starts false
  // below the minimum roster size, which is what makes N=0 and N=1 answer []
  // rather than passing vacuously with nobody to check against.
  const MIN_PEOPLE = 2; // someone to message, and someone who could have replied
  let verified = n >= MIN_PEOPLE;
  for (let i = 0; i < n && verified; i += 1) {
    if (i !== candidateIdx) {
      verified = ask(people[candidateIdx], people[i]) === true && ask(people[i], people[candidateIdx]) === false;
    }
  }

  // A confirmed candidate is the one and only answer; anything else means nobody qualifies.
  const qualifiers = verified ? [people[candidateIdx]] : [];

  return qualifiers;
}

module.exports = { solve };
