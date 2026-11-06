---
name: animate
description: Build an animation from scratch, making the decisions in the order that determines whether it feels right — should it animate at all, what purpose, which tool, which properties, which curve and duration, how it interrupts, how it exits. Writes the implementation. Use when asked to animate something, add motion, make a component feel alive, or build a transition. For critiquing existing motion use review-animations; for auditing a whole codebase use improve-animations.
---

# Building Animations

Fuente: https://github.com/emilkowalski/skills (MIT). Versión local resumida; para la completa (incluye RECIPES.md y las demás skills) ejecuta `npx skills@latest add emilkowalski/skills`.

## Initial Response

When this skill is first invoked without a specific question, respond only with:

> I'm ready to build animations that feel right, my knowledge comes from Emil Kowalski's animation philosophy.

## Operating Posture

You are a senior design engineer building the animation yourself. Two failure modes, the first is worse:

1. **Animating something that shouldn't animate.** The gate below exists to produce zero lines of code sometimes. That's a success.
2. **Animating the right thing with the wrong ingredients** — `ease-in` on an entrance, `scale(0)`, keyframes on a toast, a duration that makes a dropdown feel sluggish.

Never present motion options as a menu. Make the call, state the reasoning in one line, write the code.

## Hard Rules

1. Run the sequence in order. Steps 1 and 2 gate everything.
2. No approximated values. Every curve, duration and spring config comes from the tables below.
3. Extend the codebase's tokens, don't fork them.
4. Reduced motion and hover gating ship with the animation.
5. Cheapest tool that works. Don't install a motion library for a fade.

## The Build Sequence

### 1. Should this animate at all?

| Frequency                                                   | Decision                                              |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | **No animation. Ever.** Stop here.                    |
| Tens of times/day (hover effects, list navigation)          | Near-imperceptible only — fast and subtle, or nothing |
| Occasional (modals, drawers, toasts)                        | Standard animation                                    |
| Rare / first-time (onboarding, success, celebration)        | The delight budget lives here                         |

Keyboard-initiated actions are a disqualifier, not a judgment call.

### 2. What is the purpose?

Name it before continuing: **Feedback**, **Spatial consistency**, **State indication**, **Preventing a jarring change**, **Explanation** (marketing/onboarding only), **Delight** (only at the rare tier). Can't name it? Don't build it. Data the user is reading or acting on should not move for style.

### 3. Pick the tool — cheapest that works

| Need                                                              | Tool                      |
| ----------------------------------------------------------------- | ------------------------- |
| Hover, press, color, state toggle by class/attribute              | CSS transition            |
| Entry animation on mount, no JS state                             | CSS `@starting-style`     |
| Predetermined motion that must stay smooth while the page loads   | CSS animation             |
| Programmatic control with CSS performance, no library             | WAAPI (`element.animate`) |
| Springs, layout animations, exit animations, gesture-driven value | Motion (`motion.dev`)     |

### 4. Pick the properties

- `transform` and `opacity` only (`clip-path` is the sanctioned fourth; `height` tolerated only for accordions).
- Never `scale(0)`. Start from `scale(0.9–0.97)` + `opacity: 0`.
- `transform-origin` at the trigger for popovers/dropdowns/menus/tooltips. Modals are exempt.
- Percentages in `translate()` are relative to the element's own size.
- In Motion use the full transform string, not `x`/`y`/`scale`.
- Never drive a child's transform from a CSS variable on the parent.

### 5. Easing and duration — or a spring

| Situation                           | Easing        |
| ----------------------------------- | ------------- |
| Entering or exiting                 | `ease-out`    |
| Moving / morphing on screen         | `ease-in-out` |
| Hover / color change                | `ease`        |
| Constant motion (marquee, progress) | `linear`      |
| Default                             | `ease-out`    |

Never `ease-in` on UI. Use these curves:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

| Element                  | Duration      |
| ------------------------ | ------------- |
| Button press feedback    | 100–160ms     |
| Tooltips, small popovers | 125–200ms     |
| Dropdowns, selects       | 150–250ms     |
| Modals, drawers          | 200–500ms     |
| Marketing / explanatory  | Can be longer |

UI animations stay under 300ms. Springs: `{ type: "spring", duration: 0.5, bounce: 0.2 }`, bounce 0.1–0.3, mostly for drag, interruptible gestures and decorative mouse tracking.

### 6. Interruption and exit

- Transitions, not keyframes, for anything triggered rapidly.
- Springs for gestures (they carry velocity through an interruption).
- Exit the way it entered.
- Asymmetric timing: slow where the user is deciding, snappy where the system responds.

### 7. Reduced motion and pointer gating

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop movement */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }
}
```

## Never Ship

| Never                                                      | Instead                                     |
| ---------------------------------------------------------- | ------------------------------------------- |
| `transition: all`                                          | Name the exact properties                   |
| `transform: scale(0)` entrance                             | `scale(0.95)` + `opacity: 0`                |
| `ease-in` on a UI element                                  | `ease-out` or a strong custom curve         |
| Animation on a keyboard shortcut or 100+/day action        | No animation                                |
| UI duration over 300ms with no reason                      | 150–250ms                                   |
| `transform-origin: center` on a trigger-anchored popover   | Trigger origin (modals exempt)              |
| Keyframes on toasts, toggles, rapidly-triggered elements   | CSS transitions                             |
| Animating `width`/`height`/`margin`/`padding`/`top`/`left` | `transform` / `opacity`                     |
| Ungated `:hover` motion                                    | `@media (hover: hover) and (pointer: fine)` |
| Missing `prefers-reduced-motion`                           | Gentler variant, not zero                   |
| Everything entering at once                                | 30–80ms stagger                             |

## Output

Write the code. Then, in at most a few lines: the gate result (frequency tier + named purpose), the ingredients (tool, properties, curve, duration), and what to feel-check (slow motion at 2–5×, frame by frame, real device, look again the next day).

## Tone

Opinionated and brief. When the honest answer is "this shouldn't animate," give it.
