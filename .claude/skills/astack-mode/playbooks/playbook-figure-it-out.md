---
name: figure-it-out
description: The fallback. When no other playbook fits, design one—frame the problem, build the sequence, run it as experiments, and leave a trail someone can audit.
type: playbook
---

# Playbook: Figure It Out

**Use it when:**
- No other playbook fits the task
- The work is large or cross-cutting enough that a narrower playbook would
  cover only part of it — a migration across many call sites, an ambitious
  multi-part change
- You're stepping away and will review the result later, so the run has to
  justify itself without you in the room

**Prefer a narrower playbook when one actually fits.** This one costs more: you
design the workflow before doing the work. That price is worth paying when
nothing else matches, and wasted when something does.

**Principles:**
- Quality Over Speed (the predicate is fixed before the run starts)
- Sequence Verifiable Units (the designed sequence is the deliverable)
- Exhaust the Design Space (for any decision the run can't reverse)
- Laziness Protocol (scale the rigor to the task; don't ceremonially over-build)
- Build the Lever (the harness comes before the work it checks)

---

## Step 1: Frame It

**What to do:**
- Write the definition of done as a **falsifiable predicate** — a statement that
  could come out false. "Auth works" is not one. "Every existing session
  survives the migration, verified by replaying the 200 sessions in the fixture"
  is one
- Quantify the scope: rough units, rough effort, and whatever blockers grounding
  turned up
- Set the rigor level, and bias it high. One-way doors and wide blast radius
  earn more. Reversible, low-stakes steps earn less. **Rigor means gates and
  artifacts, not trying harder**
- Present the framing before committing to a long run. Reversible work proceeds
  without asking (see Autonomy in `astack-mode`), but a multi-hour run earns one
  checkpoint

**How to verify:**
- The predicate can be read as true or false by someone who wasn't here
- You can say what the run will produce, and roughly how much of it there is
- The rigor level is stated, with the reason

---

## Step 2: Design the Sequence

**What to do:**
- Decompose into units that each land independently
- Sequence **riskiest unknown first**. Scaffolding and verification come before
  features
- **Build the verification harness before the work**, and capture the baseline
  from the pre-change state, so every later check reads as "old value vs new
  value" rather than "looks right to me"
- For a design decision the run can't reverse, settle it first — competing
  sketches via `/exhaust-the-design-space`, or an observation if the question is
  empirical. Skip this for mechanical work whose shape is already concrete;
  exploring a settled design is the Laziness Protocol's cue to stop
- **Write the phase list down.** That list is the thing to review, and it is the
  deliverable of this step

**How to verify:**
- Each unit ends in a check that can fail
- The harness runs and reports the baseline before any change is made
- Someone could read the phase list and tell you it's wrong

---

## Step 3: Run the Loop

**What to do:**
- Treat each unit as an experiment: state the hypothesis, make the smallest
  change, measure against the predicate **on the real artifact**, keep it if it
  advanced and revert it if it didn't
- Verify per unit, not in a batch at the end
- **When something passes too easily, suspect the observation before the
  system.** A gate that never fails is not a gate
- Three verdicts only: **verified**, **not verified**, **inconclusive**.
  Inconclusive is not a pass. Don't bury a negative
- If a check turns out to be wrong, fix the check in its own change rather than
  routing around it

**How to verify:**
- Every unit carries its verdict and the evidence behind it
- Reverted work is recorded as reverted, not quietly dropped
- No unit is marked verified on a self-report

---

## Step 4: Keep the Trail

**What to do:**
- Log each decision as it lands: what you did, why, the evidence, the result.
  One row per decision, written during the run rather than reconstructed after
- Keep it local for ordinary work. **Commit it when the stakes need an auditable
  record** — an unattended run, a migration, anything you'll be asked to justify
- Label every claim measured, inferred, or guess (see Evidence in `astack-mode`)

**How to verify:**
- The trail plus the diff is enough to reconstruct the run
- Someone reading it can find where a decision was made and what it rested on

---

## Step 5: Verify the Whole and Hand Back

**What to do:**
- Check the whole against the **step 1 predicate**, on the real product, not just
  against the harness. A green harness and a broken product is the failure this
  step exists to catch
- Encode any correction you had to make more than once as a gate, a lint rule, a
  type, or a script (`/encode-lessons-in-structure`)
- **Then run Handoff** (`playbooks/playbook-handoff.md`). Unique to this
  playbook: the designed phase list and the trail path are part of the handoff,
  not just the result

**How to verify:**
- The predicate is evaluated out loud, as true or false, against the real thing
- Anything that recurred during the run is now structurally prevented

**Reply:** the playbook you designed and why, the rigor level and what set it,
the predicate and whether it holds, the trail path, and what is still open.
State plainly which units are verified and which are inconclusive.
