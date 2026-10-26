---
name: learn-understand
description: Learn/understand code—identify confusion, trace data flow, find why, build model.
type: playbook
---

# Playbook: Learn/Understand Code

**Use it when:**
- "I don't understand how this works; explain it to me"
- "I'm new to this codebase; help me get oriented"
- "How does this feature work? Walk me through it"

**Principles:**
- Code is Documentation (if unclear, the code is the problem; explain in concepts, not syntax)
- Foundational Thinking (understand the structure first)

---

## Step 1: Identify What You Don't Understand

**What to do:**
- Be specific: is it the data flow? The algorithm? The architecture? The why?
- Name the confusion: "I don't understand why this query is slow" vs. "I don't understand this loop"
- Principle: Foundational Thinking

**How to verify:**
- Clear description of what's confusing
- Specific question formed (not just "this is confusing")

---

## Step 2: Trace the Data Flow

**What to do:**
- Follow the data from input to output
- What structures does it pass through?
- What transforms happen at each step?
- Principle: Foundational Thinking

**How to verify:**
- Annotated code or diagram showing data flow
- Clear sequence of transformations

---

## Step 3: Understand the Why

**What to do:**
- Why was this built this way?
- What problem does it solve?
- What constraints led to this design?
- Look at git history, tickets, or code comments for context
- Principle: Foundational Thinking

**How to verify:**
- Context doc explaining the reasoning
- Historical context (why decisions were made)

---

## Step 4: Find the Contradiction

**What to do:**
- If the code is unclear, ask: is it poorly named? Poorly structured? Or is the explanation missing?
- Good code should be self-explanatory (Principle: Code is Documentation)
- If you need a guide to understand it, the code might be the problem
- Principle: Code is Documentation

**How to verify:**
- Clarity assessment: is the code unclear, or is context missing?
- Specific improvement suggestions identified

---

## Step 5: Build Your Model

**What to do:**
- Explain it back in your own words
- Draw a diagram of the system
- Write a one-page summary of how it works
- Principle: Code is Documentation

**How to verify:**
- Summary/diagram that a new person could learn from
- Model is accurate and complete

---

## Step 6: Feedback

**What to do:**
- If the code was unclear, suggest how to improve clarity (naming, structure, comments)
- If the explanation was missing, suggest what context should be documented
- Don't assume; help fix the problem

**How to verify:**
- Clarity improvement suggestions for the codebase
- Feedback helps future readers

**Then run Handoff** (`playbooks/playbook-handoff.md`) for evidence labels and
the reply. This playbook is read-only and ships no diff, so the handoff reduces
to the answer, its citations, and what you could not confirm.

**Reply:** the answer, with every claim cited to a file and line you actually
read. Name what you did not confirm and what would settle it. An inference from
reading code is labeled inferred, not measured.
