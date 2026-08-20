# good-pseudocode - the plan/approach rubric

Reviews any lane's plan: the sample-case shape, the brute one-liner, the cross-check harness design, and
above all the optimized approach - which is itself the pseudocode, not a separate artifact.

A plan does its job when it is concrete enough to implement without inventing a decision the plan left
open, it commits to the time and space it is aiming for, and - for the optimized lane - it names what is
being optimized and the tradeoff behind the chosen approach (for a selection problem, the k-vs-n call).
Judge each plan against that purpose, and against the specific rules below as they accumulate.

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

_(No rules yet - the first reps fill this in. Until then, judge against the purpose stated above.)_
