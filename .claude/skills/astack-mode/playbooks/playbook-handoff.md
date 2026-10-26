---
name: handoff
description: The terminal playbook. Invoked as the last step of every other playbook—write the decision log, label the evidence, and write the reply.
type: playbook
---

# Playbook: Handoff

**Invoked at the end of every other playbook.** Not matched directly from a
user request. Each playbook's final step routes here, then adds only what is
unique to that playbook.

**Principles:**
- Code is Documentation (the artifact carries its own explanation)
- Sequence Verifiable Units (history reads in the order the work was proved)
- Encode Lessons in Structure (a lesson left only in the handoff is a lesson lost)

A handoff is not a summary of what you did. It is what the next person needs in
order to continue, disagree, or undo. Write it for a reader who has none of your
context and no ability to ask you a question.

---

## 1. Label every claim

Each claim in the handoff and in the reply carries its evidence or its label in
the same sentence. Three labels, no others:

| Label | Means | Example |
|---|---|---|
| **Measured** | You ran it and read the result | "Login p50 dropped from 410ms to 180ms, measured over 200 requests" |
| **Inferred** | Follows from evidence you have, but you did not observe it directly | "Inferred: the same N+1 affects the admin list, which shares the loader" |
| **Guess** | A prediction, or a cause you have not confirmed | "Guess: the stall is GC, unconfirmed" |

An unlabeled claim reads as measured. If you did not measure it, label it.

Never hand over a check you could have run. If a claim is a guess and running
something would settle it, run it before writing the handoff.

---

## 2. Write the decision log

Four parts. A part that genuinely does not apply keeps its heading with one line
saying why, rather than being dropped.

- **Decisions.** What was chosen and why. Name the alternatives you rejected and
  what would have to change for one of them to win. A decision with no rejected
  alternative was not a decision.
- **Assumptions.** What might be wrong, and the early signal that would tell you.
  An assumption with no signal is a liability.
- **Tradeoffs.** What this optimizes for and what it gives up. Name who pays.
- **Next steps.** What comes next, and what was deliberately cut. The cut half
  matters more: it stops the next contributor re-adding what you refused.

---

## 3. Make the history readable

**Find the project's workflow first.** Projects differ: one opens PRs and runs
CI, another commits straight to `main` and deploys by FTP. Read it from the
project's `CLAUDE.md` (or `AGENTS.md`). If neither says, infer it from git
(remote, branches, merge commits), state what you assumed, and suggest adding
one line to `CLAUDE.md` so the next run doesn't have to guess. Then put each
piece where that workflow keeps it:

| Workflow | Verification goes in | Decision log goes in |
|---|---|---|
| PRs | The PR description | The PR description |
| Direct commits | The commit message | The reply |
| The user commits their own work | A drafted commit message, in the reply | The reply |
| Read-only run (no diff) | The reply | The reply, reduced as the playbook says |

A design doc is linked only if one exists. Don't invent one to link.

- Commits in the order the work was proved, per
  [Sequence Verifiable Units](../../sequence-verifiable-units/SKILL.md). For a
  bug fix, the failing repro lands before the fix. With no test suite, the
  repro is the command and its failing output, pasted where verification goes.
- Each commit message says what changed and why, never how.
- The commit or PR description carries the verification: what you ran, and its
  output. Paste it verbatim rather than describing it.
- Link only artifacts you produced or read this session. Never fabricate a link,
  a citation, or a reference to a transcript.

---

## 4. Encode anything that will recur

If the work turned up a rule, a constraint, or a mistake you expect to see
again, encode it now, per
[Encode Lessons in Structure](../../encode-lessons-in-structure/SKILL.md). Use
the highest rung the project allows:

1. A type, schema, lint rule or test.
2. A runtime check in the code itself: a validation or assertion that fails
   loudly in development.
3. A small script with no dependencies (a `grep` that exits non-zero when the
   rule is broken), run by hand or from a git hook.
4. The project's agent instructions (`CLAUDE.md`, `AGENTS.md`), with an example
   of the failure. Every agent session reads them, so this survives, but nothing
   enforces it.
5. A comment beside the code, linking the evidence.

Some projects rule out tooling on purpose, and rungs 1 and 3 aren't available.
That's fine. Say which rung you used and why not the one above it.

A lesson recorded only in this handoff will not survive. If you cited that
principle, the diff contains one of these rungs. If it does not, you did not
apply it.

---

## 5. Write the reply

Per the reply conventions in [astack-mode](../SKILL.md). Terse is not an excuse
to drop content: short sentences, but every section the originating playbook's
reply line names stays.

**How to verify the handoff:**
- Someone with none of your context could continue, disagree, or undo
- Every claim is labeled or carries its evidence
- The rejected alternatives are named, not just the choice
- The deliberate cuts are written down
- No claim is a guess that a command you could have run would have settled
