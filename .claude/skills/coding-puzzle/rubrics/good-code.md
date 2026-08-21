# good-code - the implementation rubric

Reviews the implementations: the brute reference, the optimized solution, and the harness code once
written. For the code artifact the built-in `/code-review` is the starting reviewer; this rubric adds the
puzzle-specific things `/code-review` does not weigh.

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

Each rule added here carries a **Check** naming the surface form that shows the rule was followed - a
checker looks for that form as evidence, not as the rule itself: finding it is a good sign but not
automatic proof, and a rule can be satisfied through a form the Check doesn't name. What flags a violation
is that evidence being absent, not the presence of some named bad pattern.

1. **No input mutation.** The optimized (and brute) solution does not mutate its input parameters unless
   the problem's contract requires the result in that same structure. Copy before sorting or modifying.
   **Check:** the code copies or derives a new structure before sorting or transforming it, matching a
   problem statement that leaves the input's ownership with the caller.
2. **Validate the boundaries.** The code checks the standing set regardless of whether the plan spelled
   each one out: too high, too low, `null`/`undefined`, missing arguments, and the wrong type - a string
   where a number was expected, a number where a string was expected - not just the happy path the
   examples show.
   **Check:** the code checks each bounded parameter against its valid range in both directions, guards
   for `null`/`undefined`/missing arguments, and rejects an argument of the wrong type rather than letting
   it silently coerce or produce a wrong answer.
3. **Comment every logical block.** The function body is broken into blank-line-separated groups of
   statements, each doing one step of the algorithm, with a one-line comment directly above the group
   stating in plain terms what it does. Someone should be able to read only the comments, top to bottom,
   and follow the algorithm before reading any code.
   **Check:** every blank-line-delimited group of statements in the function carries a comment on the
   line immediately above it, naming what that group does.
4. **Functional for single-pass glue, loops for the core algorithm.** A lone `.map()`/`.filter()`/
   `.reduce()` call is fine when it is genuinely one pass over the data. The core optimized step - the
   part that makes the complexity what it is (two-pointer, sliding window, in-place partition, heap) - is
   an explicit loop with local mutable state, since precise control over passes and allocations is what
   makes it optimal.
   **Check:** each functional array-method call stands on its own rather than feeding directly into
   another `.map()`/`.filter()`/`.reduce()`, and the core optimized step is written as an explicit loop.
5. **Functions live at the same level.** Every function - including small helpers - is its own top-level
   declaration, not nested inside another function's body. A helper that needs data from its caller takes
   it as a parameter instead of closing over it.
   **Check:** every `function`, arrow, or method lives at module scope; none is declared inside another
   function's body.
6. **Single return, loops run to completion.** A function returns once, as its last statement - no
   `return` partway through the body. A loop runs until its own condition goes false; nothing exits it
   early with `break`. A loop's test expression isn't limited to the index bound - fold any other stopping
   condition into it with `&&` (`i < n && !found`, `i < arr.length && result.length < k`) so the loop still
   terminates itself the moment that condition trips, without wasting iterations the way a body-only guard
   would. Where neither the index nor a combined condition can express the stop, track the result (or a
   flag) in a variable and let the loop or function finish naturally instead.
   **Check:** the function's only `return` is its final statement, no loop body contains a `break`, and a
   loop that stops early for a non-index reason has that reason folded into its own test expression.
7. **No repeated code or repeated concepts.** Two ways to fix the same logic or check needed more than
   once: factor it into one named helper used from every call site, or restructure the flow so the logic
   only runs in one place and everything depending on it happens right there too - removing the second
   occurrence rather than extracting it. Either is fine; what matters is the logic existing exactly once,
   not restated with slightly different wording each time. Exception: the brute reference and the
   optimized solution stay independently implemented even where that means some structural overlap (both
   computing a frequency count from scratch, say) - sharing that logic between them would let one bug fool
   both, defeating the whole point of having an oracle.
   **Check:** a check or computation needed in more than one place (outside the brute-vs-optimized
   exception) exists at exactly one site in the code - either as a single named function called from every
   place that needs it, or because the flow was restructured so only one place ever needed it.
8. **No magic numbers.** Any numeric literal other than `0` or `1` either carries a comment explaining
   what it is, or is assigned to a constant whose name says what it is. This is about numbers embedded in
   the algorithm's logic (thresholds, offsets, generator constants) - hand-derived fixture data is
   self-explanatory from the case it sits in and isn't what this targets.
   **Check:** every literal number besides `0`/`1` in the algorithm's logic has an explanatory comment on
   the same or preceding line, or is declared as a named constant instead of appearing inline.
