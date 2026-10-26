# Web Animation Performance

The browser renders in three steps: **layout** (geometry), **paint** (pixels), **composite** (assembling layers). What you animate decides how many of those run per frame, and on which thread.

The tiers below are the useful mental model — better than a flat "`transform` and `opacity` only" allowlist, because it tells you what to do when you genuinely need something else.

Source: [Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list), Motion.

---

## The frame budget

60fps gives the browser **16.7ms** per frame. On a 120Hz screen — most current
phones and many laptops — it's **8ms**. Design against the smaller number.

For scale: a layout recalculation on a complex page can exceed 100ms. That is
not one missed frame, it is a dozen in a row, which reads as a freeze rather
than as jank.

Two independent things decide whether you stay inside the budget, and the tiers
below are organized around them:

1. **What you animate** — how much work each frame costs.
2. **Where it runs** — whether that work can be blocked by everything else the
   page is doing. An A-tier animation is indistinguishable from S-tier until the
   main thread is busy, which is exactly when the user is watching.

---

## S-tier — compositor thread only

**`transform`, `opacity`, `filter`, `clip-path`**, driven by CSS, WAAPI, or a library that compiles to them.

These run entirely on the compositor. Heavy main-thread work does not affect them — they hold 60 or 120fps while the page is loading, scripting, or painting. This is why a CSS animation stays smooth during a route change and a `requestAnimationFrame` one does not.

Scroll-driven animation on these properties is also hardware-accelerated, because scrolling itself runs on the compositor.

**Caveats:**
- Requires layer creation. Large layers can exhaust GPU memory, especially on mobile.
- `filter: blur()` costs escalate sharply with radius. Keep animated blur under ~10px; heaviest in Safari.
- To animate a shadow, animate `filter: drop-shadow()` rather than `box-shadow`. `box-shadow` repaints the element every frame; `drop-shadow` composites.
- **Safari:** an animation with a `playbackRate` other than `1.0` loses hardware acceleration.
- Chrome only recently supported `%`-based `translate` values — check your support floor if you rely on it.

## A-tier — compositor properties, driven from the main thread

The same four properties, animated via JavaScript per frame. Only the composite step runs, so this is still excellent — but it is interruptible by main-thread work, so it janks exactly when the browser is busy.

- The element must already be promoted to a layer, or `transform`/`opacity` will trigger paint.
- `will-change: transform, opacity` promotes it. **Use sparingly** — every promoted layer consumes GPU memory. Add it when you have observed the problem, not preemptively.
- Classic main-thread libraries (GSAP and similar) live here. Fine most of the time; vulnerable under load.
- Animating thousands of small elements can beat hardware acceleration. Past that, use shaders.

## B-tier — A or S-tier, plus an upfront DOM measurement

One measurement cost at the start buys an otherwise expensive animation.

**FLIP** is the canonical case, and the escape hatch when you need `width`/`height`: measure first and last geometry, then animate `scale` instead of the dimension, correcting the distortion on children with per-frame inverse transforms. Motion's layout animations do this for you.

Use this when the design genuinely requires a size change. Don't reach for it first.

## C-tier — triggers paint

**`background-color`, `color`, `border-radius`, `mask-image`, gradient `background-image`, SVG attributes (`d`, `cx`, `cy`, `r`)**

Forces style recalculation and pixel redraw. Cost scales with layer size. Usually acceptable for small elements and short transitions — a button's hover color is fine. A full-bleed gradient is not.

**SVG:** move and resize with `transform`, not attributes. Animate native attributes only when there is no transform equivalent, such as a line-drawing animation on `d`.

### The CSS-variable inheritance bomb

Changing a CSS variable **always triggers paint** on affected elements — even when the variable only feeds a compositor property.

Worse, an inherited variable invalidates the whole subtree. A global `html { --progress: 0 }` updated per frame forces style recalculation across the entire document, including elements that never read it. Measured: **~8ms per frame** across 1300+ elements, versus nanoseconds for a targeted write.

Fixes, in order of preference:
1. Write the property directly on the element that needs it — `el.style.transform = ...`
2. Scope the variable to the smallest subtree that uses it
3. Register it with `@property` and `inherits: false` so it cannot cascade

```css
@property --progress {
  syntax: '<number>';
  initial-value: 0;
  inherits: false;
}
```

## D-tier — triggers layout

**`width`, `height`, `margin`, `border`, `top`/`left`, `display`, `justify-content`, `grid-template-columns`** — anything that changes geometry.

Recalculates layout through the whole pipeline. Cost scales dramatically with tree size and complexity. This is the tier that turns a smooth interface into a slideshow.

**Mitigations when you can't avoid it:**
- `position: absolute` or `fixed` isolates the element's layout from its siblings
- `contain` stops layout changes from escaping the element

**View Transitions** technically land here — the API animates `width`/`height` — but it isolates with `position: absolute`, making it about as good as a D-tier animation can be.

**Accordions** are the common honest exception: `height` has no transform equivalent when content size is unknown. Keep the animated subtree small, or use FLIP.

## F-tier — layout thrashing

Not a property. A pattern: **reading a layout value after writing one, in a loop.** Each read forces the browser to flush pending layout synchronously.

```js
element.style.width = "100px";
const width = element.offsetWidth;   // forces synchronous layout
element.style.width = width * 2 + "px";
```

In React this hides inside `useLayoutEffect` — several component instances each reading `scrollWidth`/`clientWidth` and then writing a `dataset` attribute produces cascading thrashing that profiles as mysterious main-thread time.

**Fix:** batch all reads, then all writes. Motion's `frame` API does this; so does any read/write scheduler.

---

## Animating through React state

An animation library animates outside React's render cycle, so libraries are
fine. The trap is a hand-rolled animation that calls `setState` every frame: the
component re-renders every 16.7ms and the render alone spends the budget.

```jsx
setY(nextY);                                      // re-renders every frame
ref.current.style.transform = `translateY(${nextY}px)`;  // touches one element
```

Where to look: a state update inside `requestAnimationFrame`, `pointermove`,
`scroll`, or a drag handler. The signature is motion that is smooth on an empty
page and degrades as the component tree grows — the same signature as the
CSS-variable bomb above, and worth checking for both.

---

## Quick reference

| Problem | Fix |
|---|---|
| Animation stutters | Animate `transform`/`opacity`, not `width`/`top` |
| Long list scrolls slowly | Virtualize — render only what's visible |
| Blur is expensive | Keep animated `blur()` low; under ~10px |
| Motion's `x`/`y` drops frames | Animate the full `transform` string |
| Random properties animate | Never `transition: all`; list exact properties |
| React re-renders every frame | Write to `ref.current.style`, not state |
| Element shifts 1px as motion starts | `will-change: transform` — only once you've seen it |
| Whole page recalcs on a variable change | Scope it, or `@property { inherits: false }` |
| Mysterious main-thread time | Look for read-after-write layout thrashing |

## How to confirm, not assume

Tier membership is a prediction. Verify it:

- **Performance panel** — record while the motion runs and look for purple (layout) and green (paint) bars during frames that should only composite.
- **Layers panel** — confirm the element was actually promoted, and check how much GPU memory the layers cost.
- **CPU throttling at 4–6×** — reproduces the mid-range device where the difference between S and A tier becomes visible.
- **Run it while the app is doing real work**, not on an idle page. A-tier looks identical to S-tier until the main thread is busy, which is exactly when users are watching.
