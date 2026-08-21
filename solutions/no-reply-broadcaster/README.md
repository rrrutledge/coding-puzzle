# No-Reply Broadcaster

> Given a group of people and an oracle `hasMessaged(a, b)`, find whoever messaged every other person but never received a message back from any of them.

## Problem

Input is an array of distinct positive integer person ids `people`, and a black-box oracle `hasMessaged(a, b)` that returns `true` if person `a` has sent person `b` a message. Find every person who sent a message to all `N-1` other people and received a message from none of them. Return the qualifying ids as an array.

## Approach

**Mental model.** Every `hasMessaged(a, b)` answer carries two facts at once: `true` means `b` received a message (so `b` can never qualify), `false` means `a` missed someone (so `a` can never qualify). So instead of checking each candidate in isolation - which re-asks the same ordered pair twice, once as one candidate's outgoing check and again as another's incoming check - the algorithm keeps one `alive` flag per person and lets each answer kill whichever endpoint it disqualifies. Disqualification is permanent, so no pair needs to be asked more than once.

There's a structural fact worth naming even though the code doesn't rely on it: for `N >= 2` at most one person can ever qualify. If `A` qualified, `A` would have messaged every other person, including any other candidate `B` - so `B` would have received a message and be disqualified. The optimized solution doesn't shortcut on this (it still evaluates every person on their own evidence, per the agreed approach), but it explains why the algorithm's `aliveCount` tends to collapse fast on real inputs.

**The approach.** Sweep every unordered pair of people once, asking the oracle in both directions (`hasMessaged(i, j)` and `hasMessaged(j, i)`), skipping a call only once both endpoints of that direction are already dead. Each answer kills exactly one side: the receiver on a `true`, the sender on a `false`. A running `aliveCount` folds into both loop headers as the early-stop condition, so the sweep quits the moment nobody is left alive. `N < 2` returns `[]` immediately (a lone person doesn't vacuously qualify - agreed explicitly during clarification), which falls out naturally since there's no one to check against. The survivors, if any, are collected and sorted ascending; the input array is never mutated.

## Complexity

- **Time:** O(N^2) worst case, O(N) expected/average case. Each ordered pair is asked at most once, so calls are bounded by `N*(N-1)` - half of what a naive per-candidate check costs, since that approach asks every ordered pair twice (once from each side). The worst case is only reached when the oracle withholds disqualifying evidence until the pair order happens to reach it (e.g. a genuine sole survivor forces `2*(N-1)` unavoidable calls, since a still-alive candidate can never be skipped). In the average case, each person has roughly a 3/4 chance of being disqualified by the very first pair that touches them, so `aliveCount` collapses to 0 quickly and the sweep exits long before N^2 calls.
- **Space:** O(N) auxiliary for the `alive` array, plus the output.
- **Tradeoff:** since the partner explicitly ruled out the town-judge-style single-candidate elimination (which would bring worst-case calls down to O(N) by narrowing to one candidate and verifying it), the real lever here is redundant-call avoidance rather than asymptotic class - both this approach and a naive per-candidate check are O(N^2) worst case, but this one asks roughly half as many oracle calls by never re-querying the same ordered pair.

## Verification

- **Brute oracle** - for each candidate, filter the rest of the group and confirm every one of them was messaged and none of them sent one back, via `.every()`. No cleverness, so it's trustworthy as the reference; the guard against an empty "others" list is what keeps a lone person (N=1) from vacuously passing.
- **Fixtures** - seven cases worked out by hand: an empty group, a single person, a clear single qualifier, a complete message graph (everyone disqualified), an empty message graph (nobody has full outgoing coverage), a near-miss (one person messaged everyone but also received one message back), and a wrong-type element in the people array (rejected with `TypeError`).
- **Cross-check** - 300 fast-check runs over randomly generated `(people, hasMessaged)` pairs, asserting the optimized and brute outputs agree. The generator mixes uniform-random message graphs with hand-biased shapes (empty graph, complete graph, a planted qualifier, a near-miss) since a uniformly random graph almost never contains a real qualifier on its own and would rarely exercise the interesting case.

## Code

- [`solution.js`](./solution.js) - the shipped `solve` (pairwise elimination sweep) and the `validateInput` guard.
- [`solution.test.js`](./solution.test.js) - the `bruteSolve` reference, the fixtures, and the randomized cross-check.

Run: `node --test solutions/no-reply-broadcaster/solution.test.js`
