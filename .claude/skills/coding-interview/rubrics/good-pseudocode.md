# good-pseudocode - the plan/approach rubric

Reviews any lane's plan: the sample-case shape, the brute one-liner, the cross-check harness design, and
above all the optimized approach - which is itself the pseudocode, not a separate artifact.

A plan does its job when it opens with a few sentences naming the mental model - the intuition for *why*
the approach works, stated before any step - then is concrete enough to implement without inventing a
decision the plan left open, commits to the time and space it is aiming for, and - for the optimized lane
- names what is being optimized and the tradeoff behind the chosen approach (for a selection problem, the
k-vs-n call). Judge each plan against that purpose, and against the specific rules below as they
accumulate.

The creator (the lane subagent) writes toward this rubric and holds this same file, so most plans pass
the first read. The reviewer agent reads the plan cold against this file and returns one verdict.

The verdict is binary: **passes** or **has-issues**. When it has issues, report one row per issue - the
rule, where in the plan it lands, and the specific fix - and nothing else.

## Rules

Earned from real reps, not guessed in advance. When a practice rep surfaces feedback that is generic to
how plans should be written (not specific to one problem), the rubric-learning step folds it in here as a
new rule.

Each rule added here carries a **Check** naming the surface forms that usually mean it was broken. A
checker applies the Check as evidence, not as the rule itself: a listed form is not automatically a
violation, and a real violation using none of the listed forms is still a violation.

1. **Preserve the input.** The plan does not mutate the input in place unless the problem's contract
   requires the result to land in that same structure (e.g. Merge Sorted Array's in-place merge into
   `nums1`). Default to reading, never writing, the input.
   **Check:** the plan sorts, splices, or reassigns into the input array/object/list with no copy step
   named, and the problem statement never asked for an in-place result.
2. **Name the boundary handling.** The optimized plan states what happens on invalid or edge input -
   `k` outside `[1, n]`, an empty collection, `k = 0` - not just the happy path. This is part of the
   approach, not deferred to implementation.
   **Check:** the plan has no line addressing `k`'s bounds (for a selection problem) or the
   empty/single-element case, despite the clarify step having raised it.
3. **Lead with the mental model.** Before the steps, a few sentences (or a short paragraph) state the
   intuition that makes the approach work - the invariant it maintains, or the insight that rules out the
   naive approach. Steps alone are not a plan; they are the mechanics of an idea the reader hasn't been
   given yet.
   **Check:** the plan opens straight into numbered/bulleted steps with no framing sentence explaining
   why that sequence of steps solves the problem.
