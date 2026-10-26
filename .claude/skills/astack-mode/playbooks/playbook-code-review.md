---
name: code-review
description: Code review—automated checks, clarity, end-to-end test, principle checks, patterns.
type: playbook
---

# Playbook: Code Review (Your Own)

**Use it when:**
- "Review my code before I commit/PR"
- "Is this code quality up to standard?"
- "Help me find issues I missed"

**Not for:** "analyze the codebase and tell me what could be better", with no
change under review. That is Investigate.

**Principles:**
- Quality Over Speed (catch issues before shipping)
- Code is Documentation (clarity, naming, comments)
- Root Causes, Not Symptoms (don't accept surface-level fixes)
- All 16 principles (this is your quality gate)

---

## Step 1: Run Automated Checks

**What to do:**
- Run whatever checks the project has: linting, type checking, tests. A project
  with none (by design, or not yet) gets `skip: no automated checks` for those,
  not invented tooling
- Performance: measure against baseline; confirm it meets requirements
- Security: no obvious vulnerabilities (logging secrets, SQL injection, etc.)

**How to verify:**
- Every check the project has passes
- Baseline comparison recorded
- No security red flags

---

## Step 2: Read Your Code Like a Stranger

**What to do:**
- Open the PR, the diff, or the files in scope as if you've never seen this code
- Can you understand it in 5 minutes?
- Are names clear? Is structure obvious?
- Do you need comments to understand what it does?
- Principle: Code is Documentation

**How to verify:**
- Clarity checklist passed
- Comments only explain WHY, not WHAT
- No confusing variable names or unclear structures

---

## Step 3: Test End-to-End

**What to do:**
- Run the feature on the real artifact
- Test happy path, edge cases, error cases
- Measure performance; confirm it meets spec
- Observe real behavior; don't just trust tests
- For interface changes, observation is the proof and it has a method: `verify-by-eye`
- Principle: Quality Over Speed, Prove It Works

**How to verify:**
- End-to-end test log
- Performance data matches spec
- No crashes or unexpected behavior

---

## Step 4: Check Against Principles

**What to do:**
- Does the code follow your 16 principles?
- If the diff renders data you don't control, has it been seen with realistic
  worst-case data and not just fixtures? (`/break-the-ui`)
- If its effects reach past the diff — shared code, a data shape, a wire format,
  callers you didn't read — what breaks elsewhere, and is the one fact it's safe
  because of actually proven? (`/blast-radius`)
- If it will be used on a phone, has it been opened on a real device?
  (`/mobile-web`)
- Does any claim rest on a measurement (speed, size, cache headers, server
  behavior)? Was it measured on the environment that matters, or on a local
  server configured differently from production? (`/explain-the-number`)
- Is this the root fix or a symptom patch? (Root Causes)
- Could this be smaller? (Laziness)
- Are data structures sound? (Foundational Thinking)
- Is the implementation verifiable? (Sequence Verifiable Units)
- If the diff touches motion, review for concrete usability, accessibility, correctness, or performance issues. You may suggest motion refinements, but don't treat style preferences as defects or change motion unless asked (`web-motion` → Reviewing motion)
- Principle: All 16 principles are your quality gate

**How to verify:**
- Principle checklist passed
- Each principle is satisfied

---

## Step 5: Look for Patterns

**What to do:**
- Is this code duplicating logic elsewhere?
- Could this lesson be encoded? (lint rule, type, test)
- Are there similar patterns that should be unified?
- Principle: Encode Lessons in Structure

**How to verify:**
- Any duplication identified
- Similar patterns noted for future consolidation

---

## Step 6: Decision: Ship or Fix

**What to do:**
- If all checks pass: ship it
- If checks fail: fix it before shipping
- Don't accept "we'll fix this in a follow-up PR" for quality issues
- Quality is non-negotiable

**How to verify:**
- Checklist signed off
- Code ships only if passing all quality gates

**Then run Handoff** (`playbooks/playbook-handoff.md`) for evidence labels and
the reply. This playbook produces findings, not a commit, so the decision log
reduces to the verdict and what you deliberately let pass.

**Reply:** findings ordered by severity, each with the file and line and the
gate it fails. What passes, stated explicitly. The ship-or-fix verdict. Say
which findings you confirmed by running something and which are inferred from
reading.
