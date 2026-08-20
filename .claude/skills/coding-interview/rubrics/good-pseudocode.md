# good-pseudocode - the plan/approach rubric

The rules a plan has to satisfy before its implementation is unlocked.
A "plan" here is any lane's approach: the sample-case set's shape, the brute-force one-liner, the
cross-check harness design, and above all the optimized approach - which is itself the pseudocode, not
a separate artifact.
The creator (the lane subagent) writes toward these rules and holds this same file, so most plans pass
the first read; the reviewer agent reads the plan cold against this file and returns one verdict.

The verdict is binary: **passes** or **has-issues**.
When it has issues, report one row per issue - the rule, where in the plan it lands, and the specific
fix - and nothing else.
Every rule carries a **Check** naming the surface forms that usually mean it was broken.
Apply the Check as evidence, not as the rule itself: a listed form is not automatically a violation,
and a real violation using none of the listed forms is still a violation.

## Rules

1. **Names a concrete approach, not a category.** The plan says which algorithm and which data
   structures carry it - a max-heap of size k, a frequency map then a partial sort, two pointers over
   sorted input - specifically enough that the implementer makes no new algorithmic decision.
   **Check:** a plan that names only a family ("use a heap", "sliding window") without saying what the
   structure holds, what it is keyed on, or how it advances. Innocent when the one named structure fully
   determines the code.

2. **States the target complexity up front.** The plan commits to the time and space it is aiming for
   before the code lands, so the implementation has a target to hit and the cross-check has an
   expectation to confirm.
   **Check:** a plan with no stated big-O, or a stated complexity that the described approach cannot
   actually reach.

3. **Names the optimization call and the tradeoff behind it.** For the optimized lane, the plan says
   what is being optimized (time vs space) and why this approach wins for the clarified input - for a
   selection problem, the k-vs-n choice among heap, quickselect, and sort, and which one this input
   favors.
   **Check:** an optimized plan that jumps to one approach with no comparison, where the k-vs-n or
   time-vs-space tradeoff actually decides it. A brute or harness plan needs no tradeoff call - there
   the simplest correct approach is the whole point.

4. **Accounts for the edge dimensions the clarify step surfaced.** The plan says what happens at the
   boundaries that were clarified - empty input, one element, all-duplicates, ties at the k boundary,
   k=0 and k=n, negatives - rather than describing only the happy path.
   **Check:** a plan silent on a boundary the clarify step raised, especially tie-breaking and the k
   extremes. Innocent when a boundary genuinely cannot occur given the clarified constraints, and the
   plan says so.

5. **Concrete enough to implement without inventing.** A reader could turn the plan into code without
   making a design decision the plan left open - the ordering, the tie-break, the return shape are all
   pinned down.
   **Check:** a step that hand-waves the hard part ("then find the k largest", "handle ties
   appropriately") instead of saying how. That deferred decision is exactly where the implementation
   goes wrong.

6. **The brute plan is obviously-correct, not clever.** The brute-force lane's whole value is being the
   trustworthy oracle, so its plan chooses the unmistakable approach (sort then index, nested loop)
   over anything that needs its own reasoning to believe.
   **Check:** a brute plan reaching for an optimization - a heap, a clever early exit - when a plainly
   correct O(n log n) or O(n^2) approach would serve as the oracle. Speed is not the brute lane's job.
