---
name: details-compound
description: "Apply to anything a person looks at or touches, during design and build rather than at the end: interfaces above all, but also CLI output, error messages, docs. How it feels is the fifth quality gate. Feel means responsive, not animated."
disable-model-invocation: true
---

# Details Compound

**Rule:** Work that is correct, fast, secure, and maintainable can still be wrong. If it feels cheap, jarring, or unresponsive, it is not done. Feel is the fifth quality gate, held to the same standard as the other four.

**Feel means responsive, not animated.** A button that changes state instantly with no transition passes this gate. A button with a beautiful 200ms curve that doesn't acknowledge the press fails it. Motion is one way to satisfy the gate, and often not the right one.

**When to apply:** Anything a person looks at or touches—interfaces above all, but also CLI output, error messages, docs. During design and build, not only at the end.

**Advice is not authorization.** An audit, inspection, or review may identify places where motion could help and describe how. It does not authorize adding or changing animation. Implement motion only when the user explicitly asks for it or a supplied design/spec calls for it. During other interface work, preserve the existing motion character and use immediate, non-animated feedback when that is enough.

## Why this is a principle and not a preference

Most craft details are never consciously noticed. That is the point: a user who notices nothing proceeds without hesitating. The value is in the aggregate, so no single detail can justify itself under interrogation—"does anyone really care about the transform origin?" is unanswerable one detail at a time, and irrelevant. Craft is justified as a standard you hold, the way you hold correctness. You do not defend individual assertions in a test suite either.

## Core requirements

### 0. Some products want almost no motion.

Before asking whether this element should move, ask whether this product should. Motion is a house style, not a universal good.

- **Dense, high-frequency tools**—admin panels, data grids, trading and monitoring surfaces, internal dashboards—are used by people repeating the same action hundreds of times a day. Near-zero motion is the correct answer there, not an unfinished one.
- **Content and documentation sites** earn motion only at the rare tier: a first-scroll reveal, never a transition on every navigation.
- **Consumer surfaces, onboarding, and first-run flows** are where a motion budget actually pays.

A product with no animation and instant, correct feedback satisfies this principle completely. **"It doesn't animate" is never itself a finding.**

This gate runs once per product, not once per element, and its answer constrains every decision below it.

### 1. Every moving thing answers "why does this move?"

Motion costs the user attention and delays their next action. Spend it only when it buys something: **feedback** (the interface confirms it heard them), **spatial consistency** (a thing leaves the way it arrived, so their model of where it went stays true), **state indication**, **continuity** (preventing a jarring appearance), or **explanation**.

"It looks cool" can be valid for things seen rarely. Repetition can convert motion into latency—the first time a thing animates it informs, the hundredth time it may be a toll. Avoid motion on keyboard-triggered or frequent actions by default; treat that as guidance to discuss, not permission to override an explicit user or product decision.

### 2. Responsive feedback is required; motion is optional.

Anything pressable should acknowledge the press immediately. That is closer to correctness than to polish—an element that does not react reads as broken. The acknowledgement can be instant, visual, or animated; animation is optional.

### 3. Decide agnostically, bind to the stack last.

Whether it moves, what it buys, how long it takes, where it originates, how it interrupts and exits—these are facts about human perception and transfer between platforms. The syntax does not. Do not copy values from another stack without re-deriving whether the decision behind them applies to yours.

### 4. Taste that lives only in your head will regress.

If the project has an established motion character, encode the decisions the team wants to preserve: named tokens, a lint rule for a recurring failure, or a component that owns shared feedback. Do not add motion tokens or shared animations just because an audit suggested them. Principle: Encode Lessons in Structure.

### 5. Respect reduced-motion preferences.

Honor the platform's reduced-motion setting. Reduce or remove animation as appropriate, while keeping state changes understandable through immediate feedback or other non-motion cues.

## Signals to watch for

- Declaring interface work done without having used it yourself, on real hardware.
- Motion added because the component "felt empty" rather than to buy something.
- The same duration on enter and exit. (The system should leave faster than it arrives.)
- A value copied from a blog post without re-deriving it.
- "We'll polish it later." Polish deferred is polish deleted.
- Craft decisions that exist only in a reviewer's memory, with nothing enforcing them.

## Anti-patterns to avoid

- **Polish as a phase**: Treating feel as a pass at the end rather than a gate at each step. By then the structure fights you.
- **Decoration over communication**: Motion that draws attention without informing. If removing it loses nothing, remove it.
- **Defaults as decisions**: Shipping whatever the framework does because nobody chose otherwise. A default is a decision you did not make.
- **Craft without a budget**: Polishing the rare path while the hot path still jars. Spend attention where frequency is highest, then where stakes are.
- **Taste by assertion**: "This feels off" with no follow-up. Name the property and the moment, or keep observing.

---

## Related

The proof method for this gate is [Verify By Eye](../verify-by-eye/SKILL.md) — this principle decides *whether and why* something should feel a certain way, that skill establishes whether it does.

To put a name to an effect before deciding on it, [Animation Vocabulary](../animation-vocabulary/SKILL.md) is the reverse lookup. Naming it is not an argument for using it.

On the web, [Web Motion](../web-motion/SKILL.md) is the recipe layer underneath: this principle ships the decision and the budget, that skill ships the exact curves. It is web-only by design; add a sibling for another platform rather than forking this principle.

Held in tension with [Laziness Protocol](../laziness-protocol/SKILL.md), which usually wins. The best motion decision is most often "none"; this gate asks for responsiveness, not animation.
