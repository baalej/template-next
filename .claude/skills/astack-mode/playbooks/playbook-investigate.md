---
name: investigate
description: Read-only investigation—answer "can this be better?", "are we sure?", or "X or Y?" with ranked, labeled findings or a recommendation. No code change.
type: playbook
---

# Playbook: Investigate

**Use it when:**
- "Do you see any option to improve the loading speed?"
- "Analyze the codebase and tell me what could be better"
- "Are we sure this is safe?" / "Should we do X or Y?"

**Not for:** understanding how something works (use Learn), or making the
change (use Fix, Build, Perf or Refactor). Investigation requests are
read-only. They produce findings or a recommendation, not a code change.

**Principles:**
- Explain the Number (a finding about speed or size is a measurement, with its limits named)
- Root Causes, Not Symptoms (a finding names the cause, not just the symptom)
- Laziness Protocol (rank by what the change buys, not by how interesting it is)

---

## Step 1: Name the Question and the Scope

**What to do:**
- Restate the question in one sentence, and the scope: one page, one feature,
  the whole codebase
- Name what kind of answer it wants: ranked findings, a yes/no with reasons, or
  a choice between alternatives

**How to verify:**
- One sentence the user would recognize as their question

---

## Step 2: Borrow the Diagnosis Steps

**What to do:**
- Pick the playbook whose diagnosis fits the question, and run only its
  read-only steps:
  - Speed or size → Perf steps 1–3 (baseline, profile, root cause)
  - Code quality → Review steps 2, 4 and 5
  - "Is this broken?" → Fix steps 1–2 (reproduce, trace)
  - Motion or feel → Craft in Audit mode
- Skip the rest of that playbook, and say so in one line
- Anything those steps would build or change becomes a finding instead

**How to verify:**
- The borrowed steps are named, and nothing outside scratch space changed

---

## Step 3: Check the Environment That Matters

**What to do:**
- Any finding about caching, headers, compression, redirects, CDN, server
  config or speed depends on where you measured it. A local dev server (ddev,
  Docker, `npm run dev`) is often configured differently from production
- Confirm those findings against production with a read-only check (`curl -I`,
  a page load in the browser). Never change production to check something
- Where production can't be reached, label the finding with where it was
  measured (`/explain-the-number`)

**How to verify:**
- Every environment-dependent finding says where it was measured

---

## Step 4: Rank the Findings

**What to do:**
- For each finding: what it is, where (file and line, or the measurement),
  what fixing it would buy, roughly what it would cost, and its evidence label
- Rank by what it buys for its cost. Say what you checked and found fine
- For an "X or Y?" question, a tradeoffs table and a recommendation instead

**How to verify:**
- Every finding carries a location and a label
- The ranking can be explained in one sentence

---

## Step 5: Stop

**What to do:**
- Hand back the findings. Don't start fixing
- If the user asks for a fix, re-match: Fix, Build, Perf or Refactor, and
  announce it

**How to verify:**
- No production code changed

**Then run Handoff** (`playbooks/playbook-handoff.md`) for evidence labels and
the reply. This playbook ships no diff, so the decision log reduces to the
recommendation and what you deliberately did not look at.

**Reply:** findings ranked, each with its location, what fixing it buys, rough
cost, and its label. What you checked and found fine. Where each
environment-dependent finding was measured. What would confirm the inferred
ones.
