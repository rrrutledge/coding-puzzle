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

_(No rules yet - the first reps fill this in. Until then, judge against the purpose stated above.)_
