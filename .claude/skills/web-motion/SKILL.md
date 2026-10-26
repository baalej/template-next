---
name: web-motion
description: "Apply when writing or reviewing motion on the web. The recipe layer under details-compound: tool ladder, compositor property tiers, exact curves and durations, gestures, interruption, reduced motion, the review bar. Web only, by design."
disable-model-invocation: true
---

# Web Motion

**Rule:** Use these recipes to guide motion decisions. Their values are starting points for implementation, not requirements for every interface.

Words like **never** and **always** below describe strong defaults for common UI patterns. They do not override an explicit product direction; reserve hard stops for concrete accessibility, interaction, correctness, or performance problems.

**When to apply:** Writing or reviewing motion on the web. This is the recipe layer—`details-compound` decides *whether and why* something moves; this decides *what it's made of*.

**Scope:** Web only. This is the stack layer under an agnostic principle: the decision transfers between platforms, these values do not.

## Posture

**Separate recommendation from implementation.** An audit, inspection, or review is advisory and read-only: do not add or change animation, transitions, tokens, or motion infrastructure. Give a short, organized list of promising candidates and how each could move. If there is no clear opportunity, say so. Do not inventory every element unless asked for a comprehensive audit.

Implement only when the user explicitly asks to add, change, or fix motion, or when a supplied design/spec requires it. A general request to build or improve an interface is not by itself a request to add animation. When implementation is requested, make a context-sensitive recommendation, state the reasoning briefly, and write the code; ask only when a material style choice cannot be inferred from the request or existing product.

The most valuable output may be a suggestion that the user can accept or ignore, or zero lines of code. Instant state changes and static affordances are valid alternatives.

## Hard rules

1. **The decision comes first.** Use `details-compound` to consider whether motion serves the interaction. High frequency and keyboard use are reasons to avoid motion by default, not automatic disqualifiers.
2. **Use values as starting points.** When implementing, choose values from the tables or the project's existing tokens, then adjust for the product and interaction.
3. **Extend the codebase's tokens; don't fork them.** If `--ease-out` or a duration scale already exists, use it. A parallel system is a defect.
4. **Honor reduced motion and pointer capabilities** when implementing motion; choose the appropriate behavior for the interaction and platform.
5. **Cheapest tool that works.** Don't install a motion library for a fade.

---

## 1. Pick the tool

Walk down; stop at the first that fits.

| Need | Tool |
|---|---|
| Hover, press, color, a state toggle you control with a class or attribute | **CSS transition** |
| Entry animation on mount, no JS state | **CSS `@starting-style`** |
| Predetermined motion that must stay smooth while the page is busy | **CSS animation** (runs off the main thread) |
| Programmatic control with CSS performance, no library | **WAAPI** — `element.animate()` |
| Springs, layout animations, exit animations, gesture-driven values | **Motion** (`motion.dev`) |

CSS animations beat JS under load. `requestAnimationFrame`-driven motion drops frames while the browser is loading, scripting, or painting; CSS animation on compositor properties does not. Use CSS for predetermined motion, JS for dynamic and interruptible motion.

`@starting-style` is the modern way to animate entry without JS state:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

It replaces the `useEffect(() => setMounted(true), [])` + `data-mounted` pattern. Keep that fallback only where your support floor requires it.

If the task actually needs a *component*—a toast, drawer, command menu, dropdown—build or adopt the component first. Hand-rolling those is how you end up with a `<div>` dropdown and no focus management.

### Adopting a library's motion

Adopting the component does not mean adopting its motion. Library defaults are tuned to be inoffensive across every consumer, which is not the same as right for yours. Check these before shipping, and override at your token layer rather than forking the component:

| Check | Common default that fails |
|---|---|
| Duration against the budget below | Often 300–500ms on menus and popovers, where 150–250ms belongs |
| Easing strength | Usually a built-in curve; replace with your named one |
| `transform-origin` | Frequently `center` on trigger-anchored surfaces, which should grow from the trigger. Headless libraries often expose `var(--transform-origin)`—use it |
| Entrance scale | Sometimes `scale(0)` or a bare opacity fade with no transform |
| Reduced motion | Varies widely. Verify it yourself; don't assume the library handles it |
| Enter vs. exit timing | Usually symmetric. The exit should be shorter |
| Keyframes vs. transitions | Keyframes on a rapidly-triggered component (toasts) restart from zero |

If overriding fights the library at every turn, that's a signal the component is wrong for you—not a signal to hand-roll one without focus management.

## 2. Pick the properties

**Animate compositor properties: `transform`, `opacity`, `filter`, `clip-path`.** These four can run entirely off the main thread. Everything else triggers paint or layout—see `references/performance.md` for the full tier list and the escape hatches when you genuinely need `height`.

- **Avoid `scale(0)` for ordinary UI entrances.** A subtle scale such as `0.9`–`0.97` plus opacity is a common alternative; use the product's intended visual language.
- **`transform-origin` at the trigger** for popovers, dropdowns, menus, tooltips. In Base UI, `var(--transform-origin)`. **Modals are exempt**—nothing anchors them, so they stay centered.
- **Percentages in `translate()`** are relative to the element's own size. `translateY(100%)` moves an element by its own height whatever the content. Prefer over hardcoded pixels.
- **`filter: blur()` is S-tier but expensive.** Keep animated blur low—under 10px is safe, and costs escalate sharply above that. Heaviest in Safari.
- **In Motion, use the full transform string.** The shorthands are not hardware-accelerated:

```jsx
<motion.div animate={{ x: 100 }} />                          // drops frames under load
<motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated
```

- **Never drive a child's transform from a CSS variable on the parent.** Changing a variable always triggers paint, and an inherited one invalidates the whole subtree. Set `transform` on the element directly.
- **`scale()` scales children too**—font, icons, content—unlike `width`/`height`. That's a feature for press feedback, not a bug.
- **3D is available without JS.** `rotateX()`/`rotateY()` with `transform-style: preserve-3d` gives real depth, flips, and orbits.

### Press feedback

Any pressable element should acknowledge the press. That feedback can be instant or animated; add motion only when requested or specified:

```css
.button {
  transition: transform 160ms ease-out;
}

.button:active {
  transform: scale(0.97);
}
```

Keep the scale subtle—0.95 to 0.98. Put it on the shared component so no caller can forget it.

### `clip-path` for reveals

`clip-path: inset(top right bottom left)` defines a rectangular clipping region; each value eats into the element from that side. It's S-tier and animatable, which makes it the right tool for reveals, wipes, and seamless color transitions that per-property timing can never achieve.

```css
.hidden  { clip-path: inset(0 100% 0 0); }  /* fully clipped from the right */
.visible { clip-path: inset(0 0 0 0); }     /* fully revealed */
```

Worked uses — scroll reveal, hold-to-confirm, seamless tab colors: `references/recipes.md`.

### Masking a crossfade that won't settle

When two states crossfade and you can see them as two overlapping objects despite tuning easing and duration, add a subtle `filter: blur(2px)` during the transition. Blur bridges the gap so the eye reads one transformation instead of two objects swapping. Reach for this only after easing and duration have failed.

### Stagger

When a group enters together, consider a 30–80ms stagger if it helps people follow the order. Stagger is decorative and should never block interaction. Implementation: `references/recipes.md` §1.

## 3. Curve and duration

| Situation | Easing |
|---|---|
| Entering or exiting | `ease-out` |
| Moving or morphing on screen | `ease-in-out` |
| Hover or color change | `ease` |
| Constant motion (marquee, progress) | `linear` |
| Default | `ease-out` |

**Usually avoid `ease-in` on UI responses.** It starts slowly and can delay feedback; choose easing to fit the intended motion and product character.

**The built-in CSS easings are too weak.** Use these:

```css
--ease-out:     cubic-bezier(0.23, 1, 0.32, 1);     /* strong ease-out for UI */
--ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve, from Ionic */
```

Need a curve that isn't here? Take it from [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/). Don't hand-roll one.

| Element | Duration |
|---|---|
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

**UI motion stays under 300ms.** A 180ms dropdown feels more responsive than a 400ms one.

**Reach for a spring instead** when the motion is a drag with momentum, an element that should feel alive, a gesture the user can interrupt or reverse, or decorative mouse-tracking:

```js
{ type: "spring", duration: 0.5, bounce: 0.2 }             // Apple-style, easier to reason about
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }   // traditional physics, more control
```

Keep bounce at 0.1–0.3. Avoid bounce in most UI—reserve it for drag-to-dismiss and playful interactions.

## 4. Interruption and exit

- **Transitions, not keyframes, for anything triggered rapidly**—toasts, toggles, anything a user can fire twice in a second. Transitions retarget from the current value; keyframes restart from zero.
- **Springs for gestures**, because they carry velocity through an interruption.
- **Exit the way it entered.** A toast that slides in from the bottom leaves through the bottom. Symmetric paths are what make swipe-to-dismiss feel obvious.
- **Asymmetric timing where the user is deciding.** Slow on the deliberate phase (hold-to-confirm: 2s linear), snappy on the system response (release: 200ms ease-out).

## 5. Gestures and drag

Drag interactions have their own failure modes, and all of them read as "this feels cheap" rather than as bugs.

- **Dismiss on momentum, not distance alone.** Requiring the user to drag past a threshold makes a confident flick fail. Compute velocity and accept either:

```js
const velocity = Math.abs(swipeAmount) / elapsedMs;
if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) dismiss();
```

- **Damp at the boundaries.** Dragging past a natural edge should move the element less the further it goes. Real things slow before they stop; an invisible wall reads as a bug.
- **Friction over hard stops.** Allow the over-drag with rising resistance rather than preventing it.
- **Capture the pointer once the drag starts**, so it continues when the pointer leaves the element's bounds.
- **Ignore extra touch points** after a drag begins. Without this, switching fingers mid-drag makes the element jump.

```js
function onPress() {
  if (isDragging) return;
  // start drag
}
```

- **Springs, not durations, for anything drag-driven**—they carry velocity through an interruption and reverse smoothly when the user changes their mind.

Full implementation: `references/recipes.md` §5.

## 6. Reduced motion and pointer gating

Ships with the animation, every time.

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; }  /* keep opacity/color, drop transform-based motion */
}

@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }  /* touch fires false hovers on tap */
}
```

```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```

Reduced-motion behavior depends on the preference and interaction. Reduce or remove motion as appropriate; preserve understandable state feedback, which can be immediate and non-animated.

---

## Implementation checks

Use these as implementation checks when motion is requested. They are defaults to guide decisions, not automatic audit findings. Flag a row when it causes a concrete usability, accessibility, correctness, or performance problem; explain context when a deliberate design choice differs.

| Default to avoiding | Consider instead |
|---|---|
| `transition: all` | Name the exact properties |
| `transform: scale(0)` entrance | `scale(0.95)` + `opacity: 0` |
| `ease-in` on a UI element | `ease-out` or a strong custom curve |
| Built-in `ease-out` on a deliberate animation | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Animation on a keyboard shortcut or 100+/day action | Instant feedback, unless the requested design has a reason to animate |
| UI duration over 300ms with no reason | 150–250ms |
| `transform-origin: center` on a trigger-anchored popover | `var(--transform-origin)` (modals exempt) |
| Keyframes on toasts, toggles, rapidly-triggered elements | CSS transitions |
| Animating `width`/`height`/`margin`/`padding`/`top`/`left` | `transform`/`opacity`, or FLIP — see `references/performance.md` |
| Motion `x`/`y`/`scale` props under load | Full `transform` string |
| Animating an inherited CSS variable | Set the property on the element, or `@property { inherits: false }` |
| Reading and writing layout in the same loop | Batch reads, then writes |
| Ungated `:hover` motion | `@media (hover: hover) and (pointer: fine)` |
| Missing `prefers-reduced-motion` | Gentler variant, not zero |
| Everything entering at once | Consider a 30–80ms stagger if it improves comprehension |

## Reviewing motion

Review is advisory unless the user asks you to implement a fix. The implementation checks above are prompts, not a rule that every row must become a finding. Separate concrete problems from style preferences, preserve intentional product choices, and offer a suggested correction without applying it.

**Posture: describe what you observe and why it may matter.** Motion that delays an action, obscures state, ignores reduced-motion preferences, or drops frames is a concrete concern. Timing, easing, origin, and amount of movement can be taste or product choices; recommend changes without presenting them as defects unless the context supports that judgment.

### Prefer the earlier fix

When suggesting a remedy, use this order as a guide. Deleting is often the smallest fix, but preserve motion the user or product intentionally asked for unless there is a concrete problem.

1. **Delete it** — high-frequency, keyboard-triggered, or no nameable purpose
2. **Reduce it** — shorter duration, smaller transform, fewer animated properties
3. **Fix the easing** — `ease-in` → `ease-out` or a strong custom curve
4. **Fix the origin and physicality** — correct `transform-origin`; `scale(0)` → `scale(0.95)` + opacity
5. **Make it interruptible** — keyframes → transitions, or a spring for gesture-driven motion
6. **Move it off the main thread** — layout properties → `transform`/`opacity`; shorthands → full transform string
7. **Fix the timing asymmetry** — slow the deliberate phase, snap the response
8. **Polish** — blur to mask a crossfade, stagger a group, `@starting-style` for entry
9. **Accessibility and cohesion** — reduced motion, hover gating, match the component's personality

### Review output

For an audit or inspection, keep the output short and structured. Include only plausible opportunities, with the element/state, suggested motion, and purpose. For a code review, cite concrete findings with `file:line`; separate them from optional polish suggestions. Do not include code changes in either output unless implementation was requested.

| Before | After | Why |
|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms ease-out` | `all` animates unintended properties, off the compositor |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nothing |
| `ease-in` on dropdown | `ease-out` + `var(--ease-out)` | Delays the moment the user watches most |

Keep "Why" to one line. It exists so the fix survives the next contributor's judgment.

When useful, group review comments by impact: concrete usability/accessibility/performance concerns first, optional craft suggestions after.

If the user asks for a review verdict, make the call from concrete issues, not taste alone:

- **Block** — a concrete interaction, accessibility, correctness, or material performance issue
- **Approve** — no blocking issues; mention optional motion refinements separately

When you can't settle feel from code alone, say so and recommend a `verify-by-eye` check rather than guessing.

## References

- `references/performance.md` — the performance tier list: what runs on the compositor, what triggers paint or layout, layer promotion, the CSS-variable inheritance bomb, layout thrashing, and the escape hatches.
- `references/recipes.md` — worked implementations for the techniques you hand-roll: stagger, hold-to-confirm, tab indicator, scroll reveal, drag-to-dismiss, crossfade masking, WAAPI. Start from these rather than a blank file.

## Build output

Write the code. Then, in a few lines at most:

- **Gate result** — frequency tier and the named purpose. If something was rejected, say which and why.
- **Ingredients** — tool, properties, curve, duration or spring config. One line each.
- **What to feel-check** — if the result depends on feel you can't judge from code (a crossfade, a spring's bounce, the opacity/height balance in an entering list), say so and hand off to `verify-by-eye`.

The code is the deliverable. Don't pad this into a report.

---

## Related

The recipe layer under [Details Compound](../details-compound/SKILL.md), which owns the decision of whether anything should move at all. Run its product gate before reaching for anything here.

Findings come from [Verify By Eye](../verify-by-eye/SKILL.md) — that skill establishes what you observed, this one says whether it is within budget.

Web only, by design. This is the stack layer: the principle above it transfers between platforms, these values do not. Add a sibling depth skill for another platform rather than generalizing them.
