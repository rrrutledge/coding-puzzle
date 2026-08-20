# good-code - the implementation rubric

Reviews the implementations: the brute reference, the optimized solution, and the harness code once
written. For the code artifact the built-in `/code-review` is the starting reviewer; this rubric adds the
interview-specific things `/code-review` does not weigh.

The code does its job when it implements the approved plan without substitution, handles the clarified
boundaries the plan named, leaves the brute reference obviously-correct (it is the oracle), and carries
JSDoc on the shipped optimized solution. Judge the code against that purpose, and against the specific
rules below as they accumulate.

The creator (the lane subagent) writes toward this rubric and holds this same file, so most
implementations pass the first read. The reviewer agent reads the code cold against this file and returns
one verdict.

The verdict is binary: **passes** or **has-issues**. When it has issues, report one row per issue - the
rule, the file and location, and the specific fix - and nothing else.

## Rules

Earned from real reps, not guessed in advance. When a practice rep surfaces feedback that is generic to
how the code should be written (not specific to one problem), the rubric-learning step folds it in here as
a new rule.

Each rule added here carries a **Check** naming the surface forms that usually mean it was broken. A
checker applies the Check as evidence, not as the rule itself: a listed form is not automatically a
violation, and a real violation using none of the listed forms is still a violation.

1. **No input mutation.** The optimized (and brute) solution does not mutate its input parameters unless
   the problem's contract requires the result in that same structure. Copy before sorting or modifying.
   **Check:** an in-place `.sort()`/`.splice()`/`.reverse()` on a parameter, or a reassignment into a
   passed-in object/array, with no corresponding requirement in the problem statement.
2. **Validate the boundaries the plan named.** If the approved plan calls out `k` bounds, empty input, or
   another edge case, the code actually handles it - not just the happy path the examples show.
   **Check:** the plan names a boundary (e.g. `k` outside `[1, n]`) but the code has no corresponding
   check or branch, so that input would silently misbehave rather than being handled as planned.
