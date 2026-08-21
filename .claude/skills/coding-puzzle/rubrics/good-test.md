# good-test - the test-artifact rubric

Reviews the test artifacts: the hardcoded sample cases (the locked fixtures) and the cross-validation
harness that feeds random inputs through both solutions. The `bruteSolve` oracle shares this file - it is
test-only, existing only to verify `solve`, so it lives here rather than in the shipped source - but as an
algorithm it is reviewed under `good-code`, not here; judge only the fixtures and the harness against the
rules below.

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

Each rule added here carries a **Check** naming the surface form that shows the rule was followed - a
checker looks for that form as evidence, not as the rule itself: finding it is a good sign but not
automatic proof, and a rule can be satisfied through a form the Check doesn't name. What flags a violation
is that evidence being absent, not the presence of some named bad pattern.

1. **Every test prints what it did.** A green checkmark alone doesn't distinguish a real pass from a
   no-op. Each `test()` body logs at least one line summarizing what it actually validated - the fixture's
   input and expected output, or the cross-check's trial count - before returning.
   **Check:** each `test()` body contains a `console.log` (or equivalent) naming the case it ran (a
   fixture's input, or the trial count for the cross-check).
2. **Fixtures and the cross-check both ship.** The hand-derived fixtures from the sample-cases lane and
   the random cross-check are two different kinds of coverage, not stand-ins for each other, and both
   stay in the final test file once both lanes land - the fast, eyeballable fixtures for a quick run, the
   slower randomized suite for the load-bearing check.
   **Check:** the test file has at least one `test('fixture: ...', ...)` call per locked fixture and the
   `cross-check` test.
3. **Fixtures are individual `test()` calls, not loop-generated.** The locked fixtures are reviewed as a
   data table during the sample-cases gate, but land in the file as one explicit, literally-named
   `test()` call per fixture - never a `for`/`forEach` loop registering them dynamically. A GUI test
   explorer can only find and click-run a test whose name it can see in the source; a name built at
   runtime inside a loop is invisible to it even though `node --test` itself runs it fine.
   **Check:** each fixture has its own `test('fixture: <name>', ...)` call written out in the file, with
   the assertion logic factored into a shared top-level helper if it repeats.
4. **A wrong-type fixture, not just wrong-range.** Alongside the too-high/too-low/empty/negative boundary
   cases, one fixture passes an argument of the wrong type - a string where a number is expected, a number
   where a string is expected - and expects the validation to reject it.
   **Check:** the fixtures include a case whose input has at least one argument of the wrong type, with an
   expectation that it's rejected (a thrown error, or whatever the approved plan called for on bad input).
5. **The cross-check ships live in the solution file, never commented out.** The template carries the
   cross-check `test()` block commented, as a reference for its shape; the real `solutions/<slug>/`
   test file has it written in live - uncommented, wired to the real `inputArbitrary`, running its
   `numRuns`. A commented-out cross-check runs zero trials, reducing the load-bearing verification to a
   no-op.
   **Check:** the test file has an uncommented `test('cross-check...', ...)` call that runs `fc.assert`
   over the real `inputArbitrary` and logs its trial count, not the template's commented stub.
