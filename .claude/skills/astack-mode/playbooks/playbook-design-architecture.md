---
name: design-architecture
description: Design feature architecture—data structures, types, API surface, flow.
type: playbook
---

# Playbook: Design/Architecture

**Use it when:**
- "Design this feature; I want the architecture solid before I code"
- "I'm about to write code that crosses boundaries; help me get the shape right"
- "What should the data model look like?"

**Principles:**
- Foundational Thinking (data structures first)
- Exhaust the Design Space (2-3 competing designs)
- Code is Documentation (interfaces should be self-explanatory)
- Plans Evolve; Principles Don't (be willing to redesign if wrong)

---

## Step 1: Ground in Reality

**What to do:**
- Understand the existing systems this touches
- Document what currently exists, what constraints exist
- Trace how data flows through related systems
- Principle: understand before designing

**How to verify:**
- Trace showing how data flows through related systems
- Clear list of constraints and existing patterns

---

## Step 2: Sketch the Candidate Designs

**What to do:**
- Design A: One approach
- Design B: A structurally different approach
- Design C (optional): A third alternative
- Each design should include: data structures, types/schemas, API surface, flow
- Principle: Exhaust the Design Space

**How to verify:**
- 2-3 design sketches with pseudocode or types
- Each design is genuinely different, not minor variations

---

## Step 3: Evaluate Against Red Flags

**What to do:**
- Does any design have shallow pass-through methods?
- Does any design leak internal details to callers?
- Are types weak (any, Object) instead of precise?
- Does the design match the problem, or force the problem into a shape?
- Principle: Foundational Thinking, Code is Documentation

**How to verify:**
- Red flag analysis for each design
- Designs ranked by quality against red flags

---

## Step 4: Choose and Document

**What to do:**
- Pick the best design based on interface simplicity, flexibility, correctness
- Document why you chose it: what tradeoffs are you making?
- What does it do well? What's the weakness?
- Principle: Plans Evolve; Principles Don't (acknowledge tradeoffs)

**How to verify:**
- Design decision doc with reasoning
- Trade-offs are explicit and justified

---

## Step 5: Validate the Interface

**What to do:**
- Write code that *uses* the interface (caller-first, Principle: Foundational Thinking)
- Does the interface feel natural to use?
- Can a caller use it correctly without knowing internals?
- If it feels awkward, redesign

**How to verify:**
- Example code showing how a caller will use this
- Interface feels natural and intuitive to use

---

## Step 6: Handoff

**What to do:**
- Document the chosen design with types/pseudocode
- Explain the tradeoffs (why this design, why not the others)
- List the assumptions (what might need to change?)
- Make it clear for implementation

**How to verify:**
- Design doc that implementation can follow exactly
- All assumptions and tradeoffs are documented

**Then run Handoff** (`playbooks/playbook-handoff.md`) for the decision log,
evidence labels, and the reply. Unique to this playbook: the design is the
deliverable, so the handoff carries types or pseudocode precise enough to build
from without asking a question.

**Reply:** the chosen design, the alternatives you rejected and what would have
to change for one of them to win, the assumptions and their early signals, the
interface surface. Tables for the comparison.
