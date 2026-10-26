---
name: attack-the-premise
description: "Apply when two or more fixes that share one assumption have failed the same check. Write the shared premise down and test it directly before writing another fix that depends on it."
disable-model-invocation: true
---

# Attack the Premise

**Rule:** When two or more fixes that share one premise have failed the same check, suspect the premise rather than the fixes.

**When to apply:** The moment you are about to write a third fix for a problem two fixes have already failed to solve. That is the trigger, and it's a narrow one — this principle does nothing useful before it fires.

**Why:** Each failed fix is evidence against the belief it assumed. A third fix built on the same premise spends effort in the one place the evidence already says the cause isn't. The reason this is worth a principle is that it runs against the grain: two failures feel like a reason to try harder in the same direction, because you've just built up context there.

## Pattern

**Write the premise down.** One sentence: the thing every failed fix assumed was true. Until it's written, it stays an assumption you're reasoning *from* rather than a claim you can test. If you can't state it in a sentence, that difficulty is itself the finding — you have been fixing something you haven't described.

**Find an observation that comes out differently if it's false.** Not a test of the fix — a test of the belief. Then make that observation before writing any more code.

**Look at how the failures are distributed, not just how big they are.** Magnitude tells you how bad it is. Distribution tells you what the cases have in common, which is where the real cause shows up. If every failure lands on one shard, one tenant, one code path, one time of day, that pattern is the evidence and the premise probably doesn't mention it.

**Then follow where it goes.** If the evidence contradicts the premise, the cause is elsewhere — look for what the failures share that the premise failed to predict. If the evidence *confirms* the premise, you've narrowed it honestly: ask the next "why" per [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md), because the earlier fixes were probably treating a consequence rather than the cause.

**Prefer removing the condition to compensating for it.** If the evidence shows one case always lands on the losing side, change what puts it there. A mechanism that cleans up afterwards leaves the cause in place and adds work on every run.

**Stop:** do not start the next fix before the premise is written down and tested. The whole value of this principle is the pause.

**The sign you skipped this:** a third attempt at the same problem that assumes everything the first two did. Or a changelog where several consecutive entries all touch the same area and none of them closed the issue.

---

## Related

Sharpens [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md) for the specific case where you are already stuck. That principle traces one symptom to its origin; this one questions a fact the whole investigation has been assuming, which is what you need when tracing has already failed twice.

Make the check rerunnable rather than a one-off observation, per [Build the Lever](../build-the-lever/SKILL.md) — a premise worth testing once is usually worth being able to retest after the real fix.

When the premise turns out to be about a measurement ("the slow part is the query"), [Explain the Number](../explain-the-number/SKILL.md) is the better tool: naming the limiter tests that premise directly.

Distinct from [Plans Evolve; Principles Don't](../plans-evolve-principles-dont/SKILL.md), which changes the plan when the world turns out differently. This changes your model of a system that has been telling you, twice, that you have it wrong.
