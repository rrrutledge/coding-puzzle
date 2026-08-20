# good-code - the implementation rubric

The rules an implementation has to satisfy: the brute reference, the optimized solution, and the
harness code once written.
The creator (the lane subagent) writes toward these rules and holds this same file, so most
implementations pass the first read; the reviewer agent reads the code cold against this file and
returns one verdict.
For the code artifact the built-in `/code-review` is the starting reviewer; this rubric names the
interview-specific things `/code-review` does not weigh.

The verdict is binary: **passes** or **has-issues**.
When it has issues, report one row per issue - the rule, the file and location, and the specific fix -
and nothing else.
Every rule carries a **Check** naming the surface forms that usually mean it was broken.
Apply the Check as evidence, not as the rule itself: a listed form is not automatically a violation,
and a real violation using none of the listed forms is still a violation.

## Rules

1. **Implements the approved plan, no substitutions.** The code uses the algorithm and data structures
   the plan committed to. A better idea mid-implementation goes back through the plan gate, not silently
   into the code.
   **Check:** an optimized solution whose actual approach differs from its approved plan - a plan that
   said heap-of-size-k against code that sorts, say. The plan and the code have drifted and one is now
   wrong.

2. **Handles the clarified boundaries the plan named.** Empty input, one element, all-duplicates, ties,
   k=0 and k=n, negatives - each boundary the plan accounted for is actually handled in the code, not
   just mentioned in a comment.
   **Check:** a boundary the plan named that the code would crash or return wrong on - an unguarded
   access on empty input, a k that walks off the end. The cross-check is the backstop, but the code
   should not rely on it to find these.

3. **Does not mutate the caller's input unless the clarify step allowed it.** Sorting or reordering the
   passed-in array in place is a side effect the caller did not ask for; copy first unless mutation was
   explicitly cleared.
   **Check:** an in-place `.sort()`, `.reverse()`, `.splice()`, or index assignment on a parameter,
   when the clarify step did not permit mutation. Innocent when mutation was cleared, or the value is a
   local copy.

4. **The brute reference stays obviously-correct.** The brute implementation matches its plainly-correct
   plan and takes on no cleverness - it is the oracle, and a subtle brute is a broken oracle.
   **Check:** an optimization creeping into the brute implementation - an early exit, a heap where a
   sort was planned - that makes it harder to trust at a glance.

5. **Reads clearly under narration.** Names say what they hold, the control flow is followable, and the
   structure matches how the plan was described out loud - because Russell is narrating this code to an
   interviewer as it is read.
   **Check:** single-letter names beyond a conventional loop index, a dense one-liner that hides the
   step the plan called out, or structure that does not track the spoken plan.

6. **No gold-plating past the plan.** The code does exactly what the plan and problem call for - no
   speculative generality, unused parameters, alternate code paths, or handling for inputs the clarify
   step ruled out.
   **Check:** a configurable option nothing uses, a second algorithm left in beside the chosen one, or
   defensive handling for a case the clarify step already excluded.

7. **The shipped optimized solution carries JSDoc.** The optimized function - the one thing that ships -
   has a JSDoc block stating its contract, params, return, and complexity, so the artifact is documented
   and not merely correct.
   **Check:** the shipped optimized function with no JSDoc, or JSDoc that omits the complexity line.
   The brute and harness are scaffolding and do not need it; the shipped solution does.
