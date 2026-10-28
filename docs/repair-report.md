# Interaction repair report

24 October 2026. The earlier checklist overstated verification. This report distinguishes reproduced failures, fixes, and checks performed after the fixes.

## Reproduced failures

1. **Motion had no user control.** The preview reports reduced motion. Page scrolling computed to `auto`, and zoom/floating were suppressed. There was no control to enable the requested effects.
2. **Line grabs reached a circle instead.** Hit-testing a connection's midpoint returned `neural-node-hit`. Enlarged circle hit areas overlapped the short line, so line dragging could not reliably move both endpoints.
3. **Carousel keyboard focus stayed on the old project.** ArrowRight displayed Hollow while Tidepool remained focused. This could expand details for a different card than the visible slide.

## Fixes

- A visible Enable motion / Pause motion control governs page scrolling, carousel motion, hover transitions, background drift, and scroll-linked accents. Its explicit choice is remembered. Without a saved choice, the page follows the device's reduced-motion preference.
- Each connection has an independent transparent midpoint grab target above the circle hit areas. Visible node counts remain unchanged. A line drag pins and moves both endpoints.
- Floating accents have stronger contrast, contrasting outlines, visible drag hints, and targets kept inside the narrow-screen viewport. Their floating position is held steady during an active drag.
- Arrow-key navigation moves focus to the newly selected project. Requested slide state is tracked during movement, and rapid navigation no longer relies only on the previous scroll position. Navigation has proper start/end limits.
- Project details remain available on hover and keyboard focus, with descriptions and technology badges always visible in touch layouts.
- The 28-item technology grid has category filters, search, result counts, and an empty-result message. Its original 28 entries were present before this repair; missing entries were not reproduced.
- Updated asset URLs ensure the repaired scripts/styles are fetched when the refreshed preview is opened.

## Verification against the eight reported features

- [x] Neural background: increased line/node visibility; canvas rendering and no browser console errors checked.
- [x] Floating, scroll-responsive accents: 3/4/5 circles on desktop, one three-circle accent on mobile; floating/scroll placement uses the visible motion setting.
- [x] Connected dragging: real pointer drags tested for a circle and a connection. The repaired line drag moved both endpoints and its connected neighbour. Keyboard nudging remains available.
- [x] Three-rem limit: numerical node/line drag tests reached and respected the 48-unit hard cap. Rendered resting connections measured about 2.08–2.17rem.
- [x] Smooth scrolling/transitions: Enable motion produced computed `scroll-behavior: smooth`; the choice survived reload. Pause motion intentionally disables those effects.
- [x] Carousel: arrows, direct selectors, keyboard navigation, slide/focus alignment, and final-slide disabled state checked. Native horizontal scrolling remains enabled for touch; physical touch hardware was not used in this audit.
- [x] Zoom/details/badges: focused Hollow reached `matrix(1.065, 0, 0, 1.065, 0, 0)`, description opacity 1, and visible stack badges after the transition settled.
- [x] Responsive stack: 28 visible entries restored by clearing search; Tools produced 13 results; searching React produced exactly one visible result; an unmatched query produced zero results and a recovery message.

Desktop and 390px interaction snapshots passed. No horizontal page overflow was detected in those checks. The browser console reported no errors.

## Remaining scope

The identity, biography, project previews, project-specific stacks, and case studies are still illustrative. Only the technology grid is based on the supplied GitHub profile. Contact still needs an email address. The decorative background network is separate from the short draggable accents; the three-rem connection limit applies to the accents.
