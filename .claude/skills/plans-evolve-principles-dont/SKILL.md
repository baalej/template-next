---
name: plans-evolve-principles-dont
description: "Apply when pivoting scope, when a constraint surfaces mid-implementation, or when an initial assumption proves wrong. Change the plan freely, then re-verify against the same fixed quality gates."
disable-model-invocation: true
---

# Plans Evolve; Principles Don't

**Rule:** Start with a clear plan and architecture. Expect the plan to change as you build. When it does, re-verify against the same non-negotiable quality standards. The plan is not sacred; the quality standards are.

**When to apply:** When pivoting scope, discovering constraints during implementation, responding to feedback, or when initial assumptions prove wrong.

## Non-negotiable quality standards (apply to all code, always)

- **Performant**: Code executes efficiently. Do not ship slow code. Measure performance before declaring done. Know your bottlenecks and justify them. If code is slow, you have a specific reason and a plan to improve it. Bad performance is not a solution.

- **Secure**: No vulnerabilities. Validate at boundaries. Trust internal code. Secrets are never logged or exposed.
- **Correct**: Code does what it claims to do. Proofs exist (tests, runs, observations). Bugs are fixed at root, not patched.
- **Maintainable**: Clear names, obvious structure, minimal comments. A reader unfamiliar with the code understands it in five minutes.

These four are not negotiable for any feature, bug fix, or refactor. No exceptions.

## Core requirements

### 1. When you pivot, re-architect—don't patch.

- If initial assumptions fail and direction changes, redesign from first principles as if this new constraint was day-one.
- Do not bolt new requirements onto an architecture built for old ones.
- Delete or rewrite the old attempt; don't preserve it for backwards compatibility if the direction fundamentally changed.

### 2. Re-verify against all four standards when the plan changes.

- If scope shifted, your proofs are stale. Run them again.
- If architecture changed, old tests might pass but not validate the new contract. Rewrite or re-verify.
- Performance, security, correctness, maintainability must all hold in the new shape.
- **For performance specifically:** Re-measure. Old performance assumptions may no longer hold.

### 3. Document why the plan changed.

- When you pivot, record what assumption was wrong and what the new assumption is.
- If you made a performance tradeoff, document it explicitly.
- This prevents repeating the same false start.
- This helps reviewers understand the current shape (it's deliberate, based on learned constraints).

## Signals to watch for

- Shipping code you know is slow without justification. (Stop. Measure, optimize, or document the tradeoff.)
- "We'll optimize later." (No. Optimize now or don't ship.)
- Pivoting but preserving old code. (Delete and start fresh if direction changed.)
- "We'll add security later" or "we'll make it maintainable later." (No. These are non-negotiable now.)
- Skipping re-verification after a pivot. (Run all four quality gates again, including performance.)

## Anti-patterns to avoid

- **Performance negligence**: Shipping slow code without measurement or justification.
- **Deferred optimization**: Saying "we'll make it fast later" as a pattern.
- **Bolting on fixes**: Layering new features onto an architecture built for old constraints.
- **Outdated proofs**: Tests that pass but don't validate the current contract or performance.
- **Lost context**: Pivots with no record of why or what tradeoffs were made.

---

## Related

Names which half is fixed: the gates in [Quality Over Speed](../quality-over-speed/SKILL.md) do not move when the plan does. A pivot re-runs the proof, it does not waive it.

A pivot mid-sequence re-cuts the units. See [Sequence Verifiable Units](../sequence-verifiable-units/SKILL.md) — units already verified stay verified, downstream ones get resequenced.

The signals that a plan should change are usually assumptions breaking. Write them down with an early signal each, before they break.
