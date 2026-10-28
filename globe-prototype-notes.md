# Globe comparison prototype

Question: does a globe-first portfolio with spatial navigation feel more engaging than the scrolling portfolio?

Open http://127.0.0.1:4173/globe-prototype.html while the existing server is running. The original remains at /?v=neural-nav-26. This is a separate local comparison, with in-memory scene state.

Flow: press anywhere (or Enter) to zoom toward the rotating neural globe. Five section branches each contain three circles and two connecting lines, ending at a labelled control. Choosing a control moves the camera toward that region. Projects places the existing nine repositories in an offset grid on a perspective-curved surface. Clicking a project opens its description, verified stack, and repository link. Back to globe returns to spatial navigation; Opening view restores the invitation. Escape returns one level.

About, the 28 technologies, Process, and Contact are also reachable. Contact uses the supplied public GitHub profile rather than an invented email. Tiles use typographic covers, not application screenshots. Motion starts from the visitor's existing preference or device preference. Pause motion disables drift and makes scene transitions immediate. Neural chains gather, shrink, absorb, and respawn; grabbed circles pause a chain's approach.

The original portfolio's files and layout are retained. The comparison adds only globe-prototype.html, globe-prototype.css, and globe-prototype.js, and reuses projects.js, globe-math.js, and local stack assets/content.

Browser validation: opening click and camera zoom, five three-node/two-line section branches, nine clickable project tiles, project detail dialog with six IBC badges and correct repository URL, 28 stack logos, About, three process steps, Contact profile link, and Back to globe all checked. Repeated absorption/respawn observed (50+ absorptions). The visual uses projected 3D sphere coordinates and perspective CSS tiles, rather than a WebGL scene. Compare the experience before deciding whether to replace the scrolling version.

## World-space camera revision

Preview: /globe-prototype.html?v=world-camera-3. Section branches attach to actual rotating sphere coordinates. A camera follows a curved path through the selected branch toward that endpoint; return travel reverses the path. The shared camera projects both globe and gathering chains. Chains spawn in a 3D shell, move toward the sphere, and are occluded by its surface. Camera motion therefore passes chains instead of keeping them attached to screen pixels.

Travel renders a brief radial blur with streaks; paused/reduced motion skips travel blur and animation. Project tiles form a convex cap: center depth is about 155px, corners about 100px, and the tangent rotations slope away from the center. Stack logos have no tile background, keep equal horizontal columns, and receive randomized vertical offsets only.

Section entrances carry over the chosen directions and stagger timings. Project groups enter in opposite horizontal order at 200ms intervals with titles fading upward. About columns enter from opposite sides; logo rows scale up; Process steps rise 200ms apart; Contact fades upward. Entrances run once per section per reload. Revisiting a section preserves the camera transition but does not repeat its content entrance.

Browser checks confirmed different Projects/Stack endpoint and camera coordinates, radial-blur intensity during travel, world-chain visibility changing with the camera, center tiles closer than corners, transparent backgrounds for all 28 logos, and working project details/repository links.
Final revisit check: Projects returned with zero content entrance animations running; travel and blur finished at false/0. Center tile depth 154.96px exceeded corner depth 103.04px. Browser console had no errors.

## Drag rotation, globe labels, and curved carousels

Preview: /globe-prototype.html?v=rotating-labels-4. Drag the globe horizontally or vertically in its opening or navigation view. Automatic rotation pauses during the drag, then resumes after 900ms. A drag on the opening globe does not activate the start prompt; a click still starts it.

Each three-node branch and its borderless, transparent label uses positions attached to the sphere, rather than screen-fixed label destinations. Rear-facing branches fade and lose pointer/keyboard targeting. Turning them forward reveals them again. The fixed right-side neural rail keeps all five sections accessible and provides a Globe return. Choosing a hidden anchor through the rail rotates it forward before camera travel. Navigation between sections returns through the globe.

Projects returns to two separate looping carousels (five co-developed, four personal), with 12px/second eased autoplay, arrows, selectors, keyboard arrows, native touch scrolling, and pause controls. Hover/focus pauses movement. Cards expand from 290x220 to 320x280px on desktop with staged 500ms content entry/exit, and neighbours shift aside. Gentle convex depth is limited to 18px and edge rotation to six degrees. Entrances start empty, stagger at 200ms in opposite directions, and do not replay on revisits. The scene render loop also advances carousel motion; no additional animation loop is added.

Validation of this revision: manual globe drag changed yaw from 1.721 to 3.682 and pitch from 0 to 0.150, with front-facing labels disappearing behind the sphere. Rail navigation brought a hidden Projects anchor forward and opened Projects. Both project groups mounted; the first autoplayed while the second remained empty until scrolled into view, then entered with the opposite stagger. Hover expanded a card to 320x280px and exposed details after the transition. Curvature readings stayed within six degrees and 18px depth. Label backgrounds were transparent with zero borders. No browser console errors were observed.

## Letter reveal, themes, planets, and smooth edge cards

Preview: /globe-prototype.html?v=celestial-reveal-5. The invitation, globe labels, section headings, and carousel group headings scramble briefly, then resolve to their final text. Accessible labels retain the real words. Reduced motion resolves immediately. Section entrances and carousel entrances replay on every section visit.

Branch annotations are billboards: their origin follows the sphere anchor, while the two-line leader and text face the camera. The second line stays horizontal in screen space. Background wireframe planets are capped at 20% of the main globe's apparent radius. Dark mode shows a moon; light mode shows a sun. The theme control is available before entering the site; the choice is remembered locally. Scene controls use an accessible play/pause icon, Back, and connected portfolio.

Edge-card reveal eases its screen center into a safe slot over 650ms, while expansion and cover movement take 400ms, type sizing takes 650ms, and details reveal for 450ms after a 300ms delay. Closing hides details first and shrinks afterward. Content controls stay inert during the 750ms staged transition. Browser checks confirmed a clipped card finished fully inside the rail, type transition durations were 0.65s/0.4s, and expanded content fit without internal scrolling.

Final repeat-selection check: clicking the active About destination restarted the title scramble and three content entrance animations. Branch-circle coordinates confirmed equal y values for the second and third nodes, keeping the second segment screen-horizontal. Opening checks confirmed four wireframe planets with maximum nominal size ratio 0.200, a moon in night mode, a sun in paper mode, and a complete resolved invitation. Header inspection confirmed Back, connected portfolio, and SVG playback controls with no text label. No console errors appeared in the final browser check.

## Map lights, continuous pins, and local-time sky

Preview: /globe-prototype.html?v=clock-sky-6. Each section anchor has an irregular, small cluster of slightly larger and thicker sphere nodes. Cluster radii vary on reload, with the closest node always highlighted. Back-facing light nodes remain subdued.

Leader pins use a continuous screen-relative direction instead of a left/right switch. The direction eases as an anchor crosses the center, straightening vertically near the middle and opening outward near the edges. Labels remain camera-facing.

Planets sit farther from the main globe and have substantially different physical sizes. Opening-frame apparent diameters were approximately 9, 22, 42, and 79px, with a maximum globe size ratio of 0.200.

The sky arc uses the device's local clock: east is screen-right, west is screen-left. Night phase runs from 18:00 to 05:30; daytime phase runs from 05:30 to 18:00. The selected theme's body follows that active clock phase, so manually selecting the opposite theme preserves the same sky position. Midnight gives phase 0.5217, near the top center. This is a clock-driven visual arc rather than an astronomical calculation.

Theme changes show both bodies together: 500ms eased arrival/fade followed by 1000ms movement. The outgoing body moves west and fades; the incoming one travels from east to the current clock phase. Reduced motion skips the handoff. Browser checks observed both bodies during ease-in, then a single sun at the previous moon phase. A local time around 03:11 produced phase 0.7993, on the western part of the arc.

## Retained rear labels and independent sky

Preview: /globe-prototype.html?v=retained-pins-7. Sun/moon rendering uses a separate canvas behind the globe. Body size depends only on viewport size, with the sun radius exactly three times the moon radius. The sky receives neither camera projection nor radial zoom blur. A globe silhouette masks sky overlap, and the sky layer fades out for section travel/content, returning in the globe view.

Section labels stay readable and clickable after an anchor turns behind. Each keeps its last visible annotation position; anchors that begin behind use a side fallback. An SVG silhouette mask removes only the leader portions behind the globe. Clicking a rear label turns its anchor forward before entering the section. Annotation motion eases when a retained anchor returns to the front.

Nodes closest to each pin have a thicker ring and larger radius than the surrounding map-light cluster. An opening browser sample reported ten pin-core nodes. The theme handoff simultaneously reported moon radius 17.28px and sun radius 51.84px, a 3:1 ratio.
Browser validation: the rear About label stayed exactly at left 957.787px/top 224.305px during further globe rotation, remained fully opaque, and could still be clicked. The rear-line mask computed to solid black in light mode; the screenshot confirmed only line segments outside the globe remained visible.
Section-zoom validation: About opened by clicking its retained rear label. The sky layer reached opacity 0 in the section, while the sun radius stayed 51.84px before and after camera travel. No browser console errors were reported. Night mode was restored after verification.
