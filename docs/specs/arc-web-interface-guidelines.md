# Bring Arc into Web Interface Guidelines Compliance

## Problem Statement

The Arc Showcase and Reading Room already have strong visual identity and baseline accessibility, but the interface review found remaining Web Interface Guidelines violations. Keyboard and screen-reader users can encounter unclear state announcements, fragile overlay positioning, inconsistent focus behavior, and non-deep-linkable navigation. Mobile users can encounter unsafe overlay placement, scroll chaining, and clipped content. Forms, dates, numbers, loading copy, and headings do not consistently follow the project’s intended interaction and content standards. These issues make Arc feel less reliable without requiring any change to its approved editorial character.

## Solution

Bring the Arc Showcase, its reusable components, and the Reading Room into compliance while preserving Arc’s visual language and the Reading Room’s existing local-only behavior. Make interaction state accessible and deep-linkable, overlays resilient, forms recoverable, motion preference-aware, content robust, and copy consistent. Keep all implementation inside Arc’s existing design-system boundary; Bard and the Portal must not inherit Arc’s markup, styles, tokens, or visual decisions.

## User Stories

1. As a keyboard user, I want every interactive control to show an intentional focus-visible state, so that I can see where I am without mouse-focused styling appearing unnecessarily.
2. As a keyboard user, I want skip-link destinations to retain a visible focus indicator, so that following the skip link does not make my position ambiguous.
3. As a keyboard user, I want popovers that open near the bottom of the viewport to remain visible and operable, so that I can reach their controls without off-screen focus.
4. As a screen-reader user, I want asynchronous field errors and success messages announced politely, so that validation does not depend on visual changes alone.
5. As a screen-reader user, I want clipboard success and failure announced with a recovery action on failure, so that I know whether copying worked and what to do next.
6. As a screen-reader user, I want meaningful gradients, type scales, and component indexes exposed with appropriate semantics, so that labels are attached to useful roles rather than generic containers.
7. As a screen-reader user, I want each tab and panel association to use unique IDs, so that multiple tab sets with the same item IDs cannot confuse assistive technology.
8. As a screen-reader user, I want an avatar with missing or blank name input to expose a useful fallback, so that an empty accessible name is never announced.
9. As a reduced-motion user, I want toast, tooltip, dialog, button, and proof animations to honor my preference, so that nonessential motion does not bypass the system setting through portals.
10. As a mobile user, I want dialogs and toasts to account for display cutouts and home indicators, so that content and dismissal controls do not land in unsafe areas.
11. As a mobile user, I want scrolling inside dialogs and constrained popovers to stay contained, so that the page behind an overlay does not scroll unexpectedly.
12. As a touch user, I want links and controls to use intentional tap behavior, so that activation does not incur avoidable double-tap delays.
13. As a desktop user, I want overscroll behavior applied only where appropriate for fine pointers, so that rubber-banding is suppressed without removing coarse-pointer pull-to-refresh behavior.
14. As a reader using long titles or unbroken strings, I want cards, dialogs, toasts, notes, and zoom examples to wrap rather than clip, so that content remains readable.
15. As a reader receiving multiple toasts, I want notifications stacked according to their actual height, so that a taller message never overlaps another notification.
16. As a form user, I want text fields and selects to expose meaningful names and appropriate autocomplete behavior, so that browsers and password managers treat them predictably.
17. As an email-field user, I want email spelling correction disabled, so that the browser does not alter addresses while preserving the correct email keyboard and validation semantics.
18. As a form user, I want placeholders to provide examples and end with an ellipsis, so that I understand the expected input pattern without confusing placeholder text for a label.
19. As a note author, I want whitespace-only submission to produce an inline corrective error and focus the note field, so that I can fix the problem instead of experiencing a silent no-op.
20. As a note author, I want a nonempty draft to trigger an unsaved-changes navigation warning, so that an accidental reload or departure does not discard my writing without notice.
21. As a Showcase visitor, I want the selected tab reflected in the URL, so that I can bookmark, share, reload, and revisit the same specimen view.
22. As a Showcase visitor, I want expanded React source panels reflected in the URL, so that a shared link can reopen the implementation details I was reading.
23. As a Showcase visitor, I want pagination rendered as real links, so that plain clicks, modified clicks, middle clicks, reloads, and browser history all behave like navigation.
24. As a Showcase visitor, I want resource filters and sorting reflected in the URL, so that browser Back and Forward restore the collection state I was using.
25. As a Reading Room visitor, I want Today, Library, and Notes to use real links with URL-backed state, so that section navigation supports standard link interactions and deep links.
26. As a Reading Room visitor, I want catalogue search, status filters, and the selected reader volume reflected in the URL, so that reload and history preserve my context.
27. As a visitor encountering an empty page range, I want pagination to avoid requesting nonexistent pages, so that Next and Previous never lead to invalid states.
28. As an international reader, I want dates and times rendered through locale-aware formatters from real timestamp data, so that presentation is not tied to hardcoded English strings.
29. As an international reader, I want page numbers, counts, slider values, limits, and padded ledger numbers rendered through locale-aware number formatting, so that numeric presentation remains consistent.
30. As a reader using browser translation, I want Arc branding, font names, code tokens, and identifiers protected from translation, so that product and technical names are not garbled while surrounding prose remains translatable.
31. As a reader, I want number-and-unit pairs and keyboard shortcuts kept together with non-breaking spaces, so that values and instructions do not break awkwardly across lines.
32. As a motion-sensitive reader with an ordinary motion preference, I want transitions limited to compositor-friendly properties, so that interaction remains responsive and avoids unnecessary layout or paint work.
33. As a pointer user, I want all links and actions to provide visible hover feedback, so that interactive elements are recognizable and state changes remain clear.
34. As a reader, I want headings and buttons to use Chicago Title Case consistently, so that the Showcase and Reading Room follow one copy standard.
35. As a reader waiting for a save, I want loading labels to end with an ellipsis, so that the interface clearly communicates an in-progress action.
36. As a reader, I want active, second-person, specific action copy, so that labels explain the destination or result instead of relying on generic phrases such as Preview or View Details.
37. As a reader, I want counts expressed with numerals, so that quantities are easy to scan and compare.
38. As a reader on a slower connection, I want critical display and body fonts preloaded with swap behavior retained, so that essential typography arrives promptly without invisible text.
39. As a visitor working with a large dataset, I want tables and other potentially long collections to use a documented large-list strategy, so that rendering does not degrade once content exceeds 50 items.
40. As a reader using text or browser zoom, I want zoom demonstrations and real content to reflow without clipping or horizontal page overflow, so that enlargement does not make copy inaccessible.
41. As a user of Arc’s existing interactions, I want theme persistence, dialogs, tabs, reading progress, saved books, notes, filtering, empty states, and toast dismissal to keep working after the compliance fixes.
42. As an Arc maintainer, I want the fixes to remain local to Arc and tested through external behavior, so that Bard’s design independence and the existing component architecture remain intact.

## Implementation Decisions

- Limit product changes to the Arc Showcase, Arc-owned reusable components, and the Reading Room. Do not extract a shared styled library or change Bard or the Portal to match Arc.
- Preserve Arc’s editorial visual language, existing light and dark themes, local-only data model, component inventory, and separate Reading Room product-prototype role.
- Use native links for section and page navigation. Buttons remain appropriate for actions such as opening dialogs, saving books, changing tabs, and dismissing notifications.
- Introduce one Arc-local URL-state approach based on the History API and URL search parameters rather than adding a router. Initialize state from the URL, validate values against known options, omit default values where practical, and respond to Back and Forward through URL changes.
- Use replace-style history updates for high-frequency search typing and push-style updates for deliberate navigation such as changing views, filters, tabs, pages, or opening a reader. Preserve relevant hash targets so deep links return visitors to the corresponding specimen or application region.
- Give Pagination a page-URL factory and render real links. Same-document enhancement is allowed only for plain, unmodified clicks; modified clicks and middle clicks must retain native link behavior. Handle zero pages and clamp or reject out-of-range current pages.
- Keep tab activation keyboard behavior unchanged while supporting URL-backed selection from the Showcase. Namespace all tab and panel IDs per component instance.
- Represent expanded specimen source panels in query state, including multiple open panels if the interface permits them, and preserve native disclosure keyboard behavior.
- Replace Reading Room section buttons with links whose destinations encode the selected view. Keep catalogue state in the same URL model, and represent the open reader by a validated book identifier.
- Use real links in pagination and Reading Room navigation without removing their current hover, active, focus, and current-page treatments.
- Add meaningful field names and explicit autocomplete values at every reviewed text-input, textarea, and select usage. Use autocomplete-off for non-auth local fields, email semantics for the email example, and disable spellcheck for email input.
- Keep persistent labels and inline field messages. Give asynchronous validation and success containers persistent polite live-region behavior, announce clipboard outcomes, and provide a manual-copy recovery instruction when clipboard access fails.
- Validate trimmed Reading Room notes. On whitespace-only submission, expose an inline error associated with the textarea and focus that field. Guard reload and external navigation while a trimmed or untrimmed nonempty draft exists; do not warn after a successful save or when the draft is blank.
- Store dates as ISO timestamps or equivalent date data, with page and completion metadata separate from dates. Format visible dates and times at render time with the Intl date, time, and relative-time APIs using the browser language preference with a document-language fallback.
- Store numeric values as numbers. Format pagination, table entries, slider values and limits, Reading Room counts, and ledger numbering with Intl number formatting; use minimum integer digits instead of manual zero-padding.
- Keep brand names, font names, code tokens, and technical identifiers inside narrowly scoped no-translation elements. Do not disable translation for surrounding prose, book excerpts, or user-authored notes.
- Use non-breaking spaces inside number-and-unit pairs and keyboard shortcuts. Normalize headings and buttons to Chicago Title Case, including disclosure text generated by CSS and source examples shown to users.
- Change loading copy to a specific label ending in an ellipsis. Rewrite reviewed passive and first-person copy into active, second-person language, replace vague action labels with specific destinations or objects, and use numerals for counts without flattening Arc’s editorial tone.
- Use appropriate semantic containers for the gradient description, recommended type scale, and component index. Keep decorative artwork hidden from assistive technology and give meaningful artwork an image role and accessible description.
- Provide a deliberate fallback for blank avatar names and initials. Keep any existing accessible-name override available to consumers.
- Restrict transitions and keyframes to transform and opacity. Make color, background, border, and shadow state changes immediate where necessary rather than retaining non-composited animations.
- Move transform origins onto stable element styles. Preserve the existing motion-proof replay and pause behavior and stop nonessential animation under reduced motion.
- Give portaled tooltips and toasts the same Arc theme and reduced-motion context as other overlays. Do not rely solely on descendant selectors that stop at the portal boundary.
- Replace fixed toast-index offsets with one Arc-owned fixed notification region that stacks messages using normal layout and gap spacing. Constrain text tracks with zero minimum widths and add emergency wrapping for dynamic messages.
- Add safe-area-aware padding or offsets to full-screen dialogs and fixed notification regions. Add modal scroll containment, and constrain popovers with a viewport-relative maximum height and contained vertical scrolling.
- Position popovers with vertical flipping or clamping as well as horizontal clamping. Recheck usable placement at viewport edges and preserve Escape dismissal and focus return.
- Add emergency wrapping and zero-minimum sizing to dynamic card, dialog, toast, and Reading Room note content. Remove the zoom example’s clipping behavior while retaining intentional horizontal scrolling for data tables.
- Apply focus-visible rather than focus for input emphasis and skip-link reveal, remove unreplaced outline suppression from skip-link targets, and add missing hover feedback to brand and footer links.
- Apply manipulation touch behavior to links as well as buttons and disclosures. Add fine-pointer-only page overscroll suppression while leaving coarse-pointer behavior unchanged.
- Preload only the critical Fraunces and Inter Latin variable font assets through build-stable production URLs, retaining Fontsource swap behavior and avoiding a preload for every font weight.
- Use a large-list strategy compatible with semantic markup for any collection that can exceed 50 items. Prefer content visibility with sensible intrinsic sizing where browser behavior is verified; otherwise paginate before rendering rather than introducing an unbounded row or note list.
- Update visible React examples alongside the running specimens so that the documentation demonstrates the corrected form, navigation, loading, and formatting behavior.

## Testing Decisions

- Use the confirmed browser-first seam: extend the existing production-build Playwright coverage for user-visible behavior. Use the existing React Testing Library and Vitest seam only for public component edge cases that cannot be reached through the current pages.
- Test external behavior, accessibility names and relationships, URLs, focus, keyboard interaction, computed visual states, and layout outcomes. Do not assert private component state, helper calls, internal file structure, or implementation-specific class generation.
- Extend the existing Arc Showcase browser scenarios for tab/source deep links, filter and pagination history, native link behavior, loading copy, form metadata, live regions, clipboard success and failure, focus-visible behavior, and locale-aware output.
- Extend the existing Reading Room browser scenarios for link navigation, URL initialization and Back/Forward restoration, selected-volume deep links, whitespace-note recovery, unsaved-draft warnings, long-note wrapping, and locale-aware dates and counts.
- Exercise popovers at the top and bottom viewport edges, dialogs and toasts at mobile sizes, multiple toasts with long content, and focus return after overlay dismissal. Assert that focused controls remain inside the usable viewport and overlay scrolling stays contained.
- Run both existing desktop and mobile Chromium projects, including light and dark themes and reduced-motion emulation. Check that portaled toast and tooltip animations receive reduced-motion treatment.
- Retain and update the existing keyboard, viewport-overflow, theme-persistence, reading-progress, saved-book, note, and toast scenarios rather than replacing their behavior coverage with static snapshots.
- Retain axe WCAG AA scans as a baseline, but do not treat them as proof of guideline compliance. Add explicit assertions for URL state, live regions, copy, typography protection, placeholder conventions, non-breaking spaces, font preloads, motion preferences, and resilient layout that axe cannot establish.
- Add focused component tests for duplicate tab IDs, blank Avatar names, zero-page Pagination, large table data, and reusable dynamic field messages. Use public props and observable DOM relationships rather than implementation details.
- Exercise more than 50 rows through the public Table interface and verify the chosen large-list behavior without testing internal virtualization mechanics.
- Use realistic short, average, very long, and unbroken content for cards, dialogs, toasts, notes, and zoom scenarios. Check no horizontal page overflow and no overlapped notifications.
- Use the existing full verification pipeline after focused tests so type checking, production builds, all component tests, and all browser tests run. Unchanged Bard and Portal scenarios act as design-independence regression coverage.

## Out of Scope

- Redesigning Arc’s approved visual composition, tokens, themes, or component inventory beyond the changes required for compliance.
- Adding a Bard application, changing Bard’s styling, or creating shared styled components across Arc and Bard.
- Adding backend services, accounts, cross-device persistence, or durable Reading Room storage beyond the current visit-local prototype behavior.
- Adding a routing framework, a new state-management library, or a general-purpose design-system package.
- Translating the product copy itself; this work only adds locale-aware formatting and translation protection where required.
- Introducing new Reading Room features unrelated to the reviewed violations, such as book deletion, social reading, authentication, or note editing.
- Broad non-Chromium, physical-device, or screen-reader certification as part of automated delivery. Those remain manual follow-up checks after the implementation passes the existing verification pipeline.

## Further Notes

- The findings came from a static review against the Web Interface Guidelines fetched during this conversation. Automated checks alone cannot establish every requirement, especially content quality, safe areas, live-region behavior, touch behavior, and reduced-motion correctness.
- Preserve the distinction in the project glossary: the Showcase presents Arc’s foundations and components, while the Reading Room is a separate product prototype consuming Arc.
- Existing accepted architectural decisions require local component implementations and explicit Arc-owned dependencies. Any helper introduced for URL state or formatting must remain inside Arc’s boundary.
- After implementation, manually spot-check a coarse-pointer device, a notched device, a browser other than Chromium, and at least one screen reader for behaviors that the current automated environment cannot validate convincingly.
