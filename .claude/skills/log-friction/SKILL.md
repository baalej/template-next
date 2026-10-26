---
name: log-friction
description: "Apply when invoked after working with astack, to review this session and append what chafed to FRICTION.md. Records complaints about astack itself; it does not edit skills, propose fixes, or manufacture findings when the run went fine."
disable-model-invocation: true
---

# Log Friction

**Rule:** Review the session you are in, find where **astack itself** got in the way, and append it to `FRICTION.md`. Record the complaint. Do not fix anything.

**When to apply:** Invoked directly (`/log-friction`) after a real task, usually at the end of a session. Not routed into from a playbook step.

**Scope:** astack's own rough edges, any stack. The subject is the bundle, never the user's code — a lesson about their codebase goes into their codebase, per `encode-lessons-in-structure`.

You have the session in context already. No transcript parsing, no subagents. Read back over what happened and be specific.

---

## 1. Separate friction with astack from friction with the task

**This is the distinction the whole skill rests on.** A hard bug, a confusing codebase, a wrong first guess — that is work being difficult, and it is not a finding. Log only where the *instructions* were the problem.

| Not a finding | A finding |
|---|---|
| The bug took four attempts to locate | The Fix playbook's step 2 gave no help on where to start looking |
| The design question was genuinely hard | The Design playbook assumed a design doc that didn't exist |
| You didn't know the codebase | The Learn playbook's steps didn't fit a codebase this small |
| A measurement was noisy | `explain-the-number` asked for a limiter the tooling can't report |

If the task would have been just as hard without astack, there is nothing to log.

## 2. Look for these specifically

- **Routing.** Did `astack-mode` match the right playbook? Did it match none, or did you override it? A wrong match is the highest-value entry in this file.
- **Steps you skipped.** Which ones, and why. **This is the signal that is easiest to miss**, because skipping a step feels like working normally rather than like friction. Go back and check what the playbook actually asked for versus what happened.
- **Steps that were too vague to act on**, or asked for something this task had no version of.
- **Missing steps** you had to invent.
- **A principle that gave nothing** where it should have, or one you cited without it changing a decision. A principle that never changes a decision is decoration.
- **A depth skill you wanted that doesn't exist.**
- **A default that read as a rule** and slowed the work down. Especially relevant to experimental work, where departing from a default should feel free.
- **Reply or handoff contracts** that asked for sections with nothing to put in them.

## 3. Write entries, not proposals

**Where the file lives.** Installing astack copies only its skills, so a project never has `FRICTION.md` until this skill creates it. Use `.claude/FRICTION.md` in the project. Not inside `.claude/skills/`, where a skills update overwrites it. Before creating it, check the project's deploy: if the whole repo is uploaded (FTP, rsync), make sure `.claude/` is excluded, or ask where the log should go. If the file is missing, create it with this header:

```markdown
# Friction log

Complaints about astack itself, appended by `log-friction`. Records only; no fixes here.
Triage gate: would the change alter a future decision? One rough session is an anecdote, not a rule.

## Entries
```

Triage happens in the astack source repo, where the entries are copied into its own `FRICTION.md`. That repo also has `scripts/check-bundle.mjs`; a project does not.

Append under `## Entries`, replacing the placeholder if it is still there. One dated block per session:

```markdown
### 2026-10-24 — fixing the session timeout bug

- Fix playbook step 2 said "trace to root" with no help on where to start. Spent
  three passes grepping before thinking to check the config loader.
- Skipped step 5 (encode the lesson) — unclear whether a one-off config typo is
  a class worth encoding. The step doesn't say how to decide.
- `blast-radius` rung 4 wanted a script that imports the real library. Took
  longer than the fix did. Possibly correct, possibly overkill here.
```

Keep the user's own words where they said something. Raw complaints are more useful later than tidied ones — the rationalising is what loses the information.

**Do not** propose a fix, edit a skill, or rank by severity. Triage comes later, with the whole log visible, under this gate: *would the change alter a future decision? One rough session is an anecdote, not a rule.*

## 4. Log the uncertainty too

When you can't tell whether something was astack's fault, write that down as the entry. "Skipped step 4, not sure if the step is wrong or if this task just had no version of it" is a real finding — it says the step doesn't state when it applies.

## 5. Nothing is a valid result

**If the run went fine, write nothing and say so.** An invoked skill feels obliged to produce findings, and an invented finding is worse than an empty log: it sends the next triage pass at a problem nobody had, and it inflates a bundle that is already large.

"Used the Build playbook end to end, nothing chafed" is the correct output when it's true.

## What this skill cannot see

Worth stating plainly, because it bounds the whole exercise:

- **It can't catch a skill it misread.** If a step was followed confidently in the wrong direction, that reads as a smooth session from the inside. Those only surface when a human notices the output is wrong.
- **It can't see what wasn't attempted.** A playbook that quietly discouraged a better approach leaves no trace.
- **It is marking its own work**, and will under-report its own misunderstandings.

So this skill lowers the cost of logging; it does not replace noticing. If you felt something was off and no entry captures it, add it yourself in your own words.

---

## Related

The workflow half of [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md). That principle says encode a recurring lesson rather than restating it; every playbook pointed it at the user's codebase, and nothing pointed it back at astack. This is that path.

What it produces is input to a later triage, not a change. The structural half is already mechanical: `scripts/check-bundle.mjs`, in the astack source repo, enforces astack's conventions, and each of its rules exists because something broke by hand. This file is how the skills get the same treatment.

For changes to a skill's **description or routing**, verification needs repeated trials, because matching is stochastic and a single run proves nothing. Claude Code's `skill-creator` runs evals with variance analysis and is the right tool there. For a vague step or a missing one, re-running the task that produced the complaint is enough.

Evidence labels apply here as everywhere (`astack-mode`): "step 2 gave no guidance" is **measured** if you reread the step, and **inferred** if you are going from memory of how it felt.
