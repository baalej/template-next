---
name: performance
description: Performance optimization—measure baseline, profile, fix root, verify improvement.
type: playbook
---

# Playbook: Performance Optimization

**Use it when:**
- "This is slow; help me optimize it"
- "Measure this code's performance and improve it"
- "What's the bottleneck?"

**Principles:**
- Quality Over Speed (performance is non-negotiable)
- Root Causes, Not Symptoms (optimize the real bottleneck, not guesses)
- Prove It Works (measure before/after, not assumptions)
- Laziness Protocol (don't optimize prematurely)

---

## Step 1: Measure Baseline

**What to do:**
- How slow is it? Get a number (latency, throughput, memory, CPU)
- Measure on the real artifact (production-like conditions)
- Local dev servers often differ from production in exactly what perf depends
  on: caching, compression, CDN, HTTP version. Check production read-only
  (`curl -I`, a page load) before trusting a local baseline
- Don't guess; measure. Before trusting the number, `/explain-the-number`
- What's the current performance vs. target?
- Principle: Prove It Works, Quality Over Speed

**How to verify:**
- Baseline measurement recorded
- Before/after target identified
- Measurement methodology documented

---

## Step 2: Profile to Find Bottleneck

**What to do:**
- Use profiling tools (CPU profile, memory trace, network waterfall)
- Where is the time being spent?
- Don't optimize based on intuition; follow the data
- Principle: Root Causes, Not Symptoms, Prove It Works

**How to verify:**
- Profile showing where time is spent
- Bottleneck identified with data, not assumptions

---

## Step 3: Identify Root Cause

**What to do:**
- Why is that function slow? Is it:
  - Unnecessary work (N+1 queries, redundant computations)?
  - Algorithm complexity (sorting when you could index)?
  - Resource contention (lock, I/O wait)?
  - External dependency (slow API call)?
  - Rendering: does the motion animate properties that trigger paint or layout, or share a thread with the work? (`web-motion` → `references/performance.md`)
- Principle: Root Causes, Not Symptoms

**How to verify:**
- Root cause analysis documented
- Clear explanation of why (with evidence)

---

## Step 4: Design Optimization

**What to do:**
- What's the fix?
- Will it measurably improve performance?
- What tradeoff are you making (complexity, memory, correctness)?
- Apply Laziness: is there a simpler optimization?
- Principle: Laziness Protocol, Root Causes, Not Symptoms

**How to verify:**
- Optimization plan with expected improvement
- Tradeoffs documented and justified

---

## Step 5: Implement and Measure

**What to do:**
- Apply the optimization
- Measure new performance
- Confirm it improved by the expected amount
- If improvement is less than expected, dig deeper (root might be wrong)
- Principle: Prove It Works, Quality Over Speed

**How to verify:**
- After measurement recorded
- Before/after comparison shows expected improvement
- If not, root cause reassessment is triggered

---

## Step 6: Handoff

**What to do:**
- Document the optimization: what was slow, why, what was changed, improvement achieved
- If this is a pattern (N+1 queries), encode it (query caching, index rule, test)
- Principle: Encode Lessons in Structure

**How to verify:**
- Commit explaining the optimization
- Measurement data attached
- Any preventive measures in place (lint rule, test, schema)

**Then run Handoff** (`playbooks/playbook-handoff.md`) for the decision log,
evidence labels, and the reply. Unique to this playbook: every number in the
handoff is measured, and the handoff says what limits the new number.

**Reply:** the baseline, the bottleneck and how you found it, the change, the
after-number. Both numbers measured on the same workload, and say which
workload. Name what limits it now — an optimization with no new limiting factor
identified was not understood. Rule out that you measured something other than
the work.
