---
name: model-the-domain
description: "Apply when writing stateful logic, or when code branches heavily or repeats the same shape assumption across files. Encode the domain in a structure — a state machine, a typed model, a table or registry, a reducer — instead of scattering it across conditionals."
disable-model-invocation: true
---

# Model the Domain

**Rule:** Put the domain in a data structure, not in conditionals spread across files. A structure that matches the domain makes invalid states unrepresentable and deletes branches rather than accumulating them. Choosing it while writing is cheap. Recovering it later reads as a refactor, which means it gets deferred indefinitely.

**When to apply:** Before writing stateful logic. When a function branches a lot. When the same shape assumption — "this field is set by now", "these two booleans move together" — is repeated in more than one file.

This is the companion to [Foundational Thinking](../foundational-thinking/SKILL.md). That principle says get the structure right before the logic; this one says **which** structure.

## Reach for

- **A state machine** instead of scattered booleans, phase flags, or lifecycle checks. If `isLoading`, `isReady` and `hasError` can be true in combinations that mean nothing, they are one state field wearing three names.
- **A typed model** instead of loose parameters or a shape assumption repeated across call sites.
- **A map, registry, lookup table, or discriminated union** instead of branching spread over several files. A new case should be a new row, not a new branch in three places.
- **A reducer or command/event model** instead of ad-hoc mutation from many callers.
- **A module organized around one body of domain knowledge**, not around a sequence of steps.
- **A queue, cache, index, graph, tree, or normalized collection** where the access pattern calls for it. The structure should match how the data is *read*, not how it arrived.

When none of these fit, work out two things — what the code must never allow, and how the data gets read — then find the structure that encodes exactly that.

## Temporal decomposition is the subtle one

A module split as `load → validate → transform → save` looks organized and is usually wrong. **Execution order is not ownership.** Each phase ends up repeating the same domain rules, so a rule change touches four files that have nothing in common except when they run.

Organize by what the code *knows about*, not by when it happens.

## Don't force it

Prefer boring code when the current shape is already clear, local, and unlikely to grow. Be skeptical of any abstraction that adds indirection without removing branches, duplicated rules, invalid states, or lifecycle risk — that is cost without the compensating benefit, and the [Laziness Protocol](../laziness-protocol/SKILL.md) applies.

A structure chosen to look sophisticated is worse than the conditionals it replaced, because now the reader has to learn it *and* trace through it.

**The sign you skipped this:** a new feature grows an existing if/else chain by one more branch. Or a second boolean appears that must stay in sync with the first. Or the same `if (x.kind === …)` shape appears in files that don't otherwise know about each other.

---

## Related

Answers the question [Foundational Thinking](../foundational-thinking/SKILL.md) raises. Run them together: that one establishes the data shape comes first, this one picks it.

Bounded by [Laziness Protocol](../laziness-protocol/SKILL.md) — the smallest structure that removes the branches, never a framework. An abstraction that adds indirection without deleting anything has failed both principles at once.

The most common true root in [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md) is a structure that permits a state the code then has to guard against. If the state should never exist, this principle is the fix; a guard where it broke is not.

Does most of the work [Minimize Reader Load](../minimize-reader-load/SKILL.md) asks for on the state axis: a structure that makes invalid combinations unrepresentable is state the reader no longer has to hold in their head.

When the structure can be made unrepresentable rather than merely conventional, [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md) takes it further — a type the compiler enforces beats a shape everyone agrees to respect.
