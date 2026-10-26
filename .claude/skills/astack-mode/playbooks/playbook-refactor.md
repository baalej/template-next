---
name: refactor
description: Refactor code—understand, clean up, verify behavior unchanged, self-review.
type: playbook
---

# Playbook: Refactor Code

**Use it when:**
- "This code is hard to read; clean it up"
- "This module has too many responsibilities; split it"
- "I want to improve the structure without changing behavior"

**Principles:**
- Code is Documentation (make it obvious)
- Laziness Protocol (delete before adding)
- Foundational Thinking (get structure right)
- Sequence Verifiable Units (small, independent changes)

---

## Step 1: Understand Current Behavior

**What to do:**
- What does this code do? Document it
- What are the current tests? Do they pass?
- What's hard to understand? Name it specifically
- Principle: Code is Documentation

**How to verify:**
- Behavior doc created
- All tests pass; baseline established

---

## Step 2: Identify Cleanup Target

**What to do:**
- What's the minimal change that improves readability?
- Apply Laziness Protocol: delete dead code first before restructuring
- Don't redesign everything; fix the specific problem
- Principle: Laziness Protocol, Code is Documentation

**How to verify:**
- List of what will be deleted, what will be renamed, what will be restructured
- Scope is focused on one improvement

---

## Step 3: Refactor in Small Units

**What to do:**
- Make one kind of change at a time (rename, then extract, then delete)
- Each commit should be a single improvement
- Keep behavior identical; don't sneak in fixes
- Principle: Sequence Verifiable Units

**How to verify:**
- Each commit has a clear purpose
- Tests still pass after each commit
- Behavior remains identical

---

## Step 4: Verify Behavior Unchanged

**What to do:**
- All tests pass
- Manual behavior check: code does the same thing as before
- If behavior changed, that's a bug fix, not a refactor; commit separately
- Principle: Quality Over Speed, Prove It Works

**How to verify:**
- Tests pass
- Behavior verified identical to baseline
- No new functionality added

---

## Step 5: Code Review Yourself

**What to do:**
- Is the refactored code clearer?
- Would a reader understand it in 5 minutes?
- Did you improve clarity or just rearrange?
- Principle: Code is Documentation

**How to verify:**
- Self-review: clarity improved
- Names are precise; structure is obvious

---

## Step 6: Handoff

**What to do:**
- Commit message explains what was refactored and why (clarity, readability)
- Before/after summary for reviewer
- Link to any related cleanup that could follow
- Principle: Sequence Verifiable Units

**How to verify:**
- PR showing the improvement in structure/readability
- Each commit is clear and reviewable

**Then run Handoff** (`playbooks/playbook-handoff.md`) for the decision log,
evidence labels, and the reply. Unique to this playbook: the handoff carries the
proof that behavior did not change.

If the refactor touches code with callers you didn't read, run `/blast-radius`
before claiming behavior is preserved. "Nothing else is affected" is the claim
most likely to read as convincing while being untested.

**Reply:** what changed shape and why it reads better now, the proof behavior is
unchanged (the same tests passing before and after, output compared, or the
observation you made). A refactor with no before-and-after proof is a rewrite.
