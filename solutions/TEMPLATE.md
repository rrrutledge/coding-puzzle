# <Problem name>

> One line: what the problem asks for, in plain words.

## Problem

State the problem as it was posed - the input, the output, and the rule that ties them.
Keep it to what an interviewer would say out loud, not a re-derivation.

## Clarifications

The questions whose answer changes the algorithm, each with the short answer we settled on. Keep these to a line each.

- **<question>** - <answer>.
- **<question>** - <answer>.

Plus the two standing assumptions, held on every problem: the input is never mutated, and malformed input is rejected rather than trusted.

## Approach

Lead with the mental model - the intuition for *why* this works, the invariant it keeps, or the insight that rules out the naive approach - before any steps.

Then the approach in a few sentences: the data structures, the core step that sets the complexity, and how the clarified boundaries fall out of it.

## Complexity

- **Time:** <O(...)>, with the average/worst split named if they differ, and why.
- **Space:** <O(...)> auxiliary, plus the output.
- **Tradeoff:** the viable alternatives (e.g. sort vs heap-of-size-k vs quickselect), what each costs, and which we picked and why - usually the k-vs-n call.

## Verification

How correctness was established in the open, not asserted:

- **Brute oracle** - the obviously-correct reference the optimized solution is checked against, and why it is trustworthy.
- **Fixtures** - the hand-checked cases, listed in plain English (what each one covers: a single item, a boundary value, a tie, a rejected bad input), with no code or literal data shown.
- **Cross-check** - the randomized run that asserts optimized and brute agree, the trial count, and the invariant they are compared on (so a validly-different answer is not misread as a bug).

## Code

- [`solution.js`](./solution.js) - the shipped solution (and the brute reference it is checked against).
- [`solution.test.js`](./solution.test.js) - the fixtures and the randomized cross-check.

Run: `node --test solutions/<slug>/solution.test.js`
