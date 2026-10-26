---
name: blast-radius
description: "Apply before shipping a change whose effects reach past the diff, or when reviewing a small diff you don't trust. Find what it could break somewhere else, then prove the one fact it's safe because of by running real code instead of writing it up."
disable-model-invocation: true
---

# Blast Radius

**Rule:** Find what a change breaks *somewhere else*, before it ships. Then stop writing and prove the one fact the safety of the whole thing rests on, by running code.

**When to apply:** Before shipping a change that touches shared code, a data shape, a wire format, or anything with callers you did not read. When a diff is small enough to look safe and you don't trust it. When a refactor claims to preserve behavior.

**Scope:** Any stack. The method is reading outward from a diff and then proving one fact; what you run to prove it is stack-specific.

**Listing the callers is not the job.** A grep finds those in a second. The job is the breakage grep won't show you.

## Don't trust your own writeup

A blast-radius writeup that sounds right is worthless. **It reads as convincing whether or not it's true** — that's the whole problem with the format, and the reason this skill exists as a method rather than a template. Prose about risk is indistinguishable from knowledge about risk.

So the deliverable is not the writeup. It's one or two facts, proven by running something.

## How sure are you

For each fact the change's safety depends on, get as far down this list as is cheap, **and say where you stopped**:

| | Level | astack label |
|---|---|---|
| 1 | You said so | **guess** — worthless on its own |
| 2 | You pointed at the line — a real `file:line`, or the library's own source | **inferred** |
| 3 | You showed the bad case can't happen — you walked the failure path step by step and it doesn't reach | **inferred** |
| 4 | You ran it — a script or test that calls the real code and fails loudly if you're wrong | **measured** |
| 5 | You reproduced it in the running app | **measured**, on the real artifact |

This is the Evidence section of `astack-mode` at finer resolution, for the specific question "is this safe". The three labels still apply; this says which rung produced them. **Level 4 is usually one small script** that imports the same library the app ships and calls the exact function you're worried about. That is nearly always cheaper than it sounds, and it is the difference between a review and an opinion.

## Steps

### 1. Read the change

The diff, the symbols it adds, changes and deletes, and what it now does differently — **including the part the diff doesn't spell out.** A removed early return, a changed default, a widened type, a renamed field that something serializes.

### 2. Find the one fact it's safe because of

Most changes that look risky are safe because of a **single fact** — "this only drops cache entries that were already dead, and does nothing else." Find that fact. If it holds, most of the risky cases clear at once.

Spend your time here. A long list of maybes is what you produce when you haven't found it.

### 3. Look where grep stops

This is the actual work, and it's everything a symbol search cannot see:

- **The library's own source**, at its pinned version, plus any local patch. Not its docs.
- **When things run** — microtasks, teardown and unmount order, effect timing, whether your framework batches.
- **Data that crosses a boundary** — the JSON an API returns, a database column, a cached value, a wire format, a queue message. Another service or another language reading the same bytes won't appear in any search of this repo.
- **Indirection a search can't follow** — a feature flag, a string-keyed registry, reflection, a config value, code three hops downstream.

### 4. Be honest about each risk

Give each one a real chance of happening and a real cost if it does. Keep the risks you confirmed; **list the ones you checked and cleared separately** — the cleared list is evidence of coverage and stops the next person re-checking them.

Cite a real `file:line`. **A search that finds nothing is still an answer** — say what you searched for and that it found nothing. Never invent a caller or an API.

### 5. Prove the one fact

Write the script or test, run it, and paste what happened. If you couldn't prove it, write **unproven** and say which rung you reached. An unproven safety fact is a legitimate result; a safety fact silently asserted at level 1 is not.

Make it rerunnable per [Build the Lever](../build-the-lever/SKILL.md) — a reviewer should be able to run it rather than take your word.

## What to hand back

- **What it does.** What changed, including the part that isn't obvious.
- **The one fact it's safe because of.** State it, say which rung you reached, show the proof. Or write unproven.
- **Risks.** Each with how it breaks, a real `file:line`, likelihood, cost, and how to check it.
- **Cleared.** What you checked and why it's fine.
- **Before you merge.** The cheapest test or repro that would catch the real bug, including the script you wrote.

---

## Related

Reads outward where the others read inward. [Code Review](../astack-mode/playbooks/playbook-code-review.md) judges the diff; [Break the UI](../break-the-ui/SKILL.md) stresses one component; this asks what *else* moves. Run it when a change's reach is the thing you're unsure about.

Supplies the fine-grained version of `astack-mode`'s **Evidence** labels for safety claims, and inherits its rule: never hand over a check you could have run. Here that rule has teeth, because level 4 is usually one small script.

The natural partner to [Sequence Verifiable Units](../sequence-verifiable-units/SKILL.md) on a refactor: "behavior is unchanged" is exactly the kind of claim that reads as convincing and needs a rung-4 proof rather than a paragraph.

When the one fact turns out to be false, you have a root cause rather than a risk — switch to [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md). When two attempts to establish it have both failed, the fact itself is the suspect: [Attack the Premise](../attack-the-premise/SKILL.md).

A risk you keep re-checking across changes belongs in a test or a type, not in another writeup, per [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md).
