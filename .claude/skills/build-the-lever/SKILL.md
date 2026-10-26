---
name: build-the-lever
description: "Apply to any non-trivial work: the same change across several files, a migration, a repeated task, or a change whose consistency you need to prove. Build the tool that does it or proves it (codemod, script, generator) instead of working by hand. The tool is the artifact a reviewer reruns."
disable-model-invocation: true
---

# Build the Lever

**Rule:** For any non-trivial work, build the tool that does it instead of working by hand. The tool is the artifact a reviewer can rerun. Automation, codemods, generators, and scripts are not luxuries—they're part of the work.

**When to apply:** When you're about to apply the same change across multiple files, when migrating code, when repeating a task, when you need to prove a change was applied consistently.

## Core requirements

### 1. Automate before you apply.

- If you're about to edit five files the same way, write a codemod first.
- If you're about to generate boilerplate, write a generator.
- If you're about to run a series of checks, write a script.
- Doing it once by hand is waste; doing it five times by hand is negligence.

### 2. The tool is the proof.

- A reviewer can rerun the tool and verify the output.
- A tool is reproducible; manual edits are not.
- If you can't give a tool to future maintainers, you can't prove the work was done correctly.

### 3. Build the tool for small work too.

- Don't wait for "big projects" to justify a tool. A five-line script that validates ten files is worth writing.
- The cost of writing the tool is small; the cost of manual work is repeated, forever.
- Small tools compound into a workflow that's fast and trustworthy.

### 4. The tool documents intent.

- A well-named script or codemod shows *what* you were trying to do.
- A comment can rot; a tool can be run.
- If someone wonders "why did this change happen," the tool's behavior answers it.

## Signals to watch for

- About to make the same change in three places. (Write a tool instead.)
- Manually editing files when a pattern exists. (Build a generator.)
- A complex process with manual steps that could be scripted. (Automate it.)
- The same task repeated across projects. (Build a reusable tool.)
- A reviewer asking "how do I verify this was done right?" (The tool should answer it.)

## Anti-patterns to avoid

- **Copy-paste edits**: Manually applying the same change in multiple places.
- **One-off scripts**: Building a tool, using it once, then throwing it away. (Keep it; reuse it.)
- **Manual verification**: Checking the work by hand instead of running a script that proves it.
- **Undocumented migrations**: Large changes with no tool that shows what changed and why.
- **"I'll remember"**: Assuming you'll do it right next time without a tool to guide you.

---

## Related

Distinct from [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md), which turns a recurring instruction into a durable guardrail. This is throughput and reviewability on the work in front of you: the lever can be thrown away once the work lands, the guardrail cannot.

Bounded by [Laziness Protocol](../laziness-protocol/SKILL.md): build the smallest script that does or proves the job, never a framework. The bar for building one is triviality, not repetition — a one-off still earns a lever when the lever is what makes the work checkable.

For scripting the verification rather than the work, see [Quality Over Speed](../quality-over-speed/SKILL.md).
