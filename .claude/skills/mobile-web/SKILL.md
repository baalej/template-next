---
name: mobile-web
description: "Apply when building or reviewing a web app on a phone, when something works in desktop Chrome but feels wrong on device, or when building a PWA, bottom sheet, carousel, full-screen layout or any touch interaction. The platform behaviors that separate a website from something that feels installed: viewport units, safe areas, tap highlight, touch-action, sticky hover, input zoom, overscroll."
disable-model-invocation: true
---

# Mobile Web

**Rule:** A web app on a phone inherits a set of browser behaviors that were designed for documents. Each one has a specific cause and a specific fix. Apply the fix where its cause applies — not globally, and not as a checklist.

**When to apply:** Building or reviewing any interface that will be used on a phone. Also when a layout is correct in desktop Chrome and wrong on a device, which is the signature of everything on this page.

**Scope:** Web on mobile browsers. Not React Native. The sibling to `web-motion` in the stack layer.

## How to read the entries below

Everything here is labeled, because astack does not ask you to accept a rule you can't check:

- **Fact** — a platform behavior. You can reproduce it by opening the page on a device. Not an opinion, and not negotiable while the platform behaves this way.
- **Default** — a sensible starting value. Adjust it for the product.
- **Taste** — one house style among several. Take it or leave it.

Almost everything below is **fact**. That is why this skill is short on hedging: the browser does what it does. The *decision* to care is yours.

**Every fix ships with its reason.** `user-select: none` on a button is correct and on body text is a defect. If you can't say which case you're in, don't apply it.

---

## Symptom table

Match what you're seeing, then read the entry.

| Symptom | Fix |
|---|---|
| Hover style stuck on after tapping | Gate hover behind `@media (hover: hover) and (pointer: fine)` |
| Gray or blue flash when tapping | `-webkit-tap-highlight-color: transparent` |
| Element taller than the screen, bottom button hidden | `100dvh` for app shells, `100svh` for heroes |
| Page zooms in when an input is focused | Input `font-size` at least 16px |
| Taps feel delayed even though nothing is slow | `touch-action: manipulation` plus feedback on press, not release |
| Pull-to-refresh fires while scrolling a panel | `overscroll-behavior: none` on root, `contain` on inner scrollers |
| Content runs under the notch or home indicator | `viewport-fit=cover` plus `env(safe-area-inset-*)` |
| Long-press selects a button's label | `user-select: none` on controls only |
| Horizontal carousel also drags the page vertically | `touch-action: pan-y` on the track |
| Status bar color clashes with the header | One `theme-color` per color scheme |

---

## 1. Hover sticks after a tap — *fact*

Touch has no hover, so browsers synthesize one: the first tap applies `:hover` and leaves it applied until the user taps elsewhere. A button that lifts on hover stays lifted after being tapped.

```css
@media (hover: hover) and (pointer: fine) {
  .button:hover { background: var(--gray-3); transform: translateY(-1px); }
}
```

Both conditions earn their place. `hover: hover` means the primary input can hover; `pointer: fine` means it's precise, ruling out a stylus and the occasional Android device that claims hover. Tailwind v4 compiles `hover:` to the media query already; v3 needs `future.hoverOnlyWhenSupported`.

Touch users still need press feedback — give it through `:active`, which works on every input type (§5).

## 2. Tap highlight flash — *fact*

Mobile Safari and Chrome paint a translucent box over a tapped element. It fires on anything tappable and reads as a flicker under your own press state.

```css
button, a, [role="button"] { -webkit-tap-highlight-color: transparent; }
```

Removing it is only correct if you provide your own press feedback. A control with neither gives the user nothing.

## 3. Viewport height — *fact*

`100vh` is the *largest* viewport: the height with browser chrome collapsed. On load the URL bar is visible, so a `100vh` element overflows by exactly that bar's height and a bottom-pinned control sits off-screen.

```css
.app   { height: 100dvh; }     /* tracks the visible area as chrome shows and hides */
.hero  { min-height: 100svh; } /* the smallest the viewport gets; never overflows */
```

`dvh` resizes as the URL bar collapses — right for an app shell, wrong for marketing content, where it causes shifts mid-scroll. `svh` is stable. `lvh` is the old `vh` and is almost never what you want.

## 4. Input zoom — *fact*

iOS Safari zooms the page when focus lands on an input whose font size is under 16px, and does not zoom back out on blur. The user is left on a cropped, drifted layout.

```css
input, textarea, select { font-size: 16px; }
```

If the design wants smaller inputs on desktop, raise it only where it matters: `@media (pointer: coarse) { input { font-size: 16px; } }`.

**Never disable zoom to fix this.** `user-scalable=no` and `maximum-scale=1` are accessibility failures, and they fix a symptom whose cause is one line away.

While you're there, set the keyboard — **default**, adjust per field: `inputmode="numeric"` for codes, `"decimal"` for amounts, `type="email"` / `type="tel"`, `autocapitalize="none"` and `autocorrect="off"` on usernames and codes, `enterkeyhint` so the return key says what it does.

## 5. Taps feel laggy — *fact*, two stacked causes

**The click delay.** Browsers wait after a tap to see whether a second one is coming, because double-tap zooms. Modern browsers skip it when the viewport is `width=device-width`, but iOS Safari still delays on some elements.

```css
button, a, [role="button"] { touch-action: manipulation; }
```

**Feedback on release instead of press.** A native control responds the instant a finger lands. A web button that changes only on `click` responds when the finger *leaves*, which reads as lag even at 0ms. Style `:active`; in JS, listen to `pointerdown`, not `click`.

```css
.button { transition: transform 120ms var(--ease-out); }
.button:active { transform: scale(0.97); }
```

Press feedback at roughly 100–160ms and a decelerating curve is a **default** — use the project's existing tokens if it has them, per `web-motion`, and don't fork a parallel curve.

## 6. Overscroll — *fact*

Scrolling past the top triggers pull-to-refresh on Android Chrome and the whole-page rubber band on iOS. Correct for a document, wrong for an app with its own scroll containers or a draggable sheet.

```css
html, body     { overscroll-behavior: none; }
.sheet-content { overflow-y: auto; overscroll-behavior: contain; }
```

`contain` keeps the container's own bounce, which feels native, while stopping the page behind it from moving. `none` on the root, `contain` on children. Don't reach for `touchmove` + `preventDefault()` — it blocks scrolling outright and makes the listener non-passive, which costs frames.

## 7. Safe areas — *fact*

By default the browser letterboxes the page inside the safe area, leaving the notch, Dynamic Island and home-indicator zones painted in the body background. A native app paints edge to edge and pads its *content* clear.

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

```css
.app-header { padding-top: env(safe-area-inset-top); }
.bottom-bar { padding-bottom: env(safe-area-inset-bottom); }
.sheet      { padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); }
```

Without the meta tag every `env()` value is `0px`, so the CSS silently does nothing — a common way for this fix to look applied and not be. Fixed headers, tab bars, toasts and sheets need it; ordinary page content usually inherits it from the header. Give `env()` a fallback inside any `calc()`.

## 8. Long-press selects control text — *fact*

Holding a finger on a web button selects its label, or pops the copy/share callout on a link. Native controls never do this.

```css
button, [role="button"], .tab, .chip, .drag-handle {
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
```

**Never put this on `body`.** Users copy error messages, addresses and order numbers. Text that is a *control* shouldn't be selectable; text that is *content* must be. This is the clearest case of the reason mattering more than the rule.

## 9. Gesture axes — *fact*

A horizontal swipe on a carousel is ambiguous: the browser doesn't know whether you mean the page or the track, so it guesses, and the guess shows up as the page jittering while the carousel moves. `touch-action` names what the *browser* may still do.

```css
.carousel      { touch-action: pan-y; }  /* I handle horizontal; browser keeps vertical */
.drag-surface  { touch-action: none; }   /* a custom gesture owns every axis */
```

Use `none` only on elements that genuinely handle everything, or the user can't scroll past them.

If the carousel is native scroll rather than a JS gesture, prefer `scroll-snap-type: x mandatory` with `scroll-snap-align: start`. The browser's own physics beat a hand-rolled spring, and `touch-action` becomes unnecessary.

## 10. Status bar color — *fact* with a **taste** component

The status bar and browser chrome take their color from `theme-color`. A single value gives light mode a dark bar or dark mode a white one.

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)"  content="#0a0a0a" />
<meta name="color-scheme" content="light dark" />
```

That two-tag structure is fact. *Which* color is taste — though matching the very top of the page, usually the header background rather than the brand color, is the choice that disappears. If the app switches theme by class rather than OS setting, update the tag from JS on toggle.

---

## Verification: real hardware, or it isn't verified

**None of the above reproduces in device emulation.** Sticky hover, the tap highlight, the URL bar's effect on `vh`, input zoom, the click delay, overscroll, safe areas, the software keyboard — every one is real-hardware behavior. A simulator is a step up from emulation and still misses touch feel.

- Run the dev server on `0.0.0.0`, open it from the phone by LAN IP.
- iOS: Safari → Develop → the device. Android: `chrome://inspect`.
- Use a phone a few years old, not the newest one on the desk. Test with the keyboard open, and once in landscape.
- If a PWA is a target, test it installed — standalone mode changes viewport, safe areas and status bar behavior.

This is the `verify-by-eye` discipline applied to a device: "it looks right in the responsive pane" is this skill's version of "it compiles".

---

## Related

The sibling of [Web Motion](../web-motion/SKILL.md) in the stack layer. That one governs how things move; this one governs how the platform behaves underneath. Press feedback appears in both — take the curve and duration from `web-motion`, the `touch-action` and `:active` plumbing from here.

The proof method is [Verify By Eye](../verify-by-eye/SKILL.md), narrowed to a physical device. Every fix here is verified by observing the device, never by reading the diff.

Serves the **Felt** quality gate in [Details Compound](../details-compound/SKILL.md): a tap that lags 300ms or a button hidden under the URL bar fails that gate regardless of how correct the logic is.

When one of these keeps recurring across components, stop fixing instances and encode it — a base layer in the stylesheet, a shared `Button`, a lint rule — per [Encode Lessons in Structure](../encode-lessons-in-structure/SKILL.md).
