---
name: verify-by-eye
description: "Apply before declaring any interface work done, when reviewing a diff that changes what a user sees, and whenever someone says it feels off and cannot say why. The proof method for interfaces: observation performed systematically, from using it as a user through the fresh-eyes pass."
disable-model-invocation: true
---

# Verify By Eye

**Rule:** For work a person looks at or touches, the proof is observation—but observation performed systematically, not glanced at. "It renders" is the interface equivalent of "it compiles," and Quality Over Speed rejects both.

**When to apply:** Before declaring any interface work done. During review of a diff that changes what the user sees. Whenever someone says "it feels off" and can't say why.

**Scope:** Not only motion. Empty states, focus order, long content, error states and loading all fail here, and none of them are animation problems.

Supports: Quality Over Speed, Details Compound.

---

## The passes

Run them in order. Each finds a class of defect the previous one structurally cannot.

### 1. Use it, don't inspect it

Perform the user's real task, at the user's real speed, including what happens before and after the thing you changed. Not "open the component and look at it."

Isolation hides the transitions between states, and that is where most defects live. A component that is perfect in a storybook can be wrong in the flow.

Then do it wrong on purpose:

- Retrigger it fast, twice in a second
- Interrupt it halfway; reverse mid-gesture
- Navigate away while it runs
- Submit twice
- Arrive at the state from a different direction than you built it for

### 2. Slow it down

Play it at a fraction of speed—through the platform's animation inspector (on web: DevTools → Animations, which has a playback-rate control), or by temporarily multiplying durations 2–5×.

Most timing defects are invisible at full speed and obvious at quarter speed. Look for:

- **Two objects where there should be one.** In a crossfade, do you see the old and new states overlapping as distinct things?
- **Properties out of sync.** Do position, size, and opacity land together, or does one lag and pull the eye?
- **The wrong origin.** Does it grow from the thing that caused it, or from somewhere arbitrary?
- **A curve fighting itself.** Does it start abruptly, stall mid-way, or arrive and then keep creeping?
- **Unintended overshoot** past the destination.

### 3. Step the frames

For coordinated motion, step frame by frame in the platform's inspector. This is the only way to see ordering problems between properties that are each individually correct.

### 4. Real hardware, real conditions

A simulator is not a phone and your machine is not the median machine.

- **Touch and gesture work must be tested on physical hardware.** Latency, momentum, and the width of a thumb do not simulate well. On web: serve to your phone over the local network and attach remote devtools.
- **Run it while the app is busy**—loading, fetching, navigating. Motion that shares a thread with the work stutters exactly when the user is watching. See `web-motion` → `references/performance.md` for confirming which thread it's actually on.
- **Throttle the CPU 4–6×** to reproduce the mid-range device.
- **Use the real content**: the longest string, the empty state, the error state, the slowest response. Not lorem ipsum at a comfortable length.

### 5. The degradation passes

Each is a separate run-through, and each catches what the others miss:

- **Reduced motion** on — does it still communicate, and has spatial movement actually stopped?
- **Touch vs. pointer** — do hover behaviors misfire on tap?
- **Keyboard only** — is focus visible, ordered, and never trapped?
- **Interrupted** — kill the network, background the app, rotate the device.

### 6. Fresh eyes

Look again the next day, or after a break long enough to lose the context.

This is not superstition. You have been watching the same interaction for an hour and have adapted to it; you can no longer see it the way a first-time user does. Defects invisible at the end of a session are plainly visible the next morning. Build the delay into the schedule rather than treating it as a luxury.

---

## What counts as evidence

A claim about feel is actionable only if it names three things: **the property, the moment, and the change.**

- Not evidence: *"the dropdown feels weird."*
- Evidence: *"the dropdown uses `ease-in`, so the first 80ms show no movement—it reads as lag on the frame the user is watching most."*

If you can't name the property and the moment, you haven't finished observing. Go back to pass 2 and slow it down further.

Attach the artifact where the platform allows: a screen recording, a frame from the inspector, a trace showing dropped frames.

## Reporting

Report findings as a table—one row per issue, citing `file:line`. For motion specifically, use the format and the remedial ordering in `web-motion` → Reviewing motion, so that a fix proposal always considers deleting before fixing.

## Anti-patterns

- **Screenshot as proof.** A still frame cannot show timing, easing, interruption, or stutter—the things most likely to be wrong.
- **"It renders."** Rendering is not behaving. This is exactly the move Quality Over Speed forbids, wearing a different hat.
- **Happy path, full speed, fast machine, short content.** Everything looks fine under those four conditions simultaneously. That is why they're the default.
- **Inspecting the component instead of the flow.** See pass 1.
- **Deferring the fresh-eyes pass** because the work "feels done." It feels done because you adapted to it—which is the condition the pass exists to correct.
- **Trusting a report you didn't observe.** If an agent or a teammate says the motion is fine, that's a hypothesis, not a result. Run the passes.

---

## Related

The proof method for [Details Compound](../details-compound/SKILL.md) and the interface branch of [Quality Over Speed](../quality-over-speed/SKILL.md).

For motion specifically, [Web Motion](../web-motion/SKILL.md) supplies the values to check findings against: this skill establishes *what you observed*, that one says whether it is within budget.

Scope is wider than motion. Empty states, focus order, long content, error and loading states all fail here, and none of them are animation problems.
