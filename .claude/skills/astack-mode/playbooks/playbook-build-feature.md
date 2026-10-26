---
name: build-feature
description: Build a feature—scaffold, implement, verify, self-review, integrate.
type: playbook
---

# Playbook: Build a Feature

**Use it when:**
- "Build this feature"
- "I have a design; now I need to implement it"
- "Take the architecture and make it work"

**Principles:**
- Quality Over Speed (prove it works before declaring done)
- Code is Documentation (clear names, obvious structure)
- Sequence Verifiable Units (small, independent commits)
- Foundational Thinking (architecture before logic)
- Build the Lever (automate if repeatable)

---

## Step 1: Scaffold First

**Applies when** the feature introduces new data: a model, a content type, a
shape that crosses files. A change to existing templates, styles or scripts has
no shape to scaffold; mark it `skip: no new data shape`.

**What to do:**
- Implement the data structures and type definitions from the design
- Build empty shells for functions (signatures, pseudocode bodies)
- Don't implement business logic yet; just the shape
- Principle: Foundational Thinking

**How to verify:**
- Code compiles (or lints passes); types are defined; no logic yet
- Structure matches the design exactly

---

## Step 2: Implement in Small Units

**What to do:**
- Break the feature into independently testable pieces
- Each piece should be small enough to review in 10-30 min
- Implement one piece, verify it works, commit
- A piece is the smallest thing that works on its own. When the parts only work
  together (a template and the script that reads it), that is one piece and one
  commit. Say so rather than splitting it into commits that each break
- Principle: Sequence Verifiable Units

**How to verify:**
- Each commit has passing tests/verification
- Each commit makes sense in isolation

---

## Step 3: Verify Each Unit

**What to do:**
- After each piece: does it work on the real artifact?
- Run the code, observe the output, inspect the diff
- If a piece breaks, fix it before moving to the next
- Principle: Quality Over Speed, Prove It Works

**How to verify:**
- Tests pass, behavior verified, performance measured
- No regressions in existing functionality

---

## Step 4: Code Review Yourself

**What to do:**
- Before declaring done, review your own code
- Are names clear? Is structure obvious?
- Would a reader unfamiliar with this code understand it in 5 min?
- Are there comments that could be replaced by better naming/structure?
- Principle: Code is Documentation

**How to verify:**
- Self-review checklist passed
- No comments explaining WHAT; only WHY when necessary

---

## Step 5: Integration Test

**What to do:**
- Test the feature end-to-end on the real artifact
- Test the happy path, edge cases, error cases
- Measure performance; confirm it meets the bar
- If a person touches it: real hardware, real content, reduced motion, keyboard-only — then `verify-by-eye` for the full passes
- Principle: Quality Over Speed, Prove It Works

**How to verify:**
- Feature works as specified
- Performance log shows acceptable numbers
- No known bugs remain

---

## Step 6: Handoff

**What to do:**
- Commit messages explain each change and why
- The feature, tradeoffs and verification go where the project's workflow keeps
  them: a PR description, or the commit message and the reply (Handoff §3)
- Link to the design doc for context, if there is one
- Make it clear for code review and future maintenance

**How to verify:**
- A reviewer can understand and verify the change from the commits or the PR
- All decisions are documented and traceable

If the feature renders data you don't control, run `/break-the-ui` before
calling it done. A component verified only against fixtures is verified against
data somebody chose to make it look good.

**Then run Handoff** (`playbooks/playbook-handoff.md`) for the decision log,
evidence labels, and the reply. Unique to this playbook: link the design the
build came from, if one exists, and name any place the build diverged from it
and why.

**Reply:** what you built, what you chose and why, how you verified it, open
decisions. Tables for design alternatives.
