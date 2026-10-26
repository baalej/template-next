---
name: encode-lessons-in-structure
description: "Apply after solving a hard problem, or the second time you write the same instruction or hit the same mistake. Encode the rule as a type, lint rule, schema, validation, or test, not as prose. Make illegal states unrepresentable."
disable-model-invocation: true
---

# Encode Lessons in Structure

**Rule:** When you discover a constraint, rule, or pattern worth repeating, encode it in the system—as a type, lint rule, validation, schema, middleware, or test—not as prose. Make illegal states unrepresentable and non-obvious rules automatic.

**When to apply:** After solving a hard problem, when a principle needs enforcement, when you discover a business rule, when the same mistake appears twice.

## Core requirements

### 1. Types and schemas prevent entire categories of bugs.

- Bad: String fields that should be numbers, dates, or enums.
- Good: Use types or schemas that make wrong values impossible.
- Bad: Optional fields that are "always set in practice."
- Good: Make them required in the type system.
- Bad: Comments saying "don't reorder these, it matters."
- Good: Encode the order in a type or validation.

### 2. Lint rules catch policy violations automatically.

- Bad: A comment in three files saying "never log passwords."
- Good: A lint rule that flags any logging of fields named `password`, `secret`, `token`.
- Bad: "We should always validate input" in the docs.
- Good: Middleware or decorators that enforce validation at all boundaries.

### 3. Tests encode non-obvious constraints.

- Bad: A comment saying "this endpoint must cache for at least 30 seconds because X service is slow."
- Good: A test that fails if cache duration is less than 30 seconds.
- Bad: "Make sure this stays under 100ms" in a meeting note.
- Good: A performance benchmark that breaks CI if latency exceeds 100ms.

### 4. Document *why* when encoding isn't enough.

- Some projects rule out tooling on purpose: no build step, no linter, no test suite. Then go down the ladder in [Handoff §4](../astack-mode/playbooks/playbook-handoff.md): a runtime check, a dependency-free script, the project's agent instructions with an example of the failure, a comment. Say which rung you used.
- If you can't fully encode a lesson, link the code to the evidence (incident ticket, performance data, security advisory).
- Example: A comment linking to an incident: `// Bug #456: queries without this index timeout under load.`
- The evidence is the proof; the code is the enforcement.

## Signals to watch for

- A rule stated in prose that appears in multiple places. (Encode it.)
- A constraint that "everyone should know." (Make it automatic; don't rely on memory.)
- The same mistake appearing in two different branches or files. (Encode it so it can't happen again.)
- A code comment warning about a specific error. (Add a lint rule or type that prevents it.)
- New team members making mistakes that "should have been obvious." (It wasn't obvious. Encode it.)

## Anti-patterns to avoid

- **Comments as policy**: Saying "don't do X" in prose instead of making X impossible in code.
- **Trust instead of verification**: Assuming people will follow a pattern without enforcement.
- **Undocumented constraints**: A business rule buried in old tickets, not in the code.
- **Type-agnostic when types matter**: Using `any`, `Object`, or strings when a specific type would prevent bugs.
- **Lint-free codebases**: No rules enforcing project-specific constraints or patterns.

---

## Related

Distinct from [Build the Lever](../build-the-lever/SKILL.md), which builds a tool to do or prove the work in front of you. This makes a rule automatic for everyone who comes later, whether or not they read anything.

Preferred over [Code is Documentation](../code-is-documentation/SKILL.md) when a rule carries real cost if broken. Clarity relies on the reader, structure does not.

The usual trigger is [Root Causes, Not Symptoms](../root-causes-not-symptoms/SKILL.md) finding a bug class rather than a bug: the root fix closes the instance, this closes the class.

This principle points at your codebase. Pointed back at astack itself, it is [Log Friction](../log-friction/SKILL.md) — a step that keeps chafing is a lesson about the skill, not about the work.
