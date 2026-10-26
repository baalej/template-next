---
name: exhaust-the-design-space
description: "Apply before committing to a non-trivial design, when a choice between approaches feels uncertain, or on an architectural decision with no precedent. Build 2-3 genuinely competing prototypes and compare them, rather than refining the first idea."
disable-model-invocation: true
---

# Exhaust the Design Space

**Rule:** Before committing to a design, build 2-3 competing prototypes and compare them side by side. Evaluate based on interface depth, complexity, and tradeoffs, not on first impressions. The best design often isn't the first one you think of.

**When to apply:** Before starting any non-trivial work (features, refactors, new systems), when a design feels uncertain, when you're choosing between approaches, during architecture decisions.

## Core requirements

### 1. Build multiple competing prototypes.

- Design A: One approach to solving the problem.
- Design B: A structurally different approach.
- Design C (optional): A third alternative, especially if A and B are similar.
- Each prototype should be a genuine alternative, not a minor variation.
- Don't bias toward your first idea; force yourself to think of at least one fundamentally different approach.

### 2. Compare on the right criteria.

- **Interface depth**: Which design hides more complexity behind a simpler surface?
- **Caller experience**: Which is easier to use correctly? Which makes mistakes obvious?
- **Flexibility**: Which can adapt to changes without redesign?
- **Implementation complexity**: Which is simplest to build and maintain?
- **Data flow**: Which makes the flow of data through the system obvious?
- Do not compare on "which one I like" or "which one I thought of first."

### 3. Evaluate against design red flags.

- Shallow, pass-through methods (method exists just to delegate to something else).
- Information leakage (caller needs to know internal details to use the API).
- Temporal decomposition (the design reflects the order things happen, not the logical structure).
- Weak types or implicit contracts.
- Ask: Is this design a natural fit for the problem, or is it forcing the problem into a shape?

### 4. Choose based on evidence, not preference.

- If prototype A is simpler to use but harder to implement, and B is harder to use but easier to implement, which matters more?
- Document your choice. Why did you pick design A over B and C? What tradeoff are you making?
- If your reasons are "I liked it" or "I thought of it first," that's not enough. Go deeper.

### 5. Be willing to scrap and redesign.

- If during implementation you discover the chosen design is wrong, scrap it.
- Don't patch a wrong design; redesign from first principles (Principle 3).
- The prototyping phase should have caught this, but it's not a failure if it didn't—it means you learned something.

## Signals to watch for

- Committing to a design without considering alternatives. (Stop. Build at least one more prototype.)
- Defending your chosen design instead of evaluating it objectively. (Step back. Which is actually better?)
- A design that feels awkward during implementation. (The prototype phase should have caught this; it's a signal to reconsider.)
- Choosing a design because "it's familiar" or "we've done it before." (Familiar isn't always right. Evaluate on merit.)
- No record of why this design was chosen. (Document the tradeoff; it helps reviewers and future maintainers.)
- Prototyping but only half-heartedly (design B is an obvious loser, design C is barely different). (Force genuine alternatives.)

## Anti-patterns to avoid

- **First-idea bias**: Committing to the first design you think of without exploring alternatives.
- **Familiar-pattern bias**: Choosing a design because you've used it before, not because it's best.
- **Prototyping theater**: Building prototypes but deciding based on preference, not evaluation.
- **Incomplete prototypes**: Sketching design B and C but only fully building A, so you can't really compare.
- **Defending the wrong design**: When evidence suggests a different design is better, accepting it instead of doubling down on your original choice.

---

## Related

Held in tension with [Laziness Protocol](../laziness-protocol/SKILL.md). Two or three prototypes are not scope creep — they are throwaway probes that let the smallest real change be identified rather than guessed. Delete all of them, then build one. If the answer is already obvious, Laziness wins and this does not apply.

Runs after [Foundational Thinking](../foundational-thinking/SKILL.md) has named the data shape: competing designs are compared over the same structure, or they are not comparable.

Discharged by the **Prototype** playbook (`astack-mode/playbooks/playbook-prototype.md`), which is where competing sketches actually get built, compared and thrown away. A question whose answer is observable by running something goes there rather than to the human, per the empirical-fork rule in [astack-mode](../astack-mode/SKILL.md).
