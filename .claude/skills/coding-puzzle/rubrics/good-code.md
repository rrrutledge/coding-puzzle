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
4. **In the optimized solution, prefer a functional pass; drop to a loop only to avoid an extra pass.**
   A step that makes exactly one pass and computes one value reads clearer as `.map()`/`.filter()`/
   `.reduce()` than as a hand-written loop - a loop whose body just accumulates a single result is a
   `reduce`. The one thing the optimized solution must not do is buy that readability with an extra walk
   over the data: a `.filter().map().reduce()` chain that traverses three times folds into one `reduce`.
   Keep an explicit loop only where a single functional pass cannot express the step without iterating
   again - producing several aligned outputs at once, scattering into a pre-sized structure by index,
   multiple moving indices (two-pointer), a window carrying mutable state, in-place mutation, or an early
   stop (rule 6) that quits before the end where a `reduce` would run the whole array. The deciding
   question is passes-over-the-data: take the functional form whenever it holds the pass count flat, the
   loop whenever the functional form would cost another walk.
   **Check:** a single-pass accumulation that computes one value appears as one functional call, not a
   loop; no functional call feeds another so that the data is walked more than once; and each explicit
   loop that remains is doing what one functional pass cannot - several aligned outputs, index-scatter,
   multiple indices, carried window state, in-place mutation, or an early combined-condition stop.
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
9. **The brute reference maximizes clarity with functional constructs and built-ins.** The brute is the
   oracle and answers only to being obviously correct, never to speed, so write it for the plainest
   possible read: `.map()`/`.filter()`/`.reduce()` and chains of them, and the built-in structures the
   standard library already gives you (`Set`, `Map`, `Array.prototype.sort`) rather than a hand-rolled
   reimplementation. Extra passes and extra allocations are fine here - the whole point is that a reader
   agrees at a glance that it computes the right answer. This is the one place the pass-count discipline
   of rule 4 does not apply; it governs the optimized solution, not the oracle.
   **Check:** the brute solution reaches for functional array methods and built-in `Set`/`Map`/`sort`
   where they express the computation directly, and reimplements no structure or routine the standard
   library already provides.
10. **A walk over every element is a `for` loop, not a `while`.** When a loop that must stay a loop (per
    rule 4) simply visits each element of a collection in order, write it as a `for` loop - the running
    index and its bound belong together in the loop header, not spread across a `while` and a manual
    `index += 1` in the body. Reserve `while` for a loop whose continuation is something other than an
    index reaching a fixed length: a queue or stack that grows as it drains (BFS/DFS), or an
    iterate-until-condition search that ends when a value converges rather than when an index runs out.
    **Check:** every full in-order traversal of a collection is a `for` loop or a functional method, and
    each `while` loop's condition is something other than a running index reaching a fixed length - a
    growing worklist or a converge-until-true test.
