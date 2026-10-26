---
name: quality-over-speed
description: "Apply at the start of any work, in review, and under deadline pressure when tempted to ship something unproven. Optimize for verifiable, maintainable, correct code, never for velocity. Proof runs against the real artifact, not a proxy."
disable-model-invocation: true
---

# Quality Over Speed

**Rule:** Optimize for code that is verifiable, maintainable, and solves the problem once. Do not optimize for lines of code, commits merged, or velocity.

**When to apply:** At the start of any work, during code review, when choosing between "ship fast" and "ship well," and when facing deadline pressure.

## Core requirements

### 1. Code must be proved robust.

Before declaring work done, demonstrate that the code works as intended against the real artifact (run the feature, observe output, inspect the diff). The method of proof depends on your tech:

- If you have a test framework available: automated tests that exercise the user's path.
- If you have a UI: run it and observe it systematically — see `verify-by-eye`. A screenshot is not proof; it cannot show timing, interruption, or stutter.
- If you have a CLI: run the commands and verify output.
- If you have a library: call it as a user would and verify the result.
- **Do not accept "it compiles" or "no errors" as proof.** Compilation silence is not correctness. For interfaces, "it renders" is the same claim wearing a different hat.

### 2. Code is its own documentation.

Write code so clear that a reader unfamiliar with the project understands it in five minutes. Use precise names, explicit types, obvious structure. Write comments only when the WHY is non-obvious—never to explain WHAT the code does (if it needs explanation, the code is unclear).

## Signals to watch for

- Implementing before architecture is clear. (Stop. Nail the shape first.)
- Declaring work done without running it. (Stop. Prove it works on the real artifact.)
- Code that requires comments to understand. (Rewrite it to be self-evident.)
- "We'll refactor this later" as a pattern. (No. Do it now if it matters; delete it if it doesn't.)
- Accepting partial features or known bugs. (Ship complete, verified pieces instead.)

## Anti-patterns to avoid

- **Slop shipping**: Multiple rough features that compound debt faster than they deliver value.
- **Deferred verification**: Skipping proof steps to save time. (Proof is non-negotiable.)
- **Comment-as-documentation**: Walls of comments explaining unclear code. (Fix the code.)
- **Speed over correctness**: Velocity theater—measuring success by commits merged instead of by reliability and user value.

---

## Related

For interfaces, the proof method is [Verify By Eye](../verify-by-eye/SKILL.md). "It renders" is the interface equivalent of "it compiles", and this principle rejects both.

[Plans Evolve; Principles Don't](../plans-evolve-principles-dont/SKILL.md) names these gates as the fixed half of the system. The plan is negotiable, the gates are not.

[Sequence Verifiable Units](../sequence-verifiable-units/SKILL.md) is how this scales past a single change: proof per unit, not one audit at the end.

For whether a change breaks something it doesn't touch, [Blast Radius](../blast-radius/SKILL.md) grades the proof on five rungs, where "you said so" is the bottom one.

Not overridden by [Laziness Protocol](../laziness-protocol/SKILL.md). That one cuts scope, not verification.
