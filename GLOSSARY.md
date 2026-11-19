# Arc and Bard Design Systems

The project translates two membership cards into independent web design systems. This glossary defines the project’s products, domain language, and the boundaries between them.

## Language

**Arc**:
The design system derived from the warm ivory, purple-printed, gradient-leaf membership card. Its character is editorial, tactile, and reminiscent of printed ephemera.
_Avoid_: Gifted Magician, left system

**Bard**:
The design system derived from the iridescent mint-and-lilac guilloché membership card. Its character is ethereal, intricate, and ceremonial.
_Avoid_: right system

**Portal**:
The entry page that introduces Arc and Bard and links to their respective showcases. It is a guide, not a third design system.
_Avoid_: main system, shared theme

**Showcase**:
A single page presenting one design system’s foundations, reusable components, composition patterns, and usage guidance. It is not an example product or prototype application.
_Avoid_: demo app, product prototype

**Reading Room**:
A separate product prototype built with Arc's approved components and visual language. It is a working personal reading application, not another design-system showcase or a source of shared styled components.
_Avoid_: second Arc showcase, Bard app

**Flashcards**:
A separate product prototype built with Arc for authoring flashcard sets, organising them in nested folders, and practising their contents. It is not part of Reading Room or the Arc showcase.
_Avoid_: Reading Room feature, second Arc showcase

**Set**:
A named collection of flashcards created together. A set may belong to several folders at once or to none.
_Avoid_: deck, stack

**Folder**:
A nested organisational category for sets. Folder membership organises a set without owning it or limiting it to a single location.
_Avoid_: collection, category

**Field**:
A named kind of content from a set’s shared vocabulary. Each flashcard may use a different subset of its set’s fields.
_Avoid_: column, side

**Practice session**:
A run through eligible flashcards in batches of at most ten. Known cards leave the session; unknown cards recur in later batches until known.
_Avoid_: lesson, spaced repetition

**Design independence**:
Arc and Bard each follow their own visual language; neither adopts a visual decision merely to match the other. A shared component inventory does not imply shared styling.
_Avoid_: visual alignment, shared theme
