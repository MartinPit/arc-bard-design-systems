# Keep component implementations local to each showcase

**Status:** accepted

Arc and Bard will demonstrate the same 19-component inventory, but each showcase will own its component implementations, tokens, CSS Modules, and composition. A shared styled library was rejected because it would encourage shared markup and visual compromises merely for reuse; npm publication and product-specific component packages are outside the current scope.

## Consequences

Some structural duplication is deliberate. Only build tooling and unstyled interaction primitives are shared by default; extracting common component code later must demonstrate that it will not erode design independence.
