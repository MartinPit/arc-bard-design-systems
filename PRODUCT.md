# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual learners authoring and practising their own flashcards on desktop and mobile browsers. The repository also serves people evaluating the independent Arc and Bard design systems through their showcases and product prototypes.

## Product Purpose

Arc Flashcards makes it fast to author structured flashcards, organise sets without forcing them into a single location, and practise until every eligible card is known. The Arc and Bard showcases translate two membership cards into independent, reusable web design systems; product prototypes demonstrate those systems in working applications.

## Positioning

The flashcards prototype combines set-wide named field vocabularies with flexible per-card field subsets. Its practice loop carries unknown cards into successive batches until known, rather than presenting a single-pass quiz or a spaced-repetition scheduler.

## Operating Context

A learner creates sets in a keyboard-friendly grid, organises them into nested folders, and practises on a set or a recursively selected group of folders. Desktop keyboard commands and visible touch controls support the same workflows. The application and its showcases run in the existing React, TypeScript, and Vite codebase.

## Capabilities and Constraints

- Create, view, edit, and delete sets; automatic sequential names are available when no custom title is supplied.
- Sets may belong to zero, one, or several folders. Folders support nesting, creation, renaming, and deletion when empty; nesting cannot be changed after creation.
- Each set owns a named field vocabulary, while each card uses a flexible subset represented in a union-grid editor.
- Every saved card has at least two populated fields. Empty editing rows are discarded.
- Practice supports shuffled or deterministic order, disjoint front/back field selections, eligibility counts, and batches of at most ten cards.
- Known removes a card from the active session. Don’t know carries it forward until known. Early Known advances immediately; early Don’t know reveals before continuing.
- The library and one active session persist in browser-local storage; seeded examples can be cleared or reset.
- Only the current or final session summary is retained in the experience. Persistent history, statistics, accounts, backend sync, sharing, import/export, spaced repetition, and folder reparenting are excluded.
- Starting another practice session asks before replacing the suspended active session.

## Brand Commitments

Flashcards is a separate product prototype built with the approved Arc design system. Arc and Bard remain visually independent, and neither the Arc showcase nor Reading Room is to be restyled as a side effect of this work. User-authored content and application copy remain translatable; Arc branding is protected from translation.

## Evidence on Hand

The user-supplied three-page `FLASHCARDS.pdf` defines the initial workflows and keyboard interactions. The agreed domain language is in `GLOSSARY.md`. `src/arc/` and `src/arc/reading-room/` contain the approved Arc implementation and its prior product-prototype refinement patterns.

## Product Principles

- Make rapid authoring as direct as typing in a table.
- Preserve organisational flexibility without duplicating sets.
- Make repetition understandable and controllable, not algorithmically mysterious.
- Keep library work and active practice recoverable on the current device.
- Reuse Arc’s approved behavior while keeping each product prototype independent.

## Accessibility & Inclusion

Desktop shortcuts require equivalent visible, accessible touch controls. The complete application must remain usable on phone-sized screens, in light and dark themes, with reduced motion and forced-color support, long content, keyboard navigation, and assistive technology.
