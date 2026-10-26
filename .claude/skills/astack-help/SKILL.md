---
name: astack-help
description: "Apply when asked what astack can do, which skill or playbook fits a situation, or for a list of what's available. Answers from the skills on disk rather than a stored copy, so it cannot go stale."
disable-model-invocation: true
---

# astack Help

**Rule:** Answer "what's in astack" and "what should I use for this" from the files themselves. Never from a list written on this page.

**When to apply:** `/astack-help`, or any question about what astack offers or which part fits a problem.

**Scope:** astack's own contents, any stack. Read-only — it points, it never starts the work.

## Where the answer lives

**Do not keep a catalog here.** A second copy of every description would drift from the first, and drift is this bundle's most frequent defect. Instead:

- **The tables in `../astack-mode/SKILL.md`** — playbooks, principles, depth skills, each with a one-line summary. `scripts/check-bundle.mjs` verifies every row resolves to a real skill and that no skill is missing from a table, so the tables are trustworthy.
- **Each skill's own `description`** in its frontmatter. These are written trigger-first — they open with *when to apply*, so the use case is already the first clause. For a one-liner, take that clause.
- **`../../README.md`** for how the layers fit together.

Read what you need and answer from it. Don't guess a description you haven't read.

## Answering

**A general "what's available?"** — group it, because a flat list of every name tells nobody anything:

- **Playbooks** — the workflows. Start here; `astack-mode` matches one to your task. Two are reserved: `figure-it-out` when nothing matches, `handoff` as every playbook's last step.
- **Principles** — the values that guide decisions inside a playbook step.
- **Depth skills** — methods and recipe layers, reached from a step or invoked by name.

Count them from the tables if a number is asked for. **Don't state a count from memory** — this skill names things, it doesn't tally them, and a hardcoded number here is the drift it exists to avoid.

Name them with the *trigger* clause, not the full description. One line each, nothing else.

**A specific "what do I use for X?"** — this is the more useful question and deserves a short answer, not the catalog.

Name the one playbook that fits, plus at most two or three skills that bear on it, and say in a phrase why each. Then stop. If a playbook fits, say so and let `astack-mode` run it rather than listing its contents.

> "Something's slow." → **Perf playbook.** `explain-the-number` for why the measurement means what you think, `model-the-domain` if the limiter turns out to be a data shape.

**When nothing fits** — say so plainly. That's a real answer, and `figure-it-out` is the fallback that designs a playbook when none matches. Don't stretch a playbook to cover a task it wasn't built for.

## Keep it short

A help question wants orientation, not the manual. Lead with the answer, add a line of why, stop. The full tables are one file away if someone wants everything.

Don't explain astack's philosophy unless asked. Don't start the work — this skill ends with a pointer.

## Worth saying out loud

**Only `astack-mode` fires on its own.** Every principle and depth skill is reached by a playbook step naming it, or by the user naming it. So when someone asks "how would I have known that existed?", the honest answer is: `astack-mode` announces what a playbook routes into before step 1, this skill answers on demand, and anything can be asked for by name at any time.

---

## Related

The on-demand half of discoverability; [astack-mode](../astack-mode/SKILL.md) is the in-flight half, announcing what a matched playbook will route into before it starts. Between them, nothing should be reachable but invisible.

When astack turns out *not* to have what a situation needed, that is worth recording — [Log Friction](../log-friction/SKILL.md). "I asked for help and nothing fit" is one of the more valuable entries in the log.
