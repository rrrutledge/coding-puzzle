# good-test - the test-artifact rubric

Reviews the test artifacts: the hardcoded sample cases (the locked fixtures) and the cross-validation
harness that feeds random inputs through both solutions.

The test artifacts do their job when each fixture pairs a hand-derived expected output with an input that
reaches the boundaries the clarify step raised, and the harness asserts `optimized === brute` over random
inputs spanning those same boundaries, printing the actual failing input and both outputs on a mismatch.
That cross-check against the brute oracle is the load-bearing verification. Judge the artifacts against
that purpose, and against the specific rules below as they accumulate.

The creator (the lane subagent) writes toward this rubric and holds this same file, so most test
artifacts pass the first read. The reviewer agent reads them cold against this file and returns one
verdict.

The verdict is binary: **passes** or **has-issues**. When it has issues, report one row per issue - the
rule, where it lands, and the specific fix - and nothing else.

## Rules

Earned from real reps, not guessed in advance. When a practice rep surfaces feedback that is generic to
how tests should be written (not specific to one problem), the rubric-learning step folds it in here as a
new rule.

Each rule added here carries a **Check** naming the surface forms that usually mean it was broken. A
checker applies the Check as evidence, not as the rule itself: a listed form is not automatically a
violation, and a real violation using none of the listed forms is still a violation.

_(No rules yet - the first reps fill this in. Until then, judge against the purpose stated above.)_
