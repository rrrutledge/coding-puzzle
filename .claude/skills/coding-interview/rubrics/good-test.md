# good-test - the test-artifact rubric

The rules the test artifacts have to satisfy: the hardcoded sample cases (the locked fixtures) and the
cross-validation harness that feeds random inputs through both solutions.
The creator (the lane subagent) writes toward these rules and holds this same file, so most test
artifacts pass the first read; the reviewer agent reads them cold against this file and returns one
verdict.

The verdict is binary: **passes** or **has-issues**.
When it has issues, report one row per issue - the rule, where it lands, and the specific fix - and
nothing else.
Every rule carries a **Check** naming the surface forms that usually mean it was broken.
Apply the Check as evidence, not as the rule itself: a listed form is not automatically a violation,
and a real violation using none of the listed forms is still a violation.

## Sample-case rules

1. **Expected outputs computed by hand, never by running the code.** Each fixture's expected value is
   worked out from the problem statement independently, so the fixture can catch a wrong solution.
   **Check:** an expected value that was clearly lifted from a solution's output - a suspiciously exact
   answer for a case whose hand-derivation is not obvious. A fixture that only ever agrees with the code
   under test proves nothing.

2. **Covers the clarified edge dimensions.** The fixtures span the boundaries the clarify step raised -
   empty input, one element, all-duplicates, ties at the k boundary, k=0 and k=n, negatives - not three
   variations of the happy path.
   **Check:** a fixture set that is all mid-sized typical inputs, missing the empty / single / tie / k
   extremes that the clarify step named. Innocent when a boundary cannot occur under the clarified
   constraints.

3. **Deterministic and self-contained.** Every fixture is a fixed input paired with a fixed expected
   output; nothing depends on ordering that the spec left unspecified.
   **Check:** an expected output that assumes a particular order among tied elements when the problem
   did not promise one - the fixture will flake. Fix by asserting on a canonicalized form (sorted, or a
   set) instead.

## Cross-validation-harness rules

4. **The harness is the load-bearing check: it asserts optimized === brute on every generated input.**
   The harness runs both solutions on the same random input and compares, treating the brute force as
   the oracle. This comparison, over many inputs, is what actually earns confidence in the optimized
   solution.
   **Check:** a harness that only runs the optimized solution, or checks it against re-computed expected
   values instead of against the brute oracle. Without the brute-vs-optimized comparison the harness is
   not doing its job.

5. **Random inputs span the same edge dimensions, not just comfortable sizes.** The generator varies
   size including the empty and single-element cases, and varies content to force duplicates, ties,
   negatives, and the full range of k - so a bug that only shows at a boundary actually gets generated.
   **Check:** a generator that only ever produces mid-sized distinct-value arrays, or a k held constant
   - the boundary bugs never appear, so the passing run is hollow.

6. **A mismatch prints the actual failing input and both outputs.** On disagreement the harness reports
   the exact input that broke it and what each solution returned, so the failure is diagnosable rather
   than a bare count.
   **Check:** a harness whose failure path prints only "mismatch" or a pass/fail count, with no way to
   see the input that triggered it or the two differing outputs.

7. **Enough iterations to be meaningful, seeded output on failure.** The harness runs enough random
   trials that a boundary bug is likely to surface, and the failing input is captured so the run is
   reproducible.
   **Check:** a harness of a handful of trials, too few to hit the boundary cases the generator is
   capable of producing.
