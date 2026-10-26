---
name: animation-vocabulary
description: "Apply when someone describes a motion effect without knowing its name and wants the right word — \"what's it called when a popover grows out of the button\", \"the iOS scroll that resists and snaps back\". A reverse lookup from described sensation to precise term, for naming an effect rather than designing or building one."
disable-model-invocation: true
---

# Animation Vocabulary

**Rule:** Turn a loose description of a motion effect into its precise term, so the thing can be specified instead of guessed at. This skill **names** effects. It does not decide whether to use them.

**When to apply:** Someone describes what they see or feel and wants the word for it. Also useful in reverse — reading a term here and recognising the effect you've been trying to describe.

**Scope:** Naming only, any stack. For whether something should move at all, `details-compound`. For how to build it on the web, `web-motion`. For whether an existing animation is any good, the Craft playbook.

## How to answer

People describe what they **see** or **feel** — "springy", "slides off", "draws itself in" — not the technical name. Map the sensation, not the keywords.

Lead with the term and a one-line definition:

> **Stagger** — several items animate one after another with a small delay between each, so the group arrives as a cascade rather than all at once.

When two terms genuinely compete, give the best match first, then the alternates with the distinction that separates them. The distinction is the useful part, not the list.

A naming question wants a name. Don't expand into an essay unless asked.

If nothing fits, say so and describe the effect using the terms that do — "that's a *stagger* of *scale-in* entrances" is a better answer than inventing a word. These definitions are descriptive, not authoritative; the industry uses several of them loosely.

---

## Entrances and exits

- **Fade in / out** — opacity change; the element is in place the whole time.
- **Slide in** — enters by translating from off-screen on one edge.
- **Scale in** — grows from smaller to full size, usually paired with a fade.
- **Pop in** — scales in past its final size and settles back. The overshoot is the whole character.
- **Reveal** — content uncovered progressively, usually by animating a clip-path or mask rather than the content itself.
- **Enter / exit** — the animations an element plays on being added to or removed from the page. Exit is the one frameworks make hard, because the element is already gone.

## Sequencing and timing

- **Keyframes** — named points in an animation; the browser interpolates between them.
- **Interpolation / tween** — generating the in-between frames so motion is continuous rather than stepped.
- **Stagger** — several items animating in sequence with a small offset each.
- **Orchestration** — timing several separate animations so they read as one coordinated motion.
- **Delay** — time before an animation begins. **Duration** — how long it runs.
- **Fill mode** — whether an element holds its first or last frame's styles outside the animation's run.
- **Stepped animation** — advances in discrete jumps instead of continuously, like a seconds hand.

## Movement and transforms

- **Translate / scale / rotate** — move, resize, spin.
- **Skew** — slant along an axis, shearing the element out of its rectangle.
- **3D tilt / flip** — rotation in 3D (`rotateX`/`rotateY`) to suggest depth.
- **Perspective** — how strong that 3D effect reads; a lower value exaggerates it, as though the viewer were closer.
- **Transform origin** — the anchor a scale or rotation happens around. Defaults to the centre, which is usually wrong.
- **Origin-aware animation** — the element animates out of whatever triggered it: a popover growing from its button rather than from its own middle.

## Transitions between states

- **Crossfade** — one element fades out while another fades in, in the same place.
- **Continuity transition** — a change that keeps the user oriented by visually connecting before and after, rather than cutting.
- **Morph** — one shape becoming another shape.
- **Shared element transition** — an element travels and transforms from one position to another, like a thumbnail expanding into a full card.
- **Layout animation** — when position or size changes, the element animates to the new value instead of snapping.
- **Accordion / collapse** — a section animating its height to show or hide content.
- **Direction-aware transition** — content moves one way going forward and the opposite way going back, so navigation has a direction.

## Scroll

- **Scroll reveal** — elements animate in as they enter the viewport. Fires once per element.
- **Scroll-driven animation** — progress tied directly to scroll position, so scrolling back rewinds it.
- **Parallax** — layers moving at different speeds to imply depth.
- **Page transition** — animation between routes or pages.
- **View transition** — the browser itself morphing between two states, connecting shared elements across them.

## Feedback and interaction

- **Hover effect** — change on cursor-over. Has no touch equivalent, which is its own problem (`mobile-web`).
- **Press / tap feedback** — a small scale-down on press so the control feels physical. Belongs on press, not release.
- **Hold to confirm** — progress that fills while a button is held, usually to gate something destructive.
- **Drag** — moving an element directly, often carrying momentum on release.
- **Drag to reorder** — dragging within a list while the other items shift aside.
- **Swipe to dismiss** — dragging an element off-screen to close it.
- **Rubber-banding** — resistance then snap-back when dragging past a boundary. The iOS overscroll feel.
- **Shake / wiggle** — a fast side-to-side jitter signalling rejection or error.
- **Ripple** — a circle expanding from the point of contact to confirm a press.

## Easing

- **Easing** — how speed changes across the animation.
- **Ease-out** — fast then slow. The default for UI and for anything responding to a user action.
- **Ease-in** — slow then fast. Usually wrong on UI, because it delays the moment the user is watching.
- **Ease-in-out** — slow, fast, slow. Suited to something already on screen moving from A to B.
- **Linear** — constant speed. For spinners and marquees, not for UI.
- **Cubic-bezier** — a custom curve defined by two control points.
- **Asymmetric easing** — accelerates and decelerates at different rates. Reads as more alive than a symmetric curve.

## Springs

- **Spring** — motion driven by physics (tension, mass, damping) rather than a fixed duration. It has no duration you set.
- **Stiffness / tension** — how hard it pulls toward the target. Higher is snappier.
- **Damping** — how fast it settles. Lower means more oscillation.
- **Mass** — how heavy it feels. More mass is slower and more sluggish.
- **Bounce** — overshoot and settle; the playful end of spring behavior.
- **Perceptual duration** — when a spring *appears* finished, which is earlier than when it mathematically stops.
- **Momentum** — motion carrying velocity onward, especially after a drag.
- **Velocity** — current speed and direction. A spring carries it into the next animation when interrupted, so a flicked element keeps moving.
- **Interruptible animation** — can be redirected mid-flight from wherever it currently is, rather than finishing or restarting. The thing keyframes can't do.

## Looping and ambient motion

- **Marquee** — content scrolling continuously in a loop.
- **Loop** — repeats a set number of times or forever.
- **Alternate (yoyo)** — a loop that reverses each pass instead of jumping back to the start.
- **Orbit** — one element circling another.
- **Pulse** — a gentle repeating scale or opacity change to draw the eye.
- **Float** — a slow continuous drift that keeps a static element from feeling dead.
- **Idle animation** — subtle motion while an element waits to be used.

## Polish and effects

- **Blur** — a filter to soften an element or hide a transition's seams. Expensive at large radii.
- **Clip-path** — clipping to a shape; used for reveals and wipes. Hard edges.
- **Mask** — same idea with soft, fadeable edges, using a gradient or image.
- **Before / after slider** — a draggable divider wiping between two overlaid images.
- **Line drawing** — an SVG path drawing itself in, as though traced.
- **Text morph** — text animating character by character as it changes.
- **Skeleton / shimmer** — a placeholder with a travelling sheen shown while content loads.
- **Number ticker** — digits rolling or counting toward a value.
- **Tabular numbers** — fixed-width digits so numbers don't shift sideways as they change. Required for any ticker, timer or counter.
- **Typewriter** — text appearing one character at a time.

## Performance

- **Frame rate (FPS)** — frames drawn per second. 60 is the baseline, 120 on current displays.
- **Jank** — visible stutter from the browser missing frame deadlines.
- **Dropped frame** — one frame the browser failed to draw in time.
- **Compositing** — the GPU moving or fading an existing layer without redoing layout or paint.
- **`will-change`** — a hint to promote an element to its own layer before it animates.
- **Layout thrashing** — animating properties that force layout recalculation every frame.

See `web-motion/references/performance.md` for what these cost and how to confirm them.

## Concepts worth having words for

- **Purposeful animation** — motion that orients, gives feedback, or shows a relationship, as against motion that decorates.
- **Anticipation** — a small wind-up opposite to the coming movement.
- **Follow-through** — parts continuing briefly after the main motion stops, which reads as weight.
- **Squash and stretch** — deforming along the direction of travel to convey weight and speed.
- **Perceived performance** — the right motion makes an interface feel faster without being faster.
- **Frequency of use** — the more often an animation is seen, the shorter and subtler it should be. The strongest single predictor of whether motion will annoy.
- **Spatial consistency** — animating so an element keeps its identity and location across states, so nobody loses track of where it went.
- **Hardware acceleration** — animating transform and opacity so the GPU can carry the motion.
- **Reduced motion** — honoring `prefers-reduced-motion` by toning motion down rather than removing feedback.

---

## Related

Naming sits upstream of the other motion skills. Decide **whether** something should move with [Details Compound](../details-compound/SKILL.md), build it on the web with [Web Motion](../web-motion/SKILL.md), check the result with [Verify By Eye](../verify-by-eye/SKILL.md).

The terms here carry no recommendation. Several name effects you should usually avoid — `ease-in` on UI, parallax on a dense tool, an idle animation on something seen hundreds of times a day. Knowing the word is not an argument for using the thing.

Useful in the [Prototype](../astack-mode/playbooks/playbook-prototype.md) playbook when naming each variant's axis: "pop in versus scale in" is a sharper brief than "bouncier versus calmer".
