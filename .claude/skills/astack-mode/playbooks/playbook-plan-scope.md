---
name: plan-scope
description: Plan a project in detail—outcome, constraints, quality gates, phases, risks.
type: playbook
---

# Playbook: Plan/Scope a Project

**Use it when:**
- "Plan this feature end-to-end"
- "Scope out this project; detail the phases"
- "I want to plan before building"

**Principles:**
- Foundational Thinking (get data structures right)
- Exhaust the Design Space (explore 2-3 approaches)
- Plans Evolve; Principles Don't (make the plan flexible)
- Laziness Protocol (cut nice-to-haves; focus on core)

---

## Step 1: Ground the Problem

**What to do:**
- Define the user outcome (what problem are we solving?)
- Define constraints (performance, security, scale, timeline)
- Define the four non-negotiable quality standards:
  - Performance: What's acceptable?
  - Security: What threats matter?
  - Correctness: What must be true?
  - Maintainability: What's the code quality bar?

**How to verify:**
- Create a one-page brief with outcome + constraints + quality gates
- Someone unfamiliar with the project can read it and understand what you're building

---

## Step 2: Explore the Design Space

**What to do:**
- Sketch 2-3 different architectures (data flow, boundaries, key components)
- Evaluate each on: simplicity, flexibility, performance, maintainability
- Choose the best; document the tradeoffs
- Principle: Exhaust the Design Space

**How to verify:**
- Design doc with 2-3 options compared
- Clear reasoning for which design was chosen and why

---

## Step 3: Break Into Phases

**What to do:**
- Sequence the work (foundational → features → verification)
- Each phase should be independently verifiable (Sequence Verifiable Units)
- Identify high-risk pieces; plan how to de-risk them early
- Principle: Foundational Thinking, Sequence Verifiable Units

**How to verify:**
- Phase breakdown with verification gates at each step
- Early risk-reduction plan is clear

---

## Step 4: Anticipate Change

**What to do:**
- What assumptions might be wrong? List them.
- How will you know if an assumption breaks? Plan for early signals.
- What parts of the plan are rigid (quality gates) vs. flexible (features)?
- Principle: Plans Evolve; Principles Don't

**How to verify:**
- Risk doc with assumptions and early signals
- Clear distinction between "this cannot change" and "this might evolve"

---

## Step 5: Cut Scope

**What to do:**
- Apply Laziness Protocol: what's core? What's nice-to-have?
- Cut everything that isn't solving the immediate problem
- Plan to add features later if they're still needed
- Principle: Laziness Protocol

**How to verify:**
- Final scope doc with justification for what was cut
- Roadmap showing what's future/optional

---

## Step 6: Handoff

**What to do:**
- Document the plan as a decision log or architecture doc
- Make it so a new person can pick it up and build without questions
- Include: outcome, constraints, quality gates, phases, risks, assumptions

**How to verify:**
- A doc that someone else can use to start building
- All decisions are traceable and justified

**Then run Handoff** (`playbooks/playbook-handoff.md`) for the decision log,
evidence labels, and the reply. Unique to this playbook: the plan is the
deliverable, so someone else could start phase 1 tomorrow without asking a
question.

**Reply:** the outcome, the phases and what each one proves, the risks and how
you de-risked them early, what you cut and why. Every estimate is labeled a
guess unless you measured something comparable.
