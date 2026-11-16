# Scroll-Driven Overlapping Accordion

## Agent-Ready UI / Motion Implementation Brief

**Status:** Ready for implementation planning\
**Component:** Four-card scroll-driven accordion section\
**Visual reference:** The user-provided screenshot of the four white
COMPACT request cards\
**Chosen layout:** Overlapping card stack\
**Primary interaction:** Scroll-driven, pinned sequence\
**Recommended animation tooling:** GSAP + ScrollTrigger, unless the
existing project already has a suitable animation system

------------------------------------------------------------------------

## 1. Project Goal

Build a premium, scroll-driven accordion section containing **four
cards**.

This is not a conventional accordion where users click a heading to
expand a panel. The cards should take turns becoming the active,
expanded card as the user scrolls through a pinned section.

The visual concept is an **overlapping stack of cards**:

-   One card is active, expanded, sharp, and fully opaque.
-   The upcoming cards are layered behind it, offset slightly to the
    right and down, smaller, partially transparent, and softly blurred.
-   As the user scrolls forward, the active card moves to the left and
    fades away with increasing blur.
-   The next card moves from the stack into the active position and
    expands.
-   This sequence repeats until the fourth card becomes active.
-   Each card has two different transparent PNG images: one for its
    collapsed state and one for its expanded state.

The experience should feel deliberate, smooth, polished, and connected
to scroll position---not like four unrelated entrance animations.

## 2. Preserve the Existing Visual Identity

Use the supplied screenshot as the design foundation. Do not redesign
the section into a completely different visual language.

### Keep these visual characteristics

-   Light grey page background.
-   White card surfaces.
-   Rounded corners.
-   Subtle neutral border.
-   Soft, restrained shadows.
-   Blue as the primary accent color.
-   Dark headings and muted blue-grey body text.
-   Clean sans-serif typography.
-   Spacious internal padding and clear CTA hierarchy.

### Improve the composition for the new interaction

The original screenshot shows four cards in a static four-column grid.
For this implementation, convert that composition into a layered stage:

-   The active card should be the visual focus.
-   Upcoming cards should peek out from behind the active card,
    primarily toward the right.
-   The stack should have enough visible depth to communicate that more
    cards are coming.
-   Do not make inactive cards so transparent or blurred that the user
    cannot recognize that more content exists.
-   Avoid excessive glow, strong gradients, aggressive bounce, or
    unnecessary 3D effects.

## 3. Card Content and States

There are exactly four cards. Use the existing content and labels from
the source design unless the project provides updated content.

Suggested content mapping from the reference:

1.  **Pengajuan Liputan**
2.  **Pengajuan Media Partner**
3.  **Pengajuan Kerjasama**
4.  **Pengajuan Peminjaman Ruang Podcast**

Each card should support two visual states.

### 3.1 Collapsed state

-   Card is behind the active card in the stack.
-   Card is narrower in its visible composition, or mostly obscured by
    the card in front.
-   Card is offset to the right and slightly down relative to the active
    card.
-   Card uses reduced opacity and a small blur.
-   Card title remains identifiable where visible.
-   Supporting description and CTA are hidden, reduced, or visually
    de-emphasized.
-   Show the card's **collapsed PNG**.
-   Do not show the expanded-only content as if the card were active.

### 3.2 Expanded / active state

-   Card moves to the main focal position, approximately centered in the
    pinned stage.
-   Card expands to its full presentation size.
-   Opacity becomes 1.
-   Blur becomes 0.
-   Scale becomes 1.
-   Full heading, description, and CTA are visible.
-   Show the card's **expanded PNG**.
-   The image and card content should animate as part of the same state
    transition.

### 3.3 Exiting state

When the user scrolls from one card to the next:

-   The current active card travels toward the left.
-   Its opacity decreases progressively.
-   Its blur increases progressively.
-   It can scale down slightly as it leaves.
-   It should not disappear instantly.
-   The next card moves forward from the stack into the active position.
-   The remaining future cards rearrange behind the new active card.
-   The exiting card must not block clicks on the newly active card.

The previous card may remain partly visible for a short part of the
transition, then move fully outside the stage or become fully
transparent.

## 4. Scroll Interaction and Animation Sequence

### 4.1 Section entry

When the section first enters the viewport:

1.  Pin the accordion stage in the viewport.
2.  The first card begins outside the visible stage on the right.
3.  The first card slides from the right toward the center.
4.  It settles into the active position and expands.
5.  Its collapsed PNG crossfades into its expanded PNG.
6.  Cards 2, 3, and 4 are visible behind it as a progressively deeper
    stack, with reduced opacity and mild blur.

The first card should not already be fully expanded before the section
reaches its entrance trigger.

### 4.2 Card 1 to Card 2

As the user continues scrolling:

1.  Card 1 begins moving left.
2.  Card 1's opacity decreases and blur increases in proportion to
    scroll progress.
3.  Card 1's expanded PNG crossfades back to its collapsed PNG as it
    becomes inactive.
4.  Card 2 moves forward from behind Card 1 and toward the focal
    position.
5.  Card 2 expands.
6.  Card 2's collapsed PNG crossfades into its expanded PNG.
7.  Cards 3 and 4 remain behind Card 2 in the upcoming stack.

### 4.3 Card 2 to Card 3

Repeat the same transition pattern:

-   Card 2 exits toward the left with blur and opacity reduction.
-   Card 3 advances from the stack.
-   Card 3 expands and becomes sharp and fully opaque.
-   Card 3 switches to its expanded PNG.
-   Card 4 remains queued behind it.

### 4.4 Card 3 to Card 4

Repeat the same transition pattern:

-   Card 3 exits toward the left with blur and opacity reduction.
-   Card 4 advances from the stack.
-   Card 4 expands and becomes sharp and fully opaque.
-   Card 4 switches to its expanded PNG.

### 4.5 Section exit

After Card 4 has had sufficient time to be viewed:

-   Complete the final active state.
-   Release the pinned section.
-   Resume normal page scrolling.
-   Do not abruptly cut off the final card.
-   Do not leave the page stuck in a pinned state.

### 4.6 Reverse scrolling

The animation must work in both directions.

When the user scrolls upward:

-   The timeline should reverse naturally.
-   The current card should return to the stack.
-   The previous card should return from the left and become active.
-   PNG states, blur, opacity, scale, and position must reverse
    consistently.
-   Avoid implementing one-way event handlers that cannot restore the
    previous visual state.

**Important:** Prefer a single scroll-controlled animation timeline over
independent one-time animations. This keeps all visual properties
synchronized with scroll progress.

## 5. Layering and Positioning Rules

Use a single stage with cards layered in the same positioning context.
The exact dimensions should be responsive and should be tuned against
the actual project viewport.

### Recommended desktop composition

-   Stage: approximately viewport-height, centered vertically.
-   Active card: approximately 65--75% of the available stage width,
    subject to content and image proportions.
-   Active card: approximately 65--78% of viewport height, with sensible
    maximum dimensions.
-   Upcoming cards: same underlying card component, positioned behind
    the active card.
-   Stack offsets: small horizontal and vertical offsets that visibly
    communicate depth.
-   Use a deliberate z-index order so the active card is always above
    upcoming cards.
-   Keep the stack within the stage bounds; avoid accidental horizontal
    page overflow.

### Suggested visual state values

These are starting points for tuning, not strict final values.

  ---------------------------------------------------------------------------------
  Property        Active card First upcoming         Further           Exiting card
                                        card  upcoming cards 
  ------------ -------------- -------------- --------------- ----------------------
  Opacity                1.00     0.55--0.70      0.25--0.50                  1 → 0

  Blur                    0px            2px          3--5px               0 → 10px

  Scale                  1.00           0.96      0.92--0.94               1 → 0.94

  Horizontal           Center      +24--48px       +48--80px          Center → left
  position                                                   

  Vertical                0px      +10--16px       +20--30px    0px → slight offset
  position                                                   

  Z-index             Highest   Below active   Progressively   Transition-dependent
                                                       lower 
  ---------------------------------------------------------------------------------

Do not apply the table values mechanically if they cause clipping,
unreadable text, or poor image composition. Tune them against the actual
design.

### Stacking behavior

At any moment:

-   Exactly one card is the active card.
-   The active card is the top visual layer.
-   Future cards form the visible stack behind it.
-   Cards already passed should not remain in front of the active card.
-   During a transition, the outgoing and incoming cards may temporarily
    overlap.
-   The active card must remain visually dominant.

## 6. Person PNG Assets and Image Switching

Each of the four cards needs **two separate PNG assets** depicting the
same person/character.

### Required image states

For every card:

1.  `collapsed`: person image used while the card is inactive.
2.  `expanded`: person image used while the card is active.

That means **eight PNG assets total** for four cards.

### Image behavior

-   Both PNGs should occupy the same image container.
-   Use absolute positioning or an equivalent layered-image approach.
-   Crossfade between the two PNGs.
-   Use a subtle scale transition if it improves the visual result.
-   The image must switch based on the card's active/inactive state, not
    based on a separate timer.
-   The image transition must reverse correctly when scrolling upward.
-   Avoid changing the identity, clothing, or core appearance of the
    same person between states unless the supplied assets intentionally
    require it.
-   Preserve transparent backgrounds.
-   Avoid stretching or distorting the person.

### Image quality and composition

-   Prefer transparent PNGs with clean edges.
-   Keep the person's visual center and approximate scale consistent
    between the two states.
-   Use `object-fit: contain`.
-   Reserve enough space so the person does not cover headings,
    descriptions, or CTA buttons.
-   Ensure the person remains inside the card's visual boundary unless
    an intentional overlap is approved.
-   Use a consistent image container ratio across all four cards where
    practical.

### Suggested asset naming

``` text
public/
  images/
    accordion/
      card-1-collapsed.png
      card-1-expanded.png
      card-2-collapsed.png
      card-2-expanded.png
      card-3-collapsed.png
      card-3-expanded.png
      card-4-collapsed.png
      card-4-expanded.png
```

If the repository uses a different asset convention, follow the existing
convention instead of forcing this folder structure.

### Suggested data structure

Keep card content data-driven rather than duplicating four unrelated
card implementations.

``` js
const accordionItems = [
  {
    id: "liputan",
    title: "Pengajuan Liputan",
    description: "Ajukan permohonan liputan acara kampus Anda.",
    ctaLabel: "Ajukan Liputan",
    ctaHref: "#",
    images: {
      collapsed: "/images/accordion/card-1-collapsed.png",
      expanded: "/images/accordion/card-1-expanded.png"
    }
  },
  {
    id: "media-partner",
    title: "Pengajuan Media Partner",
    description: "Bentuk kolaborasi publikasi poster dan promosi acara bersama COMPACT sebagai media partner.",
    ctaLabel: "Ajukan Media Partner",
    ctaHref: "#",
    images: {
      collapsed: "/images/accordion/card-2-collapsed.png",
      expanded: "/images/accordion/card-2-expanded.png"
    }
  },
  {
    id: "kerjasama",
    title: "Pengajuan Kerjasama",
    description: "Ajukan bentuk kerjasama lainnya bersama COMPACT dalam bentuk kolaborasi media.",
    ctaLabel: "Ajukan Kerjasama",
    ctaHref: "#",
    images: {
      collapsed: "/images/accordion/card-3-collapsed.png",
      expanded: "/images/accordion/card-3-expanded.png"
    }
  },
  {
    id: "podcast",
    title: "Pengajuan Ruang Podcast",
    description: "Ajukan peminjaman ruang podcast COMPACT untuk kebutuhan rekaman dan produksi konten Anda.",
    ctaLabel: "Ajukan Ruang Podcast",
    ctaHref: "#",
    images: {
      collapsed: "/images/accordion/card-4-collapsed.png",
      expanded: "/images/accordion/card-4-expanded.png"
    }
  }
];
```

The CTA destinations above are placeholders. Preserve the actual routes
or links from the existing application.

## 7. Expanded Card Content Layout

The expanded card should have a clear content hierarchy.

Recommended composition:

-   Text/content area on the left.
-   Person PNG on the right.
-   Heading near the upper part of the content area.
-   Description below the heading.
-   CTA near the lower part of the content area.
-   Comfortable spacing between text and person image.

The card should not look empty when collapsed. Keep a visible title or
another concise identifier where practical.

The exact person-image position has not yet been confirmed. The
right-side placement is a provisional recommendation, not a fixed
requirement.

## 8. Motion Design Principles

The animation should feel smooth and intentional, not overly playful.

### Recommended motion characteristics

-   Use smooth easing for entrance and image crossfade.
-   Use scroll scrubbing for the main card movement.
-   Use opacity and blur progressively, based on scroll progress.
-   Use moderate scale changes.
-   Keep the card's corner radius and visual style consistent throughout
    the sequence.
-   Avoid large rotations, elastic bounce, or random movement.
-   Avoid transitions that make text jump or reflow unexpectedly.
-   Keep the incoming card's movement visually connected to the outgoing
    card.

### Main motion properties

The scroll timeline should control, as appropriate:

-   `x` / horizontal position
-   `y` / vertical position
-   `scale`
-   `opacity`
-   `filter: blur(...)`
-   card width or active layout state
-   active/inactive content visibility
-   collapsed/expanded PNG opacity and scale
-   z-index or explicit stacking order where required

Do not rely on CSS hover as the primary trigger. Hover can provide small
supplementary feedback, but the primary state is determined by scroll
position.

## 9. Recommended Technical Architecture

### Preferred approach

Use **GSAP + ScrollTrigger** if the project does not already have an
equivalent animation system.

Recommended capabilities:

-   `pin` to hold the section in place while the user scrolls through
    the cards.
-   `scrub` to bind timeline progress to scroll progress.
-   A single coordinated timeline for the four-card sequence.
-   Labels or clearly defined timeline segments for each active card.
-   Reversible timeline behavior for upward scrolling.
-   Responsive recalculation when viewport dimensions change.

Official documentation: - GSAP: https://gsap.com/docs/v3/ -
ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/

### Repository-first instruction

Before coding:

1.  Inspect the existing repository.
2.  Identify the framework, build tool, routing system, CSS strategy,
    and current component structure.
3.  Locate the existing four-card section and identify its current
    content and CTA routes.
4.  Identify whether GSAP, Framer Motion, Motion, or another animation
    library is already installed.
5.  Reuse the existing framework and established project conventions.
6.  Do not migrate frameworks or add a new animation library without a
    clear reason.
7.  If the framework or animation approach cannot be established from
    the repository, ask before making a major architectural choice.

### Component architecture

Suggested logical components:

``` text
ScrollAccordionSection
├── ScrollAccordionStage
│   ├── AccordionCard (card 1)
│   ├── AccordionCard (card 2)
│   ├── AccordionCard (card 3)
│   └── AccordionCard (card 4)
└── ScrollTimelineController
```

The implementation may use fewer components if that better matches the
existing application. This is a conceptual separation, not a demand for
unnecessary abstraction.

### State management

-   Derive the active card from the scroll timeline/progress.
-   Do not create conflicting independent states for card activity and
    PNG selection.
-   A card's expanded image must be derived from the same active state
    that controls its expanded layout.
-   Avoid a timer-based image switch.
-   Ensure state and timeline remain synchronized after refresh, resize,
    and reverse scrolling.

## 10. Scroll Length and Timing

There are four active card states and three card-to-card transitions,
plus the first entrance and final exit.

Recommended starting point:

-   Pin the section for approximately 400--500vh of scroll distance on
    desktop.
-   Allocate enough scroll distance for each card to be understood
    before the next transition.
-   Make the first entrance shorter than the main viewing intervals.
-   Make the three card transitions similar in duration.
-   Give the fourth card a final viewing interval before releasing the
    pin.

These values are adjustable. The final duration must be tested with the
actual page content and viewport height.

Do not make the animation so long that users feel trapped in the
section. Do not make transitions so fast that the person-image changes
and card content cannot be perceived.

## 11. Responsive Behavior

Desktop is the primary target for the overlapping pinned experience.

### Desktop

-   Use the full scroll-driven overlapping stack.
-   Keep the active card centered in the stage.
-   Keep future cards visible behind it.
-   Ensure the person image and content fit without overlap.
-   Prevent horizontal page scrolling.

### Tablet

-   Reduce card width and image size as needed.
-   Reduce stack offsets and blur if the visible stack becomes too
    crowded.
-   Preserve the active-card hierarchy.
-   Test touch scrolling and pin behavior carefully.

### Mobile

**Provisional recommendation:** Use a simpler vertical accordion or
one-card-at-a-time interaction on narrow screens instead of forcing the
full desktop overlap animation.

-   Avoid a long pinned interaction that makes normal mobile scrolling
    difficult.
-   Keep all four cards reachable.
-   Allow tap-to-expand as a fallback.
-   Preserve both PNG states if the image transition remains useful.
-   Respect reduced-motion preferences.

This mobile behavior is an assumption and should be confirmed before
implementation if mobile is a major target.

## 12. Accessibility and Usability

-   Respect `prefers-reduced-motion`.
-   Provide a reduced-motion mode that removes or greatly simplifies
    scroll-driven movement.
-   Ensure headings, descriptions, and CTA buttons remain accessible to
    screen readers.
-   Do not make a CTA clickable when its card is hidden or inactive.
-   Ensure keyboard users can reach active card controls.
-   Avoid trapping keyboard focus inside the pinned section.
-   Maintain sufficient text contrast.
-   Do not use blur and opacity as the only way to communicate card
    order or meaning.
-   Provide a non-scroll-dependent way to access all four requests on
    mobile or when motion is reduced.

## 13. Performance Requirements

-   Animate transform and opacity wherever possible.
-   Use blur sparingly because large blur filters can be expensive to
    render.
-   Avoid repeatedly mounting and unmounting cards during scroll.
-   Avoid unnecessary React re-renders on every scroll frame; use the
    animation library's animation mechanisms appropriately.
-   Preload the eight PNG assets or at least preload the first card's
    two images and the next card before its transition.
-   Avoid layout shifts while images load; reserve image dimensions in
    advance.
-   Clean up ScrollTrigger instances and event listeners when the
    component unmounts.
-   Recalculate measurements on resize using the library's refresh
    mechanism.
-   Test on a mid-range laptop and a mobile device, not only a high-end
    desktop.

## 14. Interaction Boundaries

The user requested a scroll-driven sequence. Therefore:

-   Scroll is the primary mechanism for changing the active card.
-   Do not require users to click a card to activate it.
-   CTA buttons remain normal links or buttons and retain their existing
    functionality.
-   Optional click navigation between cards should not be added unless
    explicitly approved.
-   Optional scroll snapping should not be added by default.
-   Hover effects may be added subtly, but must not conflict with the
    scroll-controlled state.

## 15. Acceptance Criteria

The implementation is complete only when all of the following are true.

### Visual

-   [ ] The original white-card / blue-accent visual identity is
    preserved.
-   [ ] Four cards are layered in an overlapping stack.
-   [ ] The active card is visually dominant.
-   [ ] Upcoming cards are visible behind the active card with reduced
    opacity and mild blur.
-   [ ] The active card is centered in the stage.
-   [ ] The active card shows its expanded content and expanded PNG.
-   [ ] Inactive cards show their collapsed PNG.
-   [ ] The layout does not cause unwanted horizontal overflow.

### Scroll behavior

-   [ ] Entering the section causes Card 1 to slide from the right into
    the active position.
-   [ ] The section pins while the four-card sequence plays.
-   [ ] Scrolling forward moves the active card left and fades/blurs it
    out.
-   [ ] The next card advances from the stack and expands.
-   [ ] The same transition works for Cards 1 → 2 → 3 → 4.
-   [ ] The fourth card receives a final viewing interval.
-   [ ] The section releases and normal page scrolling resumes.
-   [ ] Scrolling upward reverses the sequence correctly.
-   [ ] The animation is tied to scroll progress rather than independent
    timers.

### PNG behavior

-   [ ] Each card has a collapsed PNG and an expanded PNG.
-   [ ] The two images belong to the same person/character for that
    card.
-   [ ] PNGs crossfade when the card changes active state.
-   [ ] PNG switching follows the card state.
-   [ ] PNG transitions reverse correctly on upward scrolling.
-   [ ] Images remain undistorted and do not cover essential content.

### Responsive and accessibility

-   [ ] Desktop behavior works at common laptop and desktop widths.
-   [ ] Tablet behavior does not clip essential content.
-   [ ] Mobile has a usable fallback.
-   [ ] Reduced-motion preferences are respected.
-   [ ] All four CTAs remain accessible.
-   [ ] Keyboard navigation is not trapped by the pinned section.

### Engineering

-   [ ] Existing routes and CTA behavior are preserved.
-   [ ] Existing project conventions are followed.
-   [ ] No unnecessary framework migration occurs.
-   [ ] Animation instances and listeners are cleaned up.
-   [ ] Images do not cause layout shifts.
-   [ ] No console errors occur during forward or reverse scrolling.

## 16. Explicit Assumptions and Decisions Still Open

The following items have not been confirmed by the user. Treat the
listed recommendations as defaults for a prototype, not as immutable
requirements.

  -----------------------------------------------------------------------
  Topic                   Provisional             Status
                          recommendation          
  ----------------------- ----------------------- -----------------------
  Card composition        Overlapping stack, with **Confirmed by user**
                          upcoming cards peeking  
                          out to the right        

  Number of cards         Four                    **Confirmed by user**

  Primary trigger         Scroll position         **Confirmed by user**

  First entrance          First card enters from  **Confirmed by user**
                          the right and expands   

  Outgoing movement       Active card moves left, **Confirmed by user**
                          then gains blur and     
                          loses opacity           

  Inactive appearance     Slightly blurred and    **Confirmed by user**
                          transparent             

  Person assets           Two PNG states per      **Confirmed by user**
                          card: collapsed and     
                          expanded                

  Scroll control          Smooth scrub,           Recommended default;
                          reversible in both      confirm if snap is
                          directions              desired

  Person placement        Right side of expanded  Provisional; not
                          card                    confirmed

  Card dimensions         Active card around      Provisional; tune to
                          65--75% stage width     viewport and content

  Mobile behavior         Replace desktop pinning Provisional
                          with a vertical/tap     
                          accordion               

  Animation library       GSAP + ScrollTrigger,   Recommended; inspect
                          unless an existing      repository first
                          project library is      
                          suitable                

  Framework               Use the framework       Must be discovered
                          already in the          
                          repository              

  CTA destinations        Preserve existing       Must be discovered
                          links/routes            

  Final card ending       Hold Card 4 briefly,    Recommended default
                          then release the pin    

  Hover behavior          Optional subtle         Not required
                          feedback only           

  Scroll snapping         Off by default          Not confirmed
  -----------------------------------------------------------------------

### Questions to ask only if the repository or design assets cannot resolve them

1.  **Person placement:** Should the person appear on the right side of
    the expanded card, on the left, centered, or overlap the card
    boundary?
2.  **Mobile:** Is the simplified vertical/tap accordion acceptable, or
    must mobile reproduce the overlapping scroll-driven animation?
3.  **Scroll feel:** Should the card transitions be purely continuous
    (scrub), or should the scroll settle/snap at each card?
4.  **Collapsed content:** Should inactive cards show only the title, or
    title plus a short description?
5.  **Card 4 ending:** Should the last card simply remain expanded
    before normal scrolling resumes, or should it have a special exit
    animation?

Do not block repository inspection or a first visual prototype on
questions that can be answered by inspecting the existing code, routes,
or supplied assets. Ask the user only when a decision materially affects
the implementation and cannot be inferred safely.

## 17. Instructions to the Coding Agent

Implement this as a focused enhancement to the existing four-card
section.

Before changing code:

1.  Inspect the repository and report the framework, relevant
    component/file paths, current animation dependencies, and CTA
    destinations.
2.  Identify which of the eight PNG assets already exist and which are
    still needed.
3.  Confirm the actual content dimensions and viewport behavior.
4.  Present any major unresolved design decisions that cannot be
    inferred from the code.

Then implement:

1.  The overlapping card stage.
2.  The pinned, reversible scroll timeline.
3.  The active/inactive card transitions.
4.  The two-PNG state transition for each card.
5.  Responsive and reduced-motion fallbacks.
6.  Cleanup and performance safeguards.

### Code-change discipline

-   Follow the repository's existing architecture and style.
-   Do not replace unrelated sections.
-   Do not change existing content, CTA destinations, or routing without
    approval.
-   Avoid adding dependencies if the project already has a suitable
    solution.
-   If making changes to existing files, preserve unrelated
    functionality.
-   Provide complete file contents for changed files when reporting the
    implementation, along with a concise list of files changed and how
    to test the result.
-   Do not claim the animation is verified until it has actually been
    run in the project.

### Final expected result

A four-card, overlapping, scroll-driven accordion that behaves like one
coordinated visual sequence:

**Card 1 enters from the right → expands → Card 2 takes over → Card 3
takes over → Card 4 takes over → pinned section releases.**

At every stage, the active card is sharp and expanded, upcoming cards
are stacked behind it with controlled blur and transparency, and each
person's PNG changes between collapsed and expanded states in sync with
the card's active state.
