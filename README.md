# Personal portfolio prototype

Run `node server.cjs`, then open http://127.0.0.1:4173/?v=globe-22.

## Project carousels

Default desktop cards measure 300 × 250px and expand to 340 × 330px on hover or keyboard focus. Narrow layouts reduce widths to fit the viewport. The smaller size change keeps expansion subtle. Opening uses 200ms of eased resizing followed by 300ms of upward content reveal. Closing hides the content for 200ms, then shrinks for 300ms. Each sequence totals 500ms; reduced motion skips it. Cards expand equally above and below the rail centre. Neighbouring cards slide aside to make room. Horizontal expansion preserves the original centre where space allows and keeps edge cards within the screen. The expanded preview uses an absolute position inside the rail, so it moves with normal page scrolling and closes after leaving the viewport. Descriptions, stack badges, and actions remain inside the expanded card.

The strip loops automatically at 12 pixels per second with eased starts, stops, and arrow navigation. Hover, focus, dialogs, and the Pause control suspend automatic scrolling. Two independent carousels replace all sample projects: five co-developed repositories and four personal repositories. Every expanded card and detail dialog links to its own repository. The six publicly readable repositories have verified descriptions and stack badges; three inaccessible repositories retain the supplied names and URLs without invented technologies. See project-sources.md for evidence.

## Neural interactions

Twelve short neural chains start near section whitespace and share one page-wide background and physics field. Nodes and line midpoints can be dragged across section boundaries. Dragging near the top or bottom of the viewport scrolls the page, so chains can be carried farther. Springs move connected neighbours, and line lengths stay within 3rem.

Drag a circle close to a circle on any separate chain or connected network, regardless of its starting section. There is no two-chain limit; additional chains can join the same network. The target chain glows. Release to snap the circles together. Joined chains then drift and respond to dragging as one connected network. While holding a chain, shake back and forth four times within about one second to remove its added joints. The detector requires eight direction reversals with at least 14px travel between turns. It ignores slow motion and small jitter. Original short-chain connections remain intact. Joints last until separated, absorbed by the globe, or the page reloads. Reset controls have been removed.

Chains continue drifting throughout the page. While grabbed, a connected network pauses its journey. After release, momentum and travel toward the hero globe resume. A shared negative-z background stays behind page components. Blank carousel gaps pass pointer input through to the neural controls.

## Stack and motion

The 28 technologies use local monochrome SVG logos in borderless, staggered horizontal rows. Search and category filters remain available. See assets/logos/README.md for sources. The motion control remembers the visitor's choice and otherwise follows reduced-motion preferences.

## Validation

Run `node interaction-checks.cjs` for rapid shake detection, slow-motion and jitter rejection, connected components, joint alignment, and 100 joined-chain drag steps constrained to 3rem.

Browser checks confirmed expanded-card sizing and neighbour displacement, page scrolling moving the preview offscreen, zero Reset controls, real pointer dragging creating a lasting joint, a further drag moving the joined network, and a chain crossing from Work into About and connecting to a chain from that section. Three-chain connectivity and shared-junction alignment are covered by automated checks. The rapid shake gesture was checked with timed input samples in the detector test, not a physical hand gesture.

The nine real project repositories and contribution categories are supplied. Identity, biography, location, and contact email remain sample content. PSSE Website, Indecisive Food Finder, and Puzzle Camera Hand Gesture need accessible repository details to complete their descriptions and stacks.



Browser validation of the project update confirmed five and four original project controls, group-specific wrapping navigation, separate expanded previews, correct repository links and role labels, full dialog stack badges, and no console errors or page overflow at the tested desktop width.



## Dragging and hit areas

Static text uses inline hit regions, so whitespace around paragraphs, headings, and layout columns no longer intercepts neural dragging. Links, inputs, buttons, and project cards retain their normal targets.

A recent 120ms pointer sample estimates release velocity, capped at 900px/s. The impulse is shared across the connected chain, scaled for network size, and decays exponentially with a 1.8 per-second damping coefficient. Pausing the pointer before release does not launch it. Page edges reflect the impulse at 55 percent strength. Local springs continue to affect neighbouring nodes.

Browser checks confirmed a released chain continued moving in the drag direction, heading whitespace passed input through while actual text remained selectable, and the opening/closing content transitions used the intended 300ms/200ms stages. Automated checks cover release direction, stale pointer samples, capped speed, and frame-independent decay.


## Hero globe and compact previews

The monochrome hero globe rotates with perspective-projected nodes and connecting lines. Front and back shading gives depth. Neural chains travel toward it, shrink with perspective, and respawn at random page positions after absorption. Joined networks travel together; grabbing them pauses attraction. The shared animation loop respects the motion control and skips globe drawing offscreen.

Expanded cards use clipped overflow without internal scrolling. Their content stays inert during the 500ms transition; wheel, touch, and scrolling keys inside the preview are blocked until animation completes. Browser checks confirmed the expanded content fits its height, no horizontal page overflow, globe rotation, repeated absorption and respawn, and no console errors. Automated checks cover perspective shrinking and globe rotation in addition to the existing physics checks.
## Section entrances

Open /?v=entrances-23. Entrances play once when a component enters the viewport, using 650ms easing. Header slides down, hero copy enters from the left, and globe enters from the right. Work headings enter from the left; visible cards enter in opposite directions per carousel, with 200ms stagger. About columns enter from opposite sides. Stack logos scale up with 150ms row delays. Contact fades upward and the footer follows with a 200ms delay. Motion disabled reveals content immediately; the explicit motion control can enable animation even on a reduced-motion device. Keyboard focus reveals a pending component immediately.
Working together steps fade upward with delays of 0, 0.2, and 0.4 seconds. Latest preview: /?v=entrances-24.
Carousel entrance refinement: /?v=entrances-25. Entire cards, including their backgrounds and all loop clones, remain hidden before the rail enters view. Visible cards then enter left to right for Co-developed and right to left for Personal, spaced by 200ms. Titles fade upward with a 200ms offset. Rail interaction and autoplay resume after the sequence. Observers disconnect after the first reveal; returning to Work does not replay the animation. Browser checks confirmed pending rails contain zero visible cards, opposite stagger order, and completed state after returning.
## Neural section navigation

Latest preview: /?v=neural-nav-26. The fixed right-side rail links six connected circular nodes to page sections. Labels appear on hover and keyboard focus; aria-current tracks the section in view. Header retains identity, theme, and motion controls. Internal links use a 650–1200ms eased scroll, interruptible by wheel, touch, or scrolling keys. Motion-off navigation is immediate. Project preview X controls are removed; pointer exit closes the preview, with focus/Escape behavior retained for keyboard access. Browser checks confirmed intermediate and final scroll positions, correct active-section state, focus labels, zero preview X controls, and pointer exit restoring compact cards.
