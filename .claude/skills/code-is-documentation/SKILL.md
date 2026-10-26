---
name: code-is-documentation
description: "Apply when writing any code, reviewing it, or refactoring. Write code a stranger understands in five minutes without comments: precise names, obvious structure. A comment earns its place only for a why the code cannot show."
disable-model-invocation: true
---

# Code is Documentation

**Rule:** Write code so clear that a reader unfamiliar with the project understands it in five minutes without comments. Use precise names, explicit types where available, obvious structure. Comments exist only when the WHY is non-obvious or when documenting a hidden constraint. Do one thing and do it well.

**When to apply:** When writing any code, during review, and during refactoring.

## Core requirements

### 1. Names must be precise and self-explanatory.

- `user` is ambiguous. `currentUser`, `authorizedUser`, `userWhoInitiatedTheRequest` are precise.
- `temp`, `data`, `result` hide meaning. Name for the thing's purpose.
- Boolean names should answer a question: `isActive`, `hasPermission`, `canDelete` (yes/no). Avoid `shouldProcess` (ambiguous).
- If you move code to another file/hook/helper, the name should tell the reader what it does without looking inside.

### 2. Use types where available; structure where not.

- If your language supports types (TypeScript, Python, Go): use them. They're free documentation.
- If not (JavaScript, bash): rely on precise names and clear structure to convey intent.
- Either way: the contract (what goes in, what comes out) should be obvious from the name and usage.

### 3. Do one thing and do it well (Unix/React principle).

- One responsibility per function/component/module. If you need "and" to describe it, split it.
- Extract complexity to another file/hook/helper only if the name makes the purpose clear. `useFormValidation()` is fine even if it's complex inside—the name says what it does.
- Related code should live together. Don't hide the important bit; abstract it cleanly with a clear interface.

### 4. Comments are rare and purposeful.

- **Allowed:** Explaining non-obvious WHY (performance tradeoff, workaround, domain knowledge). Can be multi-line if needed.
- **Allowed:** Documenting hidden constraints (e.g., "Must run before schema migration; old column referenced here").
- **Not allowed:** Explaining WHAT the code does. If it needs that, rewrite the code.
- **Not allowed:** Restating code as English (e.g., `// Check if user is admin` above `if (user.role === 'admin')`).
- Rule of thumb: If the comment could be replaced by renaming or restructuring, do that instead.

## Signals to watch for

- Function/variable names that require a comment to clarify. (`process()`, `handle()`, `data` need context—rename instead.)
- Comments explaining WHAT instead of WHY. (Rewrite the code to be self-evident.)
- Deep nesting or long functions. (Break into smaller, named pieces.)
- Code that contradicts its comment. (Fix the code; delete the comment.)
- Hiding important logic in a helper with an unclear name. (Rename or promote it.)

## Anti-patterns to avoid

- **Comment as crutch**: Using comments to hide unclear code instead of fixing the code.
- **Over-abbreviation**: Saving keystrokes at the cost of clarity. (`authUser` vs. `authorizedUser`—be explicit.)
- **Poor abstraction**: Moving code to another file but using a vague name like `utils.js` or `helpers.ts`.
- **Over-scattering logic**: Related code lives in five places; the reader has to hunt.

---

## Related

Where a rule is worth more than clarity, [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md) takes over: a precise name asks the next reader to cooperate, a type stops them. Prefer the type when the rule matters.

Paired with [Minimize Reader Load](../minimize-reader-load/SKILL.md), which measures what this principle asks for: naming and local clarity here, layers and hidden state there. A perfectly named one-caller wrapper is still a layer to step through.

[Foundational Thinking](../foundational-thinking/SKILL.md) supplies most of the clarity this principle asks for. Code over a sound data structure reads clearly without effort; no amount of naming rescues code built over a wrong one.
