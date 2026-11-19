# Arc Flashcards design

This document records the shipped visual world of **Arc Flashcards**, a separate product prototype at `/arc/flashcards/`. It does not redefine the approved Arc showcase, Reading Room, or Bard.

Decision provenance: the user selected the bolder **Study stage** composition after comparing alternatives. Seed reference: `seed:76a41df2720c8805`.

## Visual world

Flashcards uses Arc’s existing token definitions, components, fonts, and theme behavior. The work surface is warm ivory in light mode and deep aubergine in dark mode. Aubergine ink carries meaning first; purple rules establish real boundaries between work areas, fields, controls, and navigation. Magenta, marigold, orange, and the Arc gradient are reserved for selection, active practice, registration details, progress, and focused action rather than body copy.

The signature composition is an aubergine study stage containing a real paper flashcard and an adjoining practice configuration. A faint dotted print texture belongs only to the card space. The paper card has a slight analogue rotation and a compact magenta registration edge; these effects disappear or simplify where the layout or motion preference requires it. Other surfaces remain quiet and unornamented.

## Typography and density

- **Fraunces Variable:** the set name, page headings, card prompts and answers, set titles, and other content-led moments.
- **Inter Variable:** controls, forms, navigation, explanatory copy, and everyday application text.
- **IBM Plex Mono:** measurements, card positions, counts, field labels, dates, and keyboard notation only.

Headings carry themselves without eyebrow or kicker paragraphs. A standalone Current/Final summary label remains where it identifies a practice ledger rather than introducing a heading. Long user content wraps rather than truncating, and secondary metadata remains subordinate to task controls.

The default home composition keeps the selected preview and all six set choices within a 1440×900 first viewport. The recent-set switcher uses compact linked choices with a visible selected treatment and `aria-current`; choosing one replaces the stage content and records `stage=` in the URL without opening the set-detail page. Show all expands into the complete inventory. The preview itself follows the active default practice fields, rendering only the configured front and back values.

## Composition

- **Masthead:** Arc Flashcards identity, the persistent New set action, and a labelled Light/Dark theme control.
- **Study stage:** selected-set heading and metadata, Edit and inventory actions, real-card preview, practice configuration and primary action, then recent sets.
- **Folder index:** every folder and nested branch, practice-scope checkboxes, New folder, and an optional resumable-session region. Local-library maintenance stays separate below it.
- **Practice:** one dominant card, explicit batch position and progress, visible Known/Don’t know/Show answer/Continue controls, and a restrained current-summary ledger. Early Don’t know reveals the answer and waits for Continue; checkpoints and the final session summary keep repetition understandable. The latest rating offers a visible or U-key Undo until another rating replaces it.
- **Editor:** persistent set details and folder memberships above a union grid. Every field has a visible name input; every card is numbered; populated fields cannot be deleted. Validation stays next to the affected draft.

Set-detail and folder views use the same editorial measure, breadcrumbs, meaningful horizontal rules, and familiar controls. Destructive actions are isolated and confirmed. Empty states explain what can happen next instead of acting as decorative panels.

## Themes and states

Light mode preserves literal paper contrast on the study stage. Dark mode keeps the same aubergine structure while adapting paper and text through Arc tokens; it does not introduce a new palette. Both themes meet the tested accessibility baseline.

Interactive states are intentional: selected choices carry ink and border changes, hover respects the existing Arc controls, keyboard focus remains prominent, disabled practice and field-deletion controls expose their constraints, validation identifies recovery without discarding input, and destructive actions use the danger tokens consistently. Notifications and live regions announce progress without stealing focus.

## Responsive and adaptive behavior

- Above narrow desktop widths, the stage sits beside the folder index and six recent sets form one row.
- At narrower widths, recent choices reflow to three columns while the preview remains usable.
- On tablets and phones, the selected set and primary practice workflow precede recent sets and the folder index. The preview and configuration stack; recent choices use two columns.
- The masthead wraps without hiding the visible Light/Dark label. Primary practice actions, touch alternatives, and safe-area spacing remain available.
- Layouts down to 320px avoid page-level horizontal scrolling. Only wide union grids scroll horizontally, within their own named region.
- Reduced motion removes the paper rotation and nonessential transitions. Forced-colors mode removes decorative backgrounds while keeping selection, focus, and state boundaries legible.

## Review outcome

The initial finish review requested a functional six-set switcher within the desktop first viewport, a preview that matched its configured fields, a visible mobile theme label, removal of heading kickers, and clean editor evidence. A further polish batch replaced the four detector-reported thick side accents with one-pixel complete borders.

A fresh verdict pass scored every requested UI correction **resolved** and returned **DISPOSITION: ship**. Final development evidence is in `.impeccable/review/`: `desktop.png`, `dark.png`, `mobile.png`, `editor.png`, `editor-full.png`, and `practice.png`. These screenshots are review artifacts, not shipping assets. No rasters ship in the application.

A follow-up trust-and-recovery pass made example-library replacement explicitly destructive, added single-rating Undo with keyboard and persistence support, kept folder selection and Practice together on mobile, clarified recursive counts and setup copy, and exposed the populated-field deletion constraint both visibly and programmatically. Desktop/mobile and light/dark rendered checks remained within the incumbent design world.

A production-hardening pass added a persistent browser-storage failure warning with retry, stricter saved-library and practice-session validation, RTL-aware user content, locale-aware library and practice counters, and flow-based preview chrome that cannot overlap long content. Extreme-content, storage-failure, 320px, light/dark, and 1,000-set checks passed. Additional review captures are `hardening-desktop.png`, `hardening-dark.png`, `hardening-mobile-extreme.png`, `hardening-practice-extreme.png`, and `hardening-storage-error.png`; these are review artifacts, not shipping assets.

Final verification: **73 Vitest tests passed**, the strict TypeScript/Vite production build passed, and **152 Playwright checks passed** with four intentional platform-specific skips. The Impeccable detector returned no findings.
