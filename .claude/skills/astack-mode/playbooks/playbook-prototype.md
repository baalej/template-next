---
name: prototype
description: Settle a design or behavioral decision by building throwaway variants and observing them, instead of arguing about it or asking. The output is the decision, not shippable code.
type: playbook
---

# Playbook: Prototype

**Use it when:**
- A design question has no obvious answer: which layout, which density, which
  interaction model
- An **empirical fork** — the answer is a fact you could observe by running
  something (behavior, timing, layout, output, a measurement). See Autonomy in
  `astack-mode`: that class of question is not the human's to answer
- "Mock it up", "try this layout", "sketch it so we can decide"

**Not for:** building the real thing (use Build), or choosing the architecture
behind it (use Design). The chosen direction goes to one of those afterwards.

**This is the one playbook where the usual bars invert.** Speed beats polish.
Code quality does not matter. There is no test, no abstraction, no error
handling, and no plan. The rigor lives entirely in **picking the right decision
cheaply** — not in the artifact, which you throw away. Do not let
`quality-over-speed` or `code-is-documentation` slow a sketch down; they govern
the real build that follows.

**Principles:**
- Exhaust the Design Space (this is how that principle actually gets discharged)
- Laziness Protocol (the variants are probes; delete all of them, then build one)
- Quality Over Speed (suspended for the sketch, in force for the build after)
- Details Compound (observation is how a feel question gets answered)

---

## Step 1: Name the Decision

**What to do:**
- State the decision this prototype exists to make, in one sentence. "Which of
  these three list densities reads fastest when scanning" is a decision.
  "Explore some options" is not
- **No decision means no prototype.** If you can't name what the result will
  settle, you want Build or Design instead — say so and switch
- If the question is empirical, name the observation that will answer it: the
  timing you'll measure, the output you'll read, the thing you'll watch

**How to verify:**
- One sentence naming what the result decides
- You can say what observation ends the exercise

---

## Step 2: Name an Axis Per Variant

**What to do:**
- Two or three variants, each exploring a **genuinely different answer** to the
  same brief. Before building, state each variant's axis in a phrase — layout,
  density, personality, motion, interaction model
- **Three tints of the same idea waste the exercise.** If you can't name how
  variant B differs in kind from variant A, it isn't a variant
- Gather references first when the design space is wide open; skip it when the
  direction is already set
- Propose a variation nobody asked for. That is the point of the step, and it is
  cheap here in a way it never is later

**How to verify:**
- Each variant's axis is written down before any code
- Flipping between two of them would teach you something

---

## Step 3: Build Throwaway

**What to do:**
- Work in an isolated scratch directory, **never in production source**. For
  a visual decision, the lightest thing that renders the idea — plain
  HTML/CSS/JS, CDN dependencies, a dev server with reload. For a behavioral or
  timing decision, the smallest script that exercises the question
- No production framework unless the question is *about* the framework. No
  tests, no abstractions, no cleanup
- Realistic content, though: product-shaped copy, plausible names and numbers.
  Lorem ipsum and dead buttons teach you nothing about how a direction reads.
  (`/break-the-ui` has worst-case values if the decision turns on data)
- Variants may share the project's tokens — looking native to the product is
  not convergence

**How to verify:**
- Nothing outside the scratch directory changed
- Every variant actually works: real interactions, real motion, real content

---

## Step 4: Put Them Behind One Switcher

**Applies when comparing alternatives you look at or touch.** For a timing or
behavioral fork, where the answer is a number or a log, a switcher shows
nothing: mark it `skip: behavioral fork` and compare the measurements instead.

**What to do:**
- All variants live behind a single switcher so they're compared **live and in
  the same place**. Side-by-side screenshots lose exactly what you're deciding
- Behavior contract: number keys and arrows switch, one variant active at a
  time, selection survives a reload, switching re-mounts so entrance
  animations re-run, and a replay control when there's motion worth
  re-triggering. Ignore key presses while focus is in a field
- **The switcher is harness chrome, not a contestant.** Keep it visually plain
  and outside the project's design language, so it never gets judged as part of
  what you're deciding. Move it out of the way if a variant occupies the same
  corner
- Label each variant with its axis name, not "Option 1"

**How to verify:**
- One switcher, every variant reachable, labels say what distinguishes them
- The switcher is obviously not part of the design under test

---

## Step 5: Observe

**What to do:**
- Use each variant as a user, on the matching surface (`/verify-by-eye`; on a
  phone, `/mobile-web` — a density decision made in a desktop pane is not made)
- For a behavioral or timing question, observe the thing you're deciding: log
  the timing, print the output, watch the render. **The observation is the test
  here** — there is no assertion to write
- Any number you take from a sketch is still a number: name what limits it
  before you trust it (`/explain-the-number`). Sketches measure sketches, and a
  CDN build is not production performance
- Throw a variant away and try another if the first round settles nothing. That
  is a successful round, not a failed one

**How to verify:**
- You used them, not just read them
- The observation the decision needed actually happened, on the right surface

---

## Step 6: Decide and Hand Off

**What to do:**
- State the recommendation and the tradeoffs. **The output is the decision**,
  plus the throwaway artifact as evidence — not shippable code
- Say plainly that the prototype is throwaway, and give its path
- Hand the chosen direction to **Build** (or **Design** if it needs an
  architecture first). The real implementation starts clean and gets the full
  quality bar back
- Delete the scratch surface once the decision is recorded, unless asked to keep
  it, or the next playbook will reuse a variant as its baseline. Then say so,
  and delete it when that playbook ends
- **Then run Handoff** (`playbooks/playbook-handoff.md`). Unique to this
  playbook: the rejected variants are the valuable half of the decision log —
  they are what stops this question being reopened in a month

**How to verify:**
- The decision is recorded with its reasoning, not just the winner's code
- Nobody could mistake the prototype for an implementation

**Reply:** the variants and their axes, the evidence (what you observed, the
timing or output for a behavioral fork), the tradeoffs, your recommendation,
and the scratch path. State plainly that the prototype is throwaway and what
happens next.
