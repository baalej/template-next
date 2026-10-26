---
name: laziness-protocol
description: "Apply before adding a feature, abstraction, layer, or library, and when sizing a diff. Bias to deletion and the smallest change that solves the problem you have now."
disable-model-invocation: true
---

# Laziness Protocol

**Rule:** Bias toward deletion and the smallest change that solves the problem. Do not add complexity, abstraction, or features unless they solve a real problem you have now. Delete dead code, redundant validators, and stub references before building on the base.

**When to apply:** Before adding features, during refactoring, when choosing between multiple solutions, before introducing abstractions or libraries.

## Core requirements

### 1. Delete before you add.

- If code is unused, delete it. Don't keep it "just in case."
- If a feature isn't solving a current problem, don't ship it.
- If a library can be replaced by 10 lines of code, do it.
- Deletion removes surface area for bugs. Addition creates it.

### 2. Choose the smallest change that solves the problem.

- If you need a feature flag, add a feature flag. Don't build a whole configuration system.
- If you need to cache one endpoint, cache that endpoint. Don't build a caching framework.
- If you need a validation rule, add the rule. Don't redesign the entire validator.
- Small changes are easier to review, test, understand, and revert.

### 3. Avoid premature abstraction.

- One caller doesn't need an abstraction. Write the code directly.
- Two similar pieces might be coincidence. Three similar pieces might be a pattern worth abstracting.
- Don't design for hypothetical future use cases. Solve the problem you have.
- Abstraction has a cost (indirection, naming, mental overhead); only pay it when the benefit is real.

### 4. Question scope creep ruthlessly.

- If a requirement feels like it belongs in this work, ask: does it solve a current problem or a theoretical one?
- If it's theoretical, cut it. Ship the core. Add it later if it's still needed.
- Smaller scope = faster delivery, easier to verify, easier to change if wrong.

## Signals to watch for

- About to add a feature "because it might be useful later." (Don't. Ship without it.)
- Building a framework when a function would do. (Use the function.)
- Keeping code that's no longer called. (Delete it.)
- Creating abstraction layers for code that has one caller. (Inline it.)
- Adding configuration options for hypothetical scenarios. (Don't. Add them when the scenario is real.)
- A PR that does three things when one would solve the immediate problem. (Split it or cut scope.)

## Anti-patterns to avoid

- **Over-engineering**: Building frameworks and abstractions for problems that don't exist yet.
- **Complexity accumulation**: Adding features incrementally until the code is untraceable.
- **Dead code**: Keeping old code "just in case" it's useful later.
- **Speculative optimization**: Adding caching, batching, or async before measuring a real problem.
- **Scope creep**: Expanding a task to include nice-to-haves instead of shipping the core.

---

## Related

Bounds [Build the Lever](../build-the-lever/SKILL.md) (smallest script, never a framework) and [Exhaust the Design Space](../exhaust-the-design-space/SKILL.md) (prototypes are throwaway probes, and if the answer is already obvious there is nothing to explore).

Bounds [Model the Domain](../model-the-domain/SKILL.md): the smallest structure that removes the branches, never a framework. An abstraction that adds indirection without deleting anything has failed both principles.

Usually wins against [Details Compound](../details-compound/SKILL.md). The best motion decision is most often none at all.

Does not override [Quality Over Speed](../quality-over-speed/SKILL.md). This principle cuts scope and code, never proof. "Smallest change" never means "unverified change".
