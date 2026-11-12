# Arc & Bard Design Systems

Two independent React design systems translated from the visual language of two membership cards:

- **Arc** — editorial, tactile, warm ivory and aubergine with print-inspired details and a marigold–magenta leaf gradient.
- **Bard** — ethereal, intricate, mint/aqua/lilac with original guilloché artwork and restrained, fluid motion.

The project contains exactly three website entries:

| Entry | Development path | Purpose |
| --- | --- | --- |
| Portal | `/arc-bard-design-systems/` | Quiet index linking to the two systems |
| Arc | `/arc-bard-design-systems/arc/` | Complete Arc design-system showcase |
| Bard | `/arc-bard-design-systems/bard/` | Complete Bard design-system showcase |

There are no example product applications, backend services, remote assets, or shared styled components. Arc and Bard were implemented independently by separate agents with disjoint file ownership. They demonstrate the same 19-component inventory without sharing component implementations, tokens, CSS Modules, or visual composition.

## Stack

- React 19 and TypeScript
- Vite multi-page build
- Base UI for unstyled interaction primitives where useful
- Motion for selected choreography
- Plain CSS, CSS Modules, and system-local custom-property tokens
- Lucide functional icons, original inline SVG signatures, and self-hosted Fontsource fonts

## Develop

Requires Node.js 26 or later.

```sh
npm ci
npm run dev
```

Vite prints the local server address. Open `/arc-bard-design-systems/` from that address. Root-relative links and production assets use the same base path locally and on GitHub Pages.

## Verify

```sh
npm test          # Component and interaction tests
npm run build     # Strict TypeScript check and production multi-page build
npm run test:e2e # Desktop/mobile Chromium, keyboard, overflow, and WCAG AA checks
npm run verify    # All of the above, in order
```

For local Playwright runs on a machine without a cached Chromium browser, install it inside the project directory:

```sh
# PowerShell
$env:PLAYWRIGHT_BROWSERS_PATH = "$PWD\.playwright"
npx playwright install chromium
npm run test:e2e
```

Playwright runs against the production build using `vite preview`. Build before running browser tests. Test artifacts and local browser binaries are ignored by Git.

## Source boundaries

```text
arc/index.html          Arc entry only
src/arc/                Arc components, tokens, artwork, styles, tests
bard/index.html         Bard entry only
src/bard/               Bard components, tokens, artwork, styles, tests
index.html              Portal entry
src/portal/             Portal-only implementation and tests
src/test/               Shared test setup; no visual code
e2e/                    Cross-site browser verification
docs/adr/               Architectural decisions
GLOSSARY.md             Canonical project vocabulary
```

Do not add cross-system imports or extract a shared styled component library. Shared infrastructure is acceptable; visual convergence is not. See the ADRs for the rationale.

Each system documents its foundations, motion, component behavior and variants, composition guidance, accessibility, and expandable React examples. The inventory is Button, Icon Button, Text Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Tabs, Dialog, Popover, Tooltip, Toast, Badge, Avatar, Card, Table, and Pagination.

## Deploy

`.github/workflows/deploy.yml` runs component tests, a production build, Chromium browser tests, and then publishes `dist/` using GitHub Pages Actions. Pushing to `main` or manually starting the workflow triggers it.

The repository is configured for:

- Repository: `MartinPit/arc-bard-design-systems`
- Site: `https://martinpit.github.io/arc-bard-design-systems/`
- Pages source: **GitHub Actions**

If the repository is renamed or moved, update `base` in `vite.config.ts` and `baseURL`/preview URL in `playwright.config.ts` before deployment.

## Project documents

- [Glossary](./GLOSSARY.md)
- [ADR 0001: Independent systems in one repository](./docs/adr/0001-independent-systems-in-one-repository.md)
- [ADR 0002: Local component implementations](./docs/adr/0002-local-component-implementations.md)
- [Third-party notices](./THIRD_PARTY_NOTICES.md)
