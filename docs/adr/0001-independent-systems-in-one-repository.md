# Independent systems in one repository

**Status:** accepted

Arc, Bard, and the Portal will live in one GitHub repository and deploy through one GitHub Pages workflow, with separate entry points for `/arc/` and `/bard/`. A single repository minimizes deployment and maintenance overhead, while separate visual foundations, component APIs, and composition decisions preserve design independence; separate repositories or deployments were rejected because structural separation is not necessary to achieve that goal.

## Consequences

Shared tooling and a shared component inventory must not become a shared theme or force matching component APIs. Repository-wide dependencies are acceptable for build and interaction infrastructure, but tokens, styling, and visual composition remain owned by each system.
