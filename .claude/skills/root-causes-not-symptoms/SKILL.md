---
name: root-causes-not-symptoms
description: "Apply when debugging, and when the same issue appears in several places. Trace each symptom back to the first place the system went wrong and fix it there. A guard is a fix only when the state it handles is legitimate."
disable-model-invocation: true
---

# Root Causes, Not Symptoms

**Rule:** When code breaks or misbehaves, trace to the root cause and fix it there. Do not apply surface fixes (nil-checks, guards, workarounds) that silence the problem without solving it. Fix the thing that's broken, not the symptom of it being broken.

**When to apply:** When debugging any bug, during refactoring, when you discover the same issue happening in multiple places.

## Core requirements

### 1. Reproduce first, understand second.

- Do not attempt a fix until you can reliably reproduce the problem on the real artifact (run the code, observe the failure).
- Understand the exact conditions that trigger it. "Sometimes it fails" is not a reproduction.
- Document the repro steps. This prevents fixing the wrong thing.

### 2. Ask "why" until you reach root.

- Symptom: "The query returned null and crashed."
- Why? "The query wasn't validating the input."
- Why? "The schema allows invalid dates."
- Why? "We're parsing dates as strings instead of using a date type."
- Root: The data structure is wrong. Fix that, not the null-check.
- Continue asking until the fix addresses the fundamental problem, not just this symptom.

### 3. Do not patch with guards that hide problems.

- Bad: `if (query) { ... } else { return null }` silences crashes but doesn't fix why query is null.
- Bad: Try-catch blocks that swallow errors without understanding why they occur.
- Bad: Defensive `|| defaultValue` when the real problem is the value shouldn't be undefined.
- Good: Fix the code so query is never null in the first place.
- Good: If null is valid, your design accommodates it, not guards against it.

### 4. Watch for patterns—they signal systemic issues.

- If you're applying the same guard in three places, the root cause isn't local to one function; it's in the data model or architecture.
- If the same type of bug keeps appearing, the design or validation strategy is flawed.
- Fix the pattern, not each instance.

## Signals to watch for

- Fixing the same bug in multiple places. (It's not fixed; the root is elsewhere.)
- Adding nil-checks or try-catches without understanding why the error occurs. (Understand first.)
- Feeling like your fix is a "workaround." (If it feels like a workaround, it probably is. Keep digging.)
- A bug that reappears after you "fixed" it. (You fixed the symptom, not the root.)
- Comments saying "this shouldn't happen but just in case..." (It shouldn't happen. Fix why it does.)

## Anti-patterns to avoid

- **Symptom-stacking**: Layering guards and workarounds instead of fixing the design.
- **Silent failures**: Catching exceptions or returning defaults without understanding why the error occurred.
- **Copy-paste fixes**: Applying the same workaround in multiple files when the real issue is centralized.
- **Defensive programming as a substitute for correctness**: Guards that prevent crashes but don't prevent bugs.
- **"Good enough" fixes**: Shipping a patch that works for this case but not the underlying problem.

---

## Related

When two fixes have already failed the same check, stop tracing and switch to [Attack the Premise](../attack-the-premise/SKILL.md) — at that point the shared assumption is the better suspect.

Once the root is a bug *class* rather than a single bug, hand off to [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md): the root fix closes the instance, the guardrail closes the class.

The true root is often the data shape. [Foundational Thinking](../foundational-thinking/SKILL.md) names what a correct structure looks like.

Stage the failing repro before the fix, per [Sequence Verifiable Units](../sequence-verifiable-units/SKILL.md). A fix whose repro never failed in front of you is a guess.
