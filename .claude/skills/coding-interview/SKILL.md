---
name: coding-interview
description: Live-pairing workflow for solving one algorithmic problem out loud with an interviewer watching — clarify, brute force, optimize, cross-validate, state complexity. Use for any coding problem in this folder.
---

# Coding interview pairing loop

The grade here is not the final answer — it's how correctness gets verified in the open. Every step
below produces something Russell narrates; none of it replaces his judgment.

## 1. Clarify (before any code)

Restate the problem in one or two sentences and ask 1-3 sharp clarifying questions: input size and
shape, duplicates allowed, sorted or not, mutation allowed, tie-breaking rules, what "k" means at the
boundaries (k=0, k=n). Wait for Russell's answer before writing anything. Keep this short — seconds,
not a paragraph.

## 2. Brute force first

Write the obvious, unmistakably-correct solution first — sort-then-index, nested loops, whatever
needs no cleverness to trust. Add 2-3 hardcoded example cases from the clarified problem and run
them. This is the reference the optimized solution gets checked against, not a throwaway.

## 3. Optimized solution

Write the better-complexity solution (heap of size k, Quickselect, two pointers, sliding window —
whichever the problem calls for). While this generates, do not sit idle: name the target complexity
out loud before the code lands, and say what you're about to check once it does.

## 4. Cross-validate — the step that carries the actual signal

Never assert the optimized solution is correct or optimal on its own say-so. Generate a batch of
randomized inputs (varied sizes, edge sizes like empty/1-element, duplicates, negative numbers if
applicable) and run both solutions against every input, asserting the outputs match. Report the
result plainly: pass count, and the actual failing input plus both outputs if anything disagrees —
never smooth over a mismatch or quietly patch it without flagging it first.

If a mismatch surfaces, stop and say so before touching code — that moment (catching a wrong or
falsely-confident claim) is the one the interview is built to see.

## 5. State complexity, then stop

Time and space complexity for the optimized solution, one line, and the trade-off against the brute
force and against any other viable approach (e.g. heap-of-size-k O(n log k) vs. Quickselect O(n)
average / O(n²) worst vs. sort O(n log n) — say which you'd pick and why, usually k vs. n).

Do not add anything past this — no refactoring, no alternate implementations, no gold-plating. The
loop ends at a verified, complexity-stated answer.

## Guardrails

- One agent, one thread of work. No spawning subagents or parallel attempts on the same problem.
- Small, reviewable diffs at each step — Russell reads and owns every change before the next step
  starts, same as any other PR.
- If Russell's own clarifying question or objection contradicts something already written, the code
  changes, not his framing.
