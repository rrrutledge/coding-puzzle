# coding-puzzle

A `coding-puzzle` Claude Code skill for live-pairing on algorithmic coding puzzles out loud with a
partner narrating - see `.claude/skills/coding-puzzle/SKILL.md` for the loop itself.

## Layout

- `.claude/skills/coding-puzzle/SKILL.md` - the pairing-loop skill itself: clarify, brute force,
  optimized solution, randomized cross-validate, state complexity.
- `puzzle-profile/` - a standalone, minimal `CLAUDE.md` + `settings.json` that gets symlinked in as
  your *entire* `~/.claude` profile (via `scripts/swap-profile.py` / `.ps1`) so VS Code's Claude Code
  extension runs something small and fast during an actual live rep - no routine-life skills, no
  hooks, nothing but the coding-puzzle skill.
- Practice problems live outside this repo, in a local directory split into `statements/` (pasted into
  a rep as the problem prompt) and `answer-keys/` (clarifying questions and target approach, opened
  only after a rep to check the result). They live outside the repo so the session running a rep has
  no path to find them - it only ever sees whatever statement text got pasted in.
- `eslint.config.js` - the house JS style (braces, semicolons, `===`, `const`/`let`), enforced by a
  `.githooks/pre-commit` hook rather than a reviewer agent - see the `coding-puzzle` skill for how
  implementation lanes use it.
- `solutions/` - worked write-ups of solved puzzles, one directory per problem, following
  `solutions/TEMPLATE.md`.

## Working here

Follow the `coding-puzzle` skill for any actual problem-solving rep. For everything else (talking
through how a rep went, refining the skill, updating docs), this is a normal working session - branch
from `main`, commit, and open a PR.

## Setup (once per clone)

```
npm install
git config core.hooksPath .githooks
```
