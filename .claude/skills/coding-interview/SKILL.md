---
name: coding-interview
description: Live-pairing workflow for solving one algorithmic problem out loud with an interviewer watching. You orchestrate; Russell clarifies, reviews, narrates, and verifies. Clarify-first, then four parallel plan-and-implement lanes, a reviewer-agent-races-Russell gate on each, and a brute-force oracle cross-check that carries the real signal. Use for any pasted problem statement.
---

# Coding interview loop - one problem, orchestrated

The grade is not the final code. It is how correctness gets established in the open: the clarifying
questions, the brute-force oracle, the cross-check that could catch a wrong answer, and the complexity
call said out loud. You produce the artifacts; Russell narrates and owns every one of them.

Language is JavaScript, tested with Node's built-in runner (`node --test`) and `node:assert`. No
frameworks.

Style is enforced mechanically, not by a reviewer agent: `eslint.config.js` at the repo root sets the
house rules (braces on every control-flow statement, semicolons, `===`, `const`/`let` only). Implementer
lane agents write toward it directly. Run `npx eslint --fix <file>` on each implementation right after
writing it, before presenting it for review - it silently resolves the mechanical stuff, so only a real
remaining error needs anyone's attention. A `pre-commit` hook in `.githooks/` runs the same check on
anything actually committed to this repo (activate once per clone: `git config core.hooksPath .githooks`).

Comments carry the narration: every implementation groups its statements into blank-line-separated blocks,
one per algorithm step, with a one-line comment above each block stating in plain terms what it does - see
`rubrics/good-code.md` and `examples/top-k-frequent.test.js` for the shape. Reading only the comments,
top to bottom, should explain the approach before anyone reads a line of code.

## Your role: orchestrate, keep Russell fed

You are the orchestrator in the one tab Russell drives. You fan the work out to background subagents,
run each review gate, and keep the single verification thread. Russell reviews and gives feedback only
in this tab - never juggling windows - so his feedback lands the moment he gives it and you dispatch
the next step without waiting.

The subagents do the drafting and reviewing in the background while the main tab stays free. Russell is
never idle while you are heads-down, and you are never blocked waiting on him: his review of one
artifact overlaps your building of the next.

**One thing to review at a time.** Work keeps happening in the background no matter what Russell is doing
- lanes keep drafting, reviewer agents keep running - silently. Show him exactly one artifact, ask him to
review it, then wait: the next thing that prints is his reply, or the revision built from his feedback for
another look. Once that item is resolved, hand him the next thing - always one artifact, always the one
currently in front of him. Label what you hand him (which lane, which revision) so it's unambiguous.

**An artifact is ready for him the instant it is drafted, not when its reviewer clears.** The reviewer
agent and Russell review the same plan in parallel (see the race below), so surfacing to him is never
held back for a reviewer to finish. The moment the first plan drafts and he is free, hand it over - even
with its reviewer still running. A drafted plan sitting silently while Russell waits on a reviewer is the
one failure this rule exists to prevent: keeping him fed always wins over handing him a pre-vetted plan
later.

When he is free and more than one artifact is already waiting, pick in this order:
1. One that has already **passed its reviewer agent** - pre-vetted, so his read is the last thing left.
2. Otherwise **anything already drafted**, reviewer still running or not - never wait for a pending
   reviewer when something built is sitting there.
Everything else waits silently in the queue, and its turn comes when he frees up.

## The shape

Clarify first, then four lanes fan out, each gated, then a single verification chain, then document and
complexity. The optimized lane is the critical path - dispatch it first and keep its progress the
priority. That is the lane's precedence, not a rule about Russell's review order: whichever plan drafts
first is the one he sees first, and a ready plan is never held back to make the optimized one his first
review. Node color is which model runs the box; every lane runs the same
`plan -> reviewer agent ∥ you -> both clear?` race.

```mermaid
flowchart TD
    subgraph Legend [node color = which model runs it]
        direction LR
        LO[Opus: orchestrate + optimized plan]:::opus
        LS[Sonnet: other plans + impl + docs]:::sonnet
        LH[Haiku: reviewer agents]:::haiku
        LY[You: clarify + reviews]:::human
        LM[Mechanical: gates + test runs]:::mech
    end

    S([Problem stated]) --> CQ{{Clarify: answer the questions<br/>that change the algorithm}}

    CQ --> P3[Plan: optimized approach]
    CQ --> P1[Plan: sample cases]
    CQ --> P2[Plan: brute force]
    CQ --> P4[Plan: cross-check harness]

    P3 --> A3[[reviewer agent]]
    P3 --> Y3{{You review}}
    A3 --> M3{both clear?}
    Y3 --> M3
    M3 -->|feedback| P3
    M3 -->|approved| I3[Implement optimized]

    P1 --> A1[[reviewer agent]]
    P1 --> Y1{{You review}}
    A1 --> M1{both clear?}
    Y1 --> M1
    M1 -->|feedback| P1
    M1 -->|approved| L1[Cases locked as fixtures]

    P2 --> A2[[reviewer agent]]
    P2 --> Y2{{You review}}
    A2 --> M2{both clear?}
    Y2 --> M2
    M2 -->|feedback| P2
    M2 -->|approved| I2[Implement brute oracle]

    P4 --> A4[[reviewer agent]]
    P4 --> Y4{{You review}}
    A4 --> M4{both clear?}
    Y4 --> M4
    M4 -->|feedback| P4
    M4 -->|approved| I4[Implement harness]

    L1 --> V1[[Verify brute vs fixtures]]
    I2 --> V1
    V1 --> V2[[Cross-check optimized == brute]]
    I3 --> V2
    I4 --> V2
    V2 --> E[Edge cases + fix loop]
    I3 --> E
    E --> D[Document: JSDoc on shipped solution]
    D --> C([Complexity out loud + stop])

    classDef opus fill:#c7d7f5,stroke:#3b5ba5,color:#000;
    classDef sonnet fill:#cde7d8,stroke:#4a9d6a,color:#000;
    classDef haiku fill:#e6d5f0,stroke:#9673a6,color:#000;
    classDef human fill:#ffe0b3,stroke:#d79b00,color:#000;
    classDef mech fill:#e8e8e8,stroke:#999999,color:#000;
    class P3 opus;
    class P1,P2,P4,I2,I3,I4,L1,D sonnet;
    class A1,A2,A3,A4 haiku;
    class CQ,Y1,Y2,Y3,Y4 human;
    class M1,M2,M3,M4,V1,V2,E,S,C mech;
```

### 0. Clarify-first front gate

The problem statement arrives as pasted text in Russell's prompt - never a file path. Work only from
that text. There is no local problems directory to check for a spoiler answer key, and none should be
sought; a real interviewer just states the problem, with nothing on disk to look up.

Two things are never asked - they are standing assumptions on every problem, so build to them without
spending a question: the input is never mutated (work on a copy), and the code defends against malformed
input (the wrong type, `null`/`undefined`, missing arguments) rather than trusting it well-formed. Russell's
answer to both is fixed, so asking only wastes interview time; good-code rules 1 and 2 already hold the
implementation to them.

Restate the problem in one or two sentences, then surface the **1-3 questions that change the
algorithm** and get Russell's answers before any lane drafts: input size and shape, duplicates, sorted
or not, tie-breaking, what k means at the boundaries (k=0, k=n), and negatives. Keep it to seconds.
Writing the sample cases is itself part of clarifying - it forces the tie and boundary questions into
the open.

Because the algorithm-affecting facts are settled here, the four lanes are **forward-only and
independent** - no routine cross-lane messaging once they launch.

### The four lanes

Every lane has the same shape: **plan -> review gate -> implement**. The plan *is* the pseudocode; there
is no separate pseudocode artifact. Every plan opens with a few sentences on the mental model - the
intuition for why the approach works - before the steps; see `good-pseudocode.md`.

**Spawn every lane subagent with the rubric its output will face, in its prompt** (`skills:` frontmatter,
or the rubric file handed in to read), so the creator writes toward the exact bar the reviewer will
apply and most drafts pass their gate the first time. The plan-drafter gets `good-pseudocode`; the
implementer gets `good-code` for the brute and optimized solutions, `good-test` for the fixtures and the
harness. Same file, both sides: the creator holds the reviewer's rubric.

1. **Sample cases** - plan proposes a handful of hardcoded `input -> expected output` pairs, each
   expected value worked out by hand. Once the gate clears, they lock as the test fixtures, in the
   working **test** file.
2. **Brute force** - plan is the one-line obviously-correct approach (sort-then-index, nested loop).
   Once implemented and verified it becomes the **oracle** for the cross-check. It is never presented as
   the solution; its whole job is to be trustworthy. Lands in the working **source** file.
3. **Optimized solution** - plan is the approach and the "what are we optimizing" call (time vs space;
   for a selection problem the k-vs-n choice among heap, quickselect, sort). **This is the critical
   path** - dispatch it first and prioritize its progress, but never withhold a faster-drafting plan
   from Russell to make this one his first review. Lands in the working **source** file, alongside the
   brute reference.
4. **Cross-check harness** - plan is the fast-check `inputArbitrary` design (varied sizes, empty, one
   element, duplicates, negatives, full k range) - composed from fast-check's arbitraries, not a
   hand-rolled generator; see `examples/top-k-frequent.test.js`. It depends only on the function
   signature, so it proceeds alongside the optimized work. Lands in the working **test** file.

### The review gate (runs on every lane)

The moment a lane's plan is drafted, open it for Russell **and** fire its reviewer agent at the same
instant - a genuine race, both looking at the same plan at once. Surfacing the plan to Russell is never
delayed for the reviewer to return; his look starts as soon as he is free, whatever the reviewer is doing.
What waits for **both** to clear is the implementation gate - the plan does not unlock its code until the
reviewer has passed and Russell has approved:
- Reviewer agent finishes first -> the plan Russell is already reading is now also pre-vetted.
- Russell gets there first -> he reviews before the agent lands, rather than sitting idle.

Feedback from either side loops back to the **same lane subagent**, which revises with its full drafting
context intact. An approved plan unlocks that lane's implementation. The implemented optimized code
passes one more gate - `/code-review` plus the good-code agent, raced against Russell - before the
complexity step.

**The gate is a hard stop, not a status check.** A reviewer-agent PASS means the plan is pre-vetted for
Russell to look at - it is a separate signal from his review, and earns its own word, "cleared review."
"Approved" is reserved for Russell's own reply. Implementation for a lane launches only once that reply
has arrived, in his own words, in this conversation. The moment a plan is surfaced for his review, end
your turn there and wait; the next thing that happens on that lane is his reply. Before reporting a set of
plans as approved, confirm each one actually carries Russell's own word for it - that check is the
standing precondition for implementation, same as any other gate in this loop.

### Code review happens through git, never the console

At the start of a rep, create a local scratch branch off `main` for the rep's working files (e.g.
`rep/<slug>`) - never pushed, never merged; it exists only so this rep's code has somewhere to live and
diff against. Copy `templates/problem.js` and `templates/problem.test.js` to a matched pair of working
files on that branch (e.g. `rep.js` and `rep.test.js`), point the test file's `require` at the source
file, and fill both in there. Source (`bruteSolve`, `solve`) and test infrastructure (fixtures,
`equivalent`, the fast-check harness) stay in their own files - never merged into one.

Whenever an implementation - brute, optimized, harness, or the locked fixtures - is ready for Russell to
look at, write it to its file (source changes in `rep.js`, test changes in `rep.test.js`) and `git add`
it; say only that it's staged and ready, and never paste code into the console. Russell reviews with
`git diff --staged`. His approval is what turns the staged state into a commit - `git commit` is the
record of his sign-off, made right after he gives it, not something that happens on its own. A revision
after feedback goes back to `git add`, staged again, for another `git diff --staged` look.

### Verification chain (the load-bearing part)

Gated on the implementations, run in order:

1. **Brute vs hardcoded cases** - trust the oracle before leaning on it. Run the brute against every
   locked fixture.
2. **Cross-check: optimized === brute over many random inputs** - the step that carries the actual
   signal. Never assert the optimized solution is correct on its own say-so. Report plainly: the pass
   count, and on any disagreement the exact failing input and both outputs.
3. **Edge cases + fix loop** - on any failure, **explain why before touching code.** Name what the
   optimized approach missed, update the optimized plan to capture it, and only then fix. Catching a
   wrong or falsely-confident result in the open is the moment the interview is built to see - never
   smooth over a mismatch or quietly patch it.

The template and worked example already wire this chain up (see Files below): a mismatch prints the
failing input and both outputs, and the comparison is on the answer's invariant so a validly-different
answer is not misread as a bug. The fixtures and the cross-check are two different kinds of coverage, not
stand-ins for each other - both stay in the test file for the rest of the rep once both lanes land, the
fast fixtures for a quick run and the randomized suite for the load-bearing check. Every test logs a
one-line summary of what it actually ran, so a pass is never ambiguous with a no-op - see `good-test.md`.

### Document, then state complexity, then stop

- **Document** - a JSDoc block on the shipped optimized solution: contract, params, return, and the
  complexity line. The thing that ships is documented, not merely correct.
- **State complexity out loud** - time and space for the optimized solution in one line, and the
  tradeoff against the brute force and any other viable approach (heap-of-size-k O(n log k) vs
  quickselect O(n) average / O(n^2) worst vs sort O(n log n)) - say which you would pick and why,
  usually k vs n.
- **Stop.** No refactoring, no alternate implementations, no gold-plating. The loop ends at a verified,
  documented, complexity-stated answer.

## Orchestration mechanics

- **Regular (non-fork) subagents, resumed for feedback.** Spawn each lane as a regular background
  subagent. When it finishes its draft it goes idle with its transcript on disk; feedback delivered via
  `SendMessage` re-wakes it as a new turn with full prior context, so the revision keeps the reasoning
  that produced the draft. Do not use forks here - a fork locks to the parent and cannot be resumed
  this way.
- **Give draft agents headroom.** A subagent that exhausts its turn or token budget goes terminal and
  cannot be resumed. Spawn lane agents with enough headroom to survive until Russell's feedback arrives.
- **Cross-lane messaging is a rare fallback.** Clarify-first makes the lanes independent, so the common
  case needs no cross-lane routing. Only when a new clarification surfaces mid-review do you push it to
  lanes that already drafted, via `SendMessage` (plain text, one lane at a time - there is no broadcast).
  You, the orchestrator, hold the source-of-truth problem context.
- **Concurrency headroom.** Up to 20 concurrent subagents, nesting 3 deep. Four lanes plus their
  reviewers sit well inside that.

## Model assignment

Set per-subagent via the Agent tool's `model` option:
- **Opus** - the orchestrator (this session) and the **optimized-approach plan**, where the algorithm
  and the k-vs-n tradeoff matter most.
- **Sonnet** - the other three plans, all implementations, and the documentation. The approved plan
  constrains them, so a fast capable model is the right cost/speed point.
- **Haiku** - the reviewer agents. They must win the race against Russell's manual review, so speed
  wins and the rubric is tight enough for a small model. Bump a reviewer to Sonnet if its judgment
  proves shallow.

All picks are starting points; profile mode measures whether Opus on the optimized plan earns its cost
over Sonnet.

## Reviewer agents

Each reviewer is a **cold, no-context** agent handed one artifact and one rubric, returning a binary
**passes / has-issues** verdict with `rule + location + fix` rows. It stays cold by design - it needs
only the artifact and the rubric, not the drafting conversation. The rubrics live in `rubrics/` and the
lane subagents (the creators) hold the same files, so most drafts pass the first read.

- **good-pseudocode** (`rubrics/good-pseudocode.md`) - reviews the lane plans, above all the optimized
  approach.
- **good-test** (`rubrics/good-test.md`) - reviews the sample fixtures and the cross-check harness.
- **good-code** (`rubrics/good-code.md`) - reviews the implementations. For the code artifact the
  built-in `/code-review` is the starting reviewer; the good-code rubric adds the interview-specific
  checks `/code-review` does not weigh (plan-fidelity, input mutation, JSDoc-on-shipped, no gold-plating).

To run one: dispatch a cold Agent, hand it the rubric file to read plus the artifact, and have it return
the verdict. Profile each reviewer's time during practice and cut any that costs more than it saves.

## Files

- `templates/problem.js` + `templates/problem.test.js` - the per-problem template, split source from
  test. Copy both to a matched working pair and fill in: `bruteSolve` and `solve` in the `.js` file, the
  fixtures and a fast-check `inputArbitrary` in the `.test.js` file. The test file already holds the
  fast-check cross-check that asserts `solve === bruteSolve`, and an `equivalent(input, a, b)` seam for
  problems whose answer is not unique.
- `examples/top-k-frequent.js` + `examples/top-k-frequent.test.js` - one fully worked instance (Top K
  Frequent Elements), runnable with `node --test examples/top-k-frequent.test.js`. The test file shows
  the tie-aware `equivalent` that compares the frequency profile rather than the raw elements, so two
  equally-correct selections are not flagged as a mismatch.
- `rubrics/good-pseudocode.md`, `rubrics/good-test.md`, `rubrics/good-code.md` - the reviewer rubrics.

## Profile mode vs real mode

- **Profile mode (practice).** Timestamp each step - plan drafted, reviewer agent done, Russell's review
  done, implementation done - and print an end-of-problem table: who was the bottleneck, how long each
  reviewer took, where Russell waited, plus a token/cost tally per model. This tunes the fan-out, cuts
  slow reviewers, and tests whether Opus on the optimized plan beats Sonnet.
- **Real mode (interview).** No profiling overhead - just the loop.

Default to real mode; switch to profile mode when Russell says he is doing a timed practice rep.

### Rubric-learning loop (practice feeds the reviewers)

During practice, when Russell's feedback is **generic** to how tests, plans, or code should be written
(not specific to this problem), capture it as you go. At session end, fold it into the matching rubric
in `rubrics/`, so next time the reviewer agent catches it and Russell does not have to. The aim is that
Russell stops being the one catching recurring issues.

## Guardrails

- The optimized solution is never asserted correct without the cross-check having run. A mismatch stops
  the loop and gets explained before any code changes.
- The brute force stays obviously-correct - it is the oracle, and a clever brute is a broken oracle.
- Small, reviewable artifacts at each gate. Russell reads and owns every one before the next step.
- Implementation for a lane launches only once Russell's own word approves that plan - see "The gate is a
  hard stop" above. A reviewer-agent PASS earns the plan a look from him, not the go-ahead.
- If Russell's own clarifying question or objection contradicts something already drafted, the artifact
  changes, not his framing.
- When a bare "sure" or "yes" could confirm more than one pending thing, ask him which one before acting -
  a structured choice beats a guess.
