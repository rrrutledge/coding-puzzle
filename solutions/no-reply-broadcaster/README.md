# No-Reply Broadcaster

> Given a group of people and an oracle `hasMessaged(a, b)`, find whoever messaged every other person but never received a message back from any of them.

## Problem

Input is an array of distinct positive integer person ids `people`, and a black-box oracle `hasMessaged(a, b)` that returns `true` if person `a` has sent person `b` a message. Find every person who sent a message to all `N-1` other people and received a message from none of them. Return the qualifying ids as an array.

## Approach

**Mental model.** Every `hasMessaged(a, b)` answer carries two facts at once: `true` means `b` received a message (so `b` can never qualify), `false` means `a` missed someone (so `a` can never qualify). For `N >= 2` at most one person can ever qualify: if `A` qualified, `A` would have messaged every other person, including any other candidate `B` - so `B` would have received a message and be disqualified. This is the "celebrity problem" (known-by-everyone, knows-no-one) with the relation flipped - sent-to-everyone, received-from-no-one - so the same single-candidate elimination trick applies: sweep the roster with one running candidate, spending exactly one oracle call per person. Each call either confirms the candidate survives (the person just checked received something, so they're out) or replaces the candidate (the current one missed someone, so they're out and the new person takes over). The invariant: after consuming a prefix of the roster, the running candidate is the only person in that prefix who could still qualify, because every elimination is backed by an observed fact that directly contradicts qualifying - so the true qualifier, if one exists, is never eliminated.

**The approach.** Two phases. Elimination: one pass over the roster, one `hasMessaged` call per person, `N-1` calls total, producing a single surviving candidate. Verification (mandatory - the survivor is only a candidate, since most of the elimination calls were made against earlier, already-replaced candidates and the incoming direction was never asked at all): confirm the survivor against every other person in both directions, stopping at the first failure via the loop's own header (`i < n && verified`) rather than a `break`. `N < 2` returns `[]` directly - `verified` starts `false` below the two-person minimum, so a lone person never passes vacuously. The result is at most one id, so no sort is needed; the input array is never mutated.

## Complexity

- **Time:** O(N) worst case. At most `3*(N-1)` oracle calls: `N-1` for elimination, plus up to `2*(N-1)` for verification (which can also exit early on the first failing check).
- **Space:** O(1) auxiliary - two scalars (the candidate's index and a verified flag), plus the output.
- **Tradeoff:** an earlier version of this solution deliberately avoided exploiting the at-most-one-qualifier proof (checking every person independently via a pairwise elimination sweep, O(N^2) worst case / O(N) average case, O(N) space) - the call at the time was that hard-coding a "stop after one" assumption traded local, per-person readability for a global invariant the reader has to trust. After the write-up made the tradeoff concrete, the call was reversed: the proof is sound, so paying for checks it rules out is pure waste. The gain here is asymptotic, not constant-factor - O(N) worst case beats O(N^2) outright. What's given up: this shape depends on at most one qualifier being possible; if the qualification rule were ever loosened (e.g. dropping the "received from no one" requirement), the mutual-exclusion proof would break and the independent per-person check would become the correct structure again.

## Verification

- **Brute oracle** - for each candidate, filter the rest of the group and confirm every one of them was messaged and none of them sent one back, via `.every()`. No cleverness, so it's trustworthy as the reference; the guard against an empty "others" list is what keeps a lone person (N=1) from vacuously passing.
- **Fixtures** - seven cases worked out by hand: an empty group, a single person, a clear single qualifier, a complete message graph (everyone disqualified), an empty message graph (nobody has full outgoing coverage), a near-miss (one person messaged everyone but also received one message back), and a wrong-type element in the people array (rejected with `TypeError`).
- **Cross-check** - 300 fast-check runs over randomly generated `(people, hasMessaged)` pairs, asserting the optimized and brute outputs agree. The generator mixes uniform-random message graphs with hand-biased shapes (empty graph, complete graph, a planted qualifier, a near-miss) since a uniformly random graph almost never contains a real qualifier on its own and would rarely exercise the interesting case.

## Code

- [`solution.js`](./solution.js) - the shipped `solve` (pairwise elimination sweep) and the `validateInput` guard.
- [`solution.test.js`](./solution.test.js) - the `bruteSolve` reference, the fixtures, and the randomized cross-check.

Run: `node --test solutions/no-reply-broadcaster/solution.test.js`
