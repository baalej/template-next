---
name: minimize-reader-load
description: "Apply when reviewing or shaping code that is hard to trace, and before adding a layer or a piece of shared state. Count the layers between a question and its answer, and the hidden state a reader must hold; collapse one-caller wrappers and shrink mutable scope."
disable-model-invocation: true
---

# Minimize Reader Load

**Rule:** Maintainability is the work a reader has to do to understand the code. Measure it on two axes — **layers to trace** and **state to hold** — and guard both. Lines of code, cyclomatic complexity, and "clean architecture" are proxies for this; reader load is the thing they are proxies *for*.

**When to apply:** Reviewing code that is hard to follow. Shaping code you're about to hand over. And specifically before adding a layer, an abstraction, or a piece of shared state.

## The two axes are independent

**Layers to trace** — the indirections between a question and its answer. How many files do you open to find out what a function actually does?

**State to hold** — the hidden or mutable context a reader must keep in their head to predict what happens. Globals, module state, fields mutated from elsewhere, implicit ordering.

They're independent, and guarding one while ignoring the other is the common failure. A flat file with fifty globals is as hard to reason about as a six-layer adapter stack. One has no layers and unbounded state; the other has no state and unbounded layers. Both are expensive.

## On the layer axis

- **Collapse layers that cost more than they save.** A wrapper with one caller, an adapter with no second implementation, speculative indirection that was never needed — inline them. "We might need it later" has already been paid for and not yet used.
- **Adjacent layers must change the abstraction.** A layer that forwards the same method names and arguments one level down adds reader load and compresses nothing. That's a pass-through; delete it.
- **Demand interface compression.** A broad interface that hides little makes the reader learn both the surface *and* the implementation underneath. Prefer boundaries that hide a meaningful decision.

## On the state axis

- **Shrink scope, in this order:** pure functions (return rather than mutate) → locals → fields → module state → globals. Move down that list only with a reason.
- **Derive instead of syncing.** Two values that must agree are a bug waiting for the moment they don't. Compute the second from the first.
- **Name the invariant at the boundary**, not in every consumer, so the reader learns it once instead of inferring it repeatedly.

## The test

Can a new reader answer these two questions in under 30 seconds?

1. **Where does X come from?**
2. **What can change X?**

If not, cut layers or cut state. The question of which one tells you which axis you overspent on.

Before adding either, ask: does this reduce reader load somewhere else by at least as much as it adds here? A layer that saves five callers from a detail is earning its place. A layer that exists because layers feel organized is not.

**The sign you skipped this:** you had to read the implementation to trust the interface. Or you kept a diagram in your head to follow a single request.

---

## Related

The measurable half of [Code is Documentation](../code-is-documentation/SKILL.md). That principle governs naming and local clarity; this one governs structure, and a perfectly named one-caller wrapper is still a layer the reader has to step through.

Served by [Model the Domain](../model-the-domain/SKILL.md) on the state axis — a structure that makes invalid combinations unrepresentable is state nobody has to hold.

Bounded the same way as everything else by [Laziness Protocol](../laziness-protocol/SKILL.md): deletion is the cheapest way to reduce reader load, and it's available more often than it feels.

Backs the **Maintainable** gate in `astack-mode`'s quality gates, which otherwise rests on naming alone. "A reader unfamiliar with the code understands it in five minutes" is this principle's claim, and the 30-second test is how you check it rather than assert it.
