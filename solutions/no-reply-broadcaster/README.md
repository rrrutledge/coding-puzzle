# No-Reply Broadcaster

> Given a group of people and an oracle `hasMessaged(a, b)`, find whoever messaged every other person but never received a message back from any of them.

## Problem

Input is an array of distinct positive integer person ids `people`, and a black-box oracle `hasMessaged(a, b)` that returns `true` if person `a` has sent person `b` a message. Find every person who sent a message to all `N-1` other people and received a message from none of them. Return the qualifying ids as an array.

## Approach

**Mental model.** Every `hasMessaged(a, b)` answer carries two facts at once: `true` means `b` received a message (so `b` can never qualify), `false` means `a` missed someone (so `a` can never qualify). For `N >= 2` at most one person can ever qualify: if `A` qualified, `A` would have messaged every other person, including any other candidate `B` - so `B` would have received a message and be disqualified. This is the "celebrity problem" (known-by-everyone, knows-no-one) with the relation flipped - sent-to-everyone, received-from-no-one - so the same single-candidate elimination trick applies: sweep the roster with one running candidate, spending exactly one oracle call per person. Each call either confirms the candidate survives (the person just checked received something, so they're out) or replaces the candidate (the current one missed someone, so they're out and the new person takes over). The invariant: after consuming a prefix of the roster, the running candidate is the only person in that prefix who could still qualify, because every elimination is backed by an observed fact that directly contradicts qualifying - so the true qualifier, if one exists, is never eliminated.

**The approach.** Two phases. Elimination: one pass over the roster, one `hasMessaged` call per person, `N-1` calls total, producing a single surviving candidate. Verification (mandatory - the survivor is only a candidate, since most of the elimination calls were made against earlier, already-replaced candidates and the incoming direction was never asked at all): confirm the survivor against every other person in both directions, stopping at the first failure via the loop's own header (`i < n && verified`) rather than a `break`. `N < 2` returns `[]` directly - `verified` starts `false` below the two-person minimum, so a lone person never passes vacuously. The result is at most one id, so no sort is needed; the input array is never mutated.

Both phases query the oracle through a memoizing proxy rather than calling it directly.
The two phases overlap: every fact elimination learns about the survivor is one verification would otherwise re-ask (the call that promoted the survivor is an incoming check; any call made while it was the running candidate is an outgoing check).
Caching each ordered `(a, b)` answer means the real oracle is hit at most once per distinct pair, so verification reuses what elimination already discovered - and the loops stay free of any bookkeeping about what is already known, since the proxy handles that transparently.

## Complexity

- **Time:** O(N) worst case.
  At most `3N-4` real oracle calls for `N >= 2` (`2N-2` best case): `N-1` for elimination, plus up to `2*(N-1)` for verification, less the survivor's checks the elimination pass already answered - and verification can exit early on the first failing check.
- **Space:** O(N) auxiliary - the memoizing proxy's per-pair answer cache, holding the distinct `(a, b)` pairs asked (`O(N)` of them, since the call count is `O(N)`), plus two scalars (the candidate's index and a verified flag) and the output.
- **Tradeoff - space for real calls:** the memoizing proxy trades `O(N)` cache space for a lower real-call count, and for this oracle problem the metric that matters is real oracle invocations, so the trade is worth it.
  Without the cache the sweep runs in `O(1)` auxiliary space but re-asks every one of the survivor's verification checks, costing `3*(N-1)` calls; the cache brings that to `3N-4` worst case and `2N-2` best case (when the survivor is the never-replaced initial candidate, so its entire outgoing direction is already known and only the `N-1` incoming checks remain).
  The reclaimed calls are guaranteed: the survivor is always touched by at least one elimination call, and every such call is by definition one of the verification checks.
- **Tradeoff - single-qualifier dependency:** the single-candidate shape depends on the at-most-one-qualifier property established above.
  If the qualification rule were loosened - dropping the "received from no one" requirement, say - that property would break, and the correct structure would become an independent per-person check (every person verified separately, `O(N^2)` worst case, `O(N)` average once a failing person short-circuits).

## Verification

- **Brute oracle** - for each candidate, filter the rest of the group and confirm every one of them was messaged and none of them sent one back, via `.every()`. No cleverness, so it's trustworthy as the reference; the guard against an empty "others" list is what keeps a lone person (N=1) from vacuously passing.
- **Fixtures** - seven cases worked out by hand: an empty group, a single person, a clear single qualifier, a complete message graph (everyone disqualified), an empty message graph (nobody has full outgoing coverage), a near-miss (one person messaged everyone but also received one message back), and a wrong-type element in the people array (rejected with `TypeError`).
- **Cross-check** - 300 fast-check runs over randomly generated `(people, hasMessaged)` pairs, asserting the optimized and brute outputs agree.
  The generator mixes uniform-random message graphs with hand-biased shapes (empty graph, complete graph, a planted qualifier, a near-miss) since a uniformly random graph almost never contains a real qualifier on its own and would rarely exercise the interesting case.
  Each run also wraps the oracle in a counter and asserts the real (cache-miss) call count stays within the memoized bound - at most `3*(N-1)` for any `N`, and at most `3N-4` for `N >= 2` - so the bound holds on every one of the 300 random inputs.
- **Call-count fixtures** - two hand-built cases pin the bound's endpoints: an initial-candidate qualifier at the `2N-2` best case, and a last-step promotion at the `3N-4` worst case.

## Code

- [`solution.js`](./solution.js) - the shipped `solve` and the `validateInput` guard.
- [`solution.test.js`](./solution.test.js) - the `bruteSolve` reference, the fixtures, the call-count fixtures, and the randomized cross-check.

Run: `node --test solutions/no-reply-broadcaster/solution.test.js`
