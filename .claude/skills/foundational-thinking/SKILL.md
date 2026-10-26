---
name: foundational-thinking
description: "Apply before writing logic: at the start of a feature, before a refactor, when designing an API or data model. Get data structures, types, and boundaries right first. Implementation becomes obvious once the structure is sound."
disable-model-invocation: true
---

# Foundational Thinking

**Rule:** Before writing logic, get the foundations right: data structures, types, and system shape. The quality of downstream code is determined by upstream data design. Spend time on types, shapes, and boundaries first. Implementation becomes obvious once the structure is sound.

**When to apply:** At the start of any feature, before refactoring, when designing APIs or data models, before implementing complex logic.

## Core requirements

### 1. Get data structures right before writing business logic.

- Wrong structure forces workarounds throughout the codebase.
- Right structure makes downstream code obvious and simple.
- Spend 30 minutes designing the data shape; save 10 hours debugging scattered workarounds.
- Ask: What is the core entity? What are its properties? What relationships matter? What changes together?

### 2. Types and schemas are contracts, not bureaucracy.

- A type signature tells the reader (and the compiler) what's allowed in and what comes out.
- A schema defines what data is valid at system boundaries.
- Illegal states should be unrepresentable (can't construct invalid data).
- Correct types prevent whole categories of bugs before code is written.

### 3. Design caller usage first, then implementation.

- Start by writing code that *uses* the function, type, or API.
- What does the caller want? How should they invoke it? What should it return?
- Design the interface from the caller's perspective, not the implementer's.
- Then implement to match the interface you designed.

### 4. Sequence work: scaffold first, features second.

- Build the data structures and type boundaries first (the scaffold).
- Then fill in the business logic (the features).
- A sound scaffold with missing features is incomplete but correct.
- Missing scaffold with complete features will have to be torn down and rebuilt.

### 5. Ask "what is shared" before distributing state.

- When multiple parts of the code need to coordinate, identify shared state upfront.
- Don't scatter mutable state across files and hope they stay in sync.
- Centralize the source of truth, then derive other views from it.
- Concurrent actors reading/writing the same data require explicit coordination.

## Signals to watch for

- Starting to write business logic before you've named and structured the data. (Stop. Design the shape first.)
- Implementing a function, then realizing the caller needs something different. (Design caller-first, then implement.)
- Using `any`, `Object`, strings when a specific type would be clearer. (Define the type.)
- Multiple places updating the same mutable state. (Centralize it.)
- Logic that reads different fields from the same object in different places. (Define a type for what the logic needs.)
- "We'll refactor the data model later." (No. Refactor now; building on a weak foundation is waste.)

## Anti-patterns to avoid

- **Implementation-first**: Writing code before designing the shape it needs.
- **Weak types**: Using strings/numbers for things that deserve semantic types (UserId, Email, Timestamp).
- **Scattered state**: Mutable data spread across files with no single source of truth.
- **Implicit contracts**: Caller has to know the internals to use the API correctly.
- **Deferred design**: Shipping with a mediocre data model and planning to redesign later.
- **Over-coupling**: Making the shape so specific to one use case that other callers have to work around it.

---

## Related

Says the structure comes first; [Model the Domain](../model-the-domain/SKILL.md) says which structure to reach for. Run them together.

Runs before [Exhaust the Design Space](../exhaust-the-design-space/SKILL.md): name the data shape first, then compare designs over it.

Does most of the work that [Code is Documentation](../code-is-documentation/SKILL.md) asks for. A sound structure reads clearly on its own.

When the structure is what is broken, [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md) usually lands here. A data model flaw is the most common true root.
