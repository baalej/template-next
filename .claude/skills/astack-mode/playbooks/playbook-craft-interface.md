---
name: craft-interface
description: Make an interface feel right—inventory what should and shouldn't move, decide, build against tokens, verify by eye, encode the taste. Build, debug, or audit.
type: playbook
---

# Playbook: Craft the Interface

**Use it when:**
- "Animate this" / "Add a transition here" / "Implement these motion suggestions"
- "This works but it feels cheap"
- "Should anything here animate?"
- "Audit/inspect the motion in this app, page, component, or button"
- "Polish this before we ship"

**Not for:** building the feature itself (use Build), choosing the architecture
behind it (use Design), or reviewing a diff before you ship (use Review — its
step 4 routes into `web-motion`).

**Principles:**
- Details Compound (feel is a quality gate; the product gate runs before the element gate; decide in words first and bind to the stack last)
- Laziness Protocol (the best motion decision is usually "none")
- Encode Lessons in Structure (taste that isn't encoded regresses)
- Quality Over Speed (observation is the proof, and it isn't optional)

---

## Modes

Three entry points, one playbook. An audit or inspection is read-only and never
authorizes animation changes. Implement motion only when the user explicitly
asks for implementation or a supplied design/spec calls for it. **Announce
which mode you read the request as before running step 1** — one line, so a
wrong read costs a word to correct instead of three steps to discover.

| Mode | You said | Steps | Ends with |
|---|---|---|---|
| **Build** | Explicitly asks to animate, add/change a transition, or implement motion | 1 → 2 → 3 → 4 → 5 → 6 | Requested implementation |
| **Debug** | "This feels off", "why does this look wrong", "inspect this button" | 1 → 5 → 3, stop | Short diagnosis and suggested correction. No code |
| **Audit** | "Audit the motion", "what could animate here" | 1 → 2 → 3, stop | Concise list of potential animations and how they could work. No code |

Audit and Debug are read-only. If the request is ambiguous, recommend without
changing motion; the user can ask to implement a suggestion.

---

## Step 1: Ground in the Artifact

**What to do:**
- Use the relevant page or component as a user. Keep inspection scoped to what
  the user asked about; do not expand a button check into a whole-app audit
- Write down what felt wrong before analyzing why — first impressions are
  perishable and you get one
- **Run the product gate** (`/details-compound`, requirement 0): does this
  product want motion at all? A dense internal tool, a data grid, a docs site
  may correctly have almost none. If the answer is "near-zero," say so now and
  scope the rest of the playbook to responsiveness rather than motion
- For Build mode, bind to the stack: what primitives does the platform offer,
  what does this project already use, what tokens exist, what is the cheap path?
  (`/web-motion`)

**How to verify:**
- A list of specific moments that felt wrong, in the order you hit them
- The product gate answered explicitly, not assumed
- You have used it, not just read it

---

## Step 2: Inventory the Interactions

**What to do:**
- In Audit mode, inspect only the requested scope and note a few promising
  candidates. Do not inventory every transition unless asked for a comprehensive
  audit
- In Build mode, list the relevant states and transitions before implementing
- Tag each with **how often one user sees it**: many times an hour, many times
  a day, occasionally, rarely
- Consider whether motion would help, especially for frequent or keyboard-driven
  actions. Treat this as a recommendation, not a ban
- Press feedback may be instant; do not add animation solely to make a control
  acknowledge a press
- Principle: Laziness Protocol — this step should shorten the list, not grow it

**How to verify:**
- For a focused audit, a concise table: element/state, potential motion, and
  purpose. Include only useful candidates; say when none stand out
- For a comprehensive audit, a table of transitions with frequency and any
  deliberate do-not-animate decisions
- **Valid outcome: nothing here should animate.** Say it and stop; that is a
  result, not a failure

---

## Step 3: Decide Before You Build

**What to do:**
- For Build mode, walk requested candidates through the decisions: what does it buy, which curve
  character, what duration budget, where does it originate, how does it
  interrupt, how does it exit, how does it degrade (`/web-motion`, §1–6)
- Record each decision in words before any syntax — "decelerate, ~180ms, grows
  from the trigger, interruptible, exits downward"
- If you can't name what a motion buys, cut it here
- **Audit and Debug end at this step.** Offer concise recommendations, ordered
  by usefulness. Describe the motion and its purpose in plain language; exact
  code and values are unnecessary unless requested

**How to verify:**
- Every candidate has a written decision or an explicit cut
- Do not invent a cut just to fill a list; some scopes have no useful motion candidates
- Audit: a concise, prioritized set of optional suggestions; no implementation
- Debug: a diagnosis and suggested correction; no implementation unless asked

---

## Step 4: Build Against Tokens

**What to do:**
- If the requested implementation needs motion tokens, extend existing project
  tokens or add only the small set the work needs
- When implementing, prefer existing token names and project conventions
  (`/web-motion`, §3); introduce tokens only when the project needs them
- If the requested motion is shared behavior, put it where it belongs (for
  example, in a shared button component)
- Stay on the cheap path — compositor properties, not layout
  (`web-motion` → `references/performance.md`)
- Principle: Code is Documentation. A named curve says what it's for; a raw
  `cubic-bezier` says nothing

**How to verify:**
- No raw curve or duration literals at call sites
- The token set is small enough to hold in your head
- Shared behavior owned by one place
- Confirmed on the cheap path in the profiler — not assumed from the property name

---

## Step 5: Verify By Eye

**What to do:**
- For Build mode, verify the implementation: use it as a user, inspect timing
  and interruptions as relevant, and run the applicable degradation passes
  (`/verify-by-eye`)
- Check reduced motion, touch vs. pointer, keyboard-only, and relevant content
  states for the implemented interaction
- On a touch target, check the platform behaviors too — feedback on press
  rather than release, sticky hover, tap highlight, gesture axes
  (`/mobile-web`). These read as "cheap" and are not motion problems, so
  `web-motion` will not catch them
- Use deeper passes (slow playback, real hardware, fresh-eyes review) when the
  implementation's complexity or impact warrants them

**How to verify:**
- Findings identify the observed behavior and the relevant interaction
- Audit and Debug stop with recommendations; no implementation is assumed

---

## Step 6: Encode and Handoff

**What to do:**
- When implementation reveals a recurring failure, encode it in an appropriate
  place, such as a lint rule or shared component
- Document motion tokens or conventions when the implementation adds or changes
  them
- Decision log: what moves, what deliberately does not, and why. **The
  "does not" half is the more valuable one** — it's what stops the next
  contributor, or the next agent, from adding motion you deliberately refused
- Principle: Encode Lessons in Structure

**How to verify:**
- Any new motion convention is documented where someone will find it
- Someone else could extend this interface, stay in character, and know what not
  to touch — without asking

**Then run Handoff** (`playbooks/playbook-handoff.md`) for the decision log,
evidence labels, and the reply. Unique to this playbook: the decision log's
more valuable half is what deliberately does not move.

**Reply:** Build mode — what moves, what deliberately does not and why, the
tokens touched, what you observed when you used it. Audit and Debug modes stop
at step 3: a prioritized list of candidates or a diagnosis, in plain language,
with no implementation and no code.
