# Motion Recipes

Worked implementations for the techniques you genuinely hand-roll. Each encodes decisions already made in `SKILL.md` — start from the recipe rather than a blank file, and change values only with a reason.

**Not here on purpose:** dropdowns, tooltips, modals, drawers, toasts, accordions. Adopt a component for those (see *Adopting a library's motion* in `SKILL.md`). Hand-rolling them is how you ship a `<div>` with no focus management.

**Reduced motion applies to every recipe below.** Rather than repeat it seven times:

```css
@media (prefers-reduced-motion: reduce) {
  /* keep opacity and color; drop transform, clip-path and delay */
  * { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}
```

That blunt override is a safety net, not a design. Prefer a gentler variant per component where the motion carries meaning.

---

## 1. Stagger a group entrance

**Decisions:** 30–80ms between items; decorative, so it never blocks input; compositor properties only.

```css
.item {
  opacity: 0;
  transform: translateY(8px);
  animation: item-enter 300ms var(--ease-out) forwards;
  animation-delay: calc(var(--i) * 50ms);
}

@keyframes item-enter {
  to { opacity: 1; transform: translateY(0); }
}
```

```jsx
{items.map((item, i) => (
  <li key={item.id} className="item" style={{ '--i': i }}>{item.label}</li>
))}
```

**Gotchas**
- Keyframes are correct here — the list enters once and isn't retriggered mid-flight. For a list that changes rapidly, use transitions instead.
- A *static* index variable is fine. The CSS-variable warning in `SKILL.md` is about updating a variable every frame, which is a different thing.
- Cap the total: 20 items × 50ms is a full second of waiting. Clamp the delay — `calc(min(var(--i), 8) * 50ms)`.
- Never gate interaction on the stagger finishing.

## 2. Hold to confirm

**Decisions:** asymmetric timing — slow where the user is deciding, snappy where the system responds. `clip-path` because it's compositor-only.

```css
.hold {
  position: relative;
  overflow: hidden;
  transition: transform 160ms var(--ease-out);
}

.hold:active { transform: scale(0.97); }

.hold__fill {
  position: absolute;
  inset: 0;
  background: var(--danger);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out);  /* release: snap back */
}

.hold:active .hold__fill {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;              /* press: slow, deliberate */
}
```

```jsx
const timer = useRef();

<button
  className="hold"
  onPointerDown={() => { timer.current = setTimeout(onConfirm, 2000); }}
  onPointerUp={() => clearTimeout(timer.current)}
  onPointerLeave={() => clearTimeout(timer.current)}
>
  <span className="hold__fill" aria-hidden />
  Hold to delete
</button>
```

**Gotchas**
- CSS can't tell you the hold completed — the timer commits the action. Keep the two durations equal or the fill lies.
- Clear the timer on `pointerleave` and `pointercancel`, or a drag off the button still fires it.
- Give keyboard users a different path. A hold gesture is not keyboard-reachable; offer a confirm step instead.

## 3. Tab indicator with a seamless color transition

**Decisions:** timing individual color transitions never looks clean — two colors crossfading read as two states. Duplicate the list, style the copy as active, and clip it.

```css
.tabs { position: relative; }

.tabs__layer {
  position: absolute;
  inset: 0;
  background: var(--accent);
  color: var(--accent-fg);
  clip-path: inset(0 100% 0 0);
  transition: clip-path 250ms var(--ease-in-out);
  pointer-events: none;
}
```

```jsx
const ref = useRef(null);
const [clip, setClip] = useState('inset(0 100% 0 0)');

useLayoutEffect(() => {
  const el = ref.current?.querySelector('[data-active="true"]');
  const parent = ref.current;
  if (!el || !parent) return;
  const left = el.offsetLeft;
  const right = parent.offsetWidth - (el.offsetLeft + el.offsetWidth);
  setClip(`inset(0 ${right}px 0 ${left}px)`);
}, [activeId]);

<div className="tabs" ref={ref}>
  <ul>{tabs.map(t => <li key={t.id} data-active={t.id === activeId}>{t.label}</li>)}</ul>
  <ul className="tabs__layer" aria-hidden>{tabs.map(t => <li key={t.id}>{t.label}</li>)}</ul>
</div>
```

**Gotchas**
- `aria-hidden` on the duplicate, always — otherwise screen readers hear every tab twice.
- Batch the reads. Measuring in a loop across several instances is the thrashing pattern in `references/performance.md`.
- Re-measure on resize and on font load, or the clip drifts.

## 4. Scroll reveal

**Decisions:** `clip-path` over opacity alone, so the content wipes in rather than ghosting. Fire once; a re-revealing element on every scroll pass is the definition of motion seen too often.

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path 600ms var(--ease-out);
}

.reveal[data-visible='true'] { clip-path: inset(0 0 0 0); }
```

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.dataset.visible = 'true';
      observer.unobserve(entry.target);   // once
    }
  },
  { rootMargin: '-100px' }
);

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
```

**Gotchas**
- `unobserve` after firing, or you keep paying for an element that's done.
- Content must be readable without JS — reveal on top of visible content, never as the thing that makes it visible.
- 600ms exceeds the 300ms UI ceiling deliberately. This is explanatory motion, not interface motion.

## 5. Drag to dismiss

**Decisions:** momentum over distance — a confident flick should dismiss without crossing a threshold. Spring on release so an interrupted drag reverses smoothly.

```js
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.11;

let dragging = false, startY = 0, startTime = 0;

function onPointerDown(e) {
  if (dragging) return;                    // ignore extra touch points
  dragging = true;
  startY = e.clientY;
  startTime = performance.now();
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!dragging) return;
  const delta = e.clientY - startY;
  const damped = delta < 0 ? delta / 3 : delta;   // resist the wrong direction
  e.currentTarget.style.transform = `translateY(${damped}px)`;
}

function onPointerUp(e) {
  if (!dragging) return;
  dragging = false;
  const delta = e.clientY - startY;
  const velocity = Math.abs(delta) / (performance.now() - startTime);

  if (delta > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) dismiss();
  else e.currentTarget.style.transform = '';     // spring back via CSS transition
}
```

**Gotchas**
- `setPointerCapture` is what keeps the drag alive when the pointer leaves the element.
- The `if (dragging) return` guard prevents the jump when a second finger lands mid-drag.
- Write `transform` directly. Routing it through a CSS variable on the parent triggers a style recalc on every child — see `references/performance.md`.
- Exit in the drag's direction. A sheet dragged down leaves downward; that symmetry is what makes the gesture feel obvious.
- Handle `pointercancel` the same as `pointerup`, or a system gesture leaves the element stranded mid-drag.

## 6. Masking a crossfade that won't settle

**Decisions:** last resort, after easing and duration have both failed. Blur bridges two overlapping states so the eye reads one transformation instead of a swap.

```css
.swap {
  transition: filter 200ms ease, opacity 200ms ease;
}

.swap[data-transitioning='true'] {
  filter: blur(2px);
  opacity: 0.7;
}
```

**Gotchas**
- 2px is usually enough. Blur cost escalates sharply with radius and is heaviest in Safari — see the S-tier caveats in `references/performance.md`.
- If you need more than ~4px to make it work, the underlying timing is wrong. Fix that instead.

## 7. Programmatic, without a library

**Decisions:** WAAPI gives JS control at CSS performance — compositor-run, interruptible, no dependency. Reach for it before installing something.

```js
const animation = element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 400, fill: 'forwards', easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
);

// Interrupt cleanly: commit where it got to, then start the next one
function reverse() {
  animation.commitStyles();
  animation.cancel();
  element.animate(/* ... */);
}
```

**Gotchas**
- `fill: 'forwards'` holds the end state but keeps the animation alive. `commitStyles()` then `cancel()` writes it to the element and releases it — otherwise they accumulate.
- `animation.finished` is a promise; prefer it to an `animationend` listener you have to remove.
- Safari drops hardware acceleration when `playbackRate` isn't `1.0`. Don't build scrub interactions on it.
