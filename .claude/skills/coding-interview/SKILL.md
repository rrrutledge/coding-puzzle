---
name: coding-interview
description: Live-pairing workflow for solving one algorithmic problem out loud with an interviewer watching. You orchestrate; Russell clarifies, reviews, narrates, and verifies. Clarify-first, then four parallel plan-and-implement lanes, a reviewer-agent-races-Russell gate on each, and a brute-force oracle cross-check that carries the real signal. Use for any coding problem in this folder.
---

# Coding interview loop - one problem, orchestrated

The grade is not the final code. It is how correctness gets established in the open: the clarifying
questions, the brute-force oracle, the cross-check that could catch a wrong answer, and the complexity
call said out loud. You produce the artifacts; Russell narrates and owns every one of them.

Language is JavaScript, tested with Node's built-in runner (`node --test`) and `node:assert`. No
frameworks.

## Your role: orchestrate, keep Russell fed

You are the orchestrator in the one tab Russell drives. You fan the work out to background subagents,
run each review gate, and keep the single verification thread. Russell reviews and gives feedback only
in this tab - never juggling windows - so his feedback lands the moment he gives it and you dispatch
the next step without waiting.

The subagents do the drafting and reviewing in the background while the main tab stays free. Russell is
never idle while you are heads-down, and you are never blocked waiting on him: his review of one
artifact overlaps your building of the next.

**Keep-fed priority - always hand Russell the next thing to look at in this order:**
1. Something that has already **passed its reviewer agent** - a pre-vetted artifact.
2. If nothing has cleared a reviewer yet, **anything that has been built** - better than letting him sit.
When he gives feedback, dispatch it at once and surface the next queued item in the same breath.

## The shape

Clarify first, then four lanes fan out, each gated, then a single verification chain, then document and
complexity. The optimized lane is the critical path - lead with it.

```
                          ┌─ sample cases ─────┐
  clarify (front gate) ───┼─ brute force ──────┼─→ verify chain ─→ document ─→ complexity ─→ stop
     answer the Qs        ├─ OPTIMIZED (crit) ─┤
     that change the      └─ cross-check harness┘
     algorithm
```

### 0. Clarify-first front gate

Restate the problem in one or two sentences, then surface the **1-3 questions that change the
algorithm** and get Russell's answers before any lane drafts: input size and shape, duplicates, sorted
or not, mutation allowed, tie-breaking, what k means at the boundaries (k=0, k=n), negatives. Keep it to
seconds. Writing the sample cases is itself part of clarifying - it forces the tie and boundary
questions into the open.

Because the algorithm-affecting facts are settled here, the four lanes are **forward-only and
independent** - no routine cross-lane messaging once they launch.

### The four lanes

Every lane has the same shape: **plan -> review gate -> implement**. The plan *is* the pseudocode; there
is no separate pseudocode artifact.

1. **Sample cases** - plan proposes a handful of hardcoded `input -> expected output` pairs, each
   expected value worked out by hand. Once the gate clears, they lock as the test fixtures.
2. **Brute force** - plan is the one-line obviously-correct approach (sort-then-index, nested loop).
   Once implemented and verified it becomes the **oracle** for the cross-check. It is never presented as
   the solution; its whole job is to be trustworthy.
3. **Optimized solution** - plan is the approach and the "what are we optimizing" call (time vs space;
   for a selection problem the k-vs-n choice among heap, quickselect, sort). **This is the critical
   path.** Lead with it.
4. **Cross-check harness** - plan is the random-input generator design (varied sizes, empty, one
   element, duplicates, negatives, full k range). It depends only on the function signature, so it
   proceeds alongside the optimized work.

### The review gate (runs on every lane)

The moment a lane's plan is drafted, open it for Russell **and** fire its reviewer agent at the same
instant - a race. The gate waits for **both**:
- Reviewer agent finishes first -> Russell reviews a pre-vetted plan.
- Russell gets there first -> he starts before the agent lands, better than waiting.

Feedback from either side loops back to the **same lane subagent**, which revises with its full drafting
context intact. An approved plan unlocks that lane's implementation. The implemented optimized code
passes one more gate - `/code-review` plus the good-code agent, raced against Russell - before the
complexity step.

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
answer is not misread as a bug.

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

- `templates/problem.test.js` - the per-problem template. Copy it to a working file and fill the four
  slots: `bruteSolve`, `solve`, the fixtures, and `randomInput`. It already holds the seeded random
  cross-check that asserts `solve === bruteSolve`, and an `equivalent(input, a, b)` seam for problems
  whose answer is not unique.
- `examples/top-k-frequent.test.js` - one fully worked instance (Top K Frequent Elements), runnable with
  `node --test`. It shows the tie-aware `equivalent` that compares the frequency profile rather than the
  raw elements, so two equally-correct selections are not flagged as a mismatch.
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
- If Russell's own clarifying question or objection contradicts something already drafted, the artifact
  changes, not his framing.
