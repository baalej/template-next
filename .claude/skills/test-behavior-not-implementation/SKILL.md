---
name: test-behavior-not-implementation
description: "Apply whenever you write a test, change one, or decide whether to keep one. Assert what the code's users can observe, so the test fails when that behavior breaks and keeps passing when only the internals change."
disable-model-invocation: true
---

# Test Behavior, Not Implementation

**Rule:** A test is a claim about what the code does for somebody. Assert what that somebody can observe through the interface they actually use. A test that passes when the behavior is broken proves nothing. A test that fails when nothing observable changed costs you a rewrite on every refactor and still catches no bug.

**When to apply:** Writing a test, changing a test, reviewing one, or deciding whether an existing test earns its place.

## Who the users are, and what they can see

Name the user before you assert anything. It is a caller, an end user, or another system.

**Observable** — return values, raised errors and their types, state the user can read back, and effects on anything outside the code: a request sent, a row written, a message published, a file on disk.

**Not observable** — private helpers, the order internal functions were called in, intermediate values, and which collaborator did the work.

The boundary decides, not the shape of the assertion. The payload a mocked payment provider receives *is* behavior, because that provider observes it. A call to an internal helper is not, because nobody outside can see it.

## The two-edit test

Judge every test against two edits you imagine making to the code.

**Edit one: break the behavior.** Return a wrong value, skip an effect, or do it twice. **The test must fail.** If it still passes, it is decoration. The usual causes:

- The assertion is looser than the contract (`expect(result).toBeTruthy()` where the contract promises a specific value).
- The expected value was computed by the code under test, so both sides move together.
- The test asserts a constant or a string it declared itself, never running the code that reads it.
- The test asserts on data it built, not on data the system produced.

**Edit two: change the internals.** Keep every observable result identical and restructure underneath. **The test must still pass.** If it fails, it is pinned to the implementation.

Keep tests that survive both. Rewrite or delete the rest — a test you have to edit during every refactor is a liability with a reassuring name.

## Writing one that passes both

- Drive the code through the interface its users use, with a concrete input.
- Derive the expected value from the requirement, not from running the code and pasting what came back.
- Assert what the contract promises. No less, and no more: an exact error *message* pins wording no caller reads, while the error *type* callers branch on is the contract.
- An invariant can be the behavior. "This key exists in both tables" or a compile-time type check are assertions about behavior even though no call is involved.
- When the promise is a negative — "an empty cart never charges" — assert the absence, then pair it with a case where the charge does happen. Otherwise you cannot tell a working test from a broken one.

**The sign you skipped this:** a refactor that changed no observable behavior broke tests. Or a bug shipped while the suite stayed green.

---

## Related

The verification arm of [Quality Over Speed](../quality-over-speed/SKILL.md): that principle demands proof, this one decides whether a given test *is* proof.

For interfaces, the equivalent judgment lives in [Verify By Eye](../verify-by-eye/SKILL.md) — a screenshot is the visual version of an assertion too loose to fail.

Pairs with [Sequence Verifiable Units](../sequence-verifiable-units/SKILL.md): the check that closes each unit has to be one that can actually fail. A unit ending in a decorative test is an unverified unit.

A test is the weakest of the guardrails in [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md). Prefer a type or a schema when one can carry the rule; reach for a test when the rule is about behavior rather than shape.
