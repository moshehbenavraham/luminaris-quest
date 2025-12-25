# Known Issues

## Ignored Paths

<!-- Files/directories to skip or treat as advisory-only -->

- `node_modules/` - Third-party dependencies, do not modify

## Ignored Rules

<!-- Specific rule + path combinations that are intentional -->

- `@typescript-eslint/no-explicit-any` in `src/**/*.test.*` - Test mocks require flexible typing
- `react-refresh/only-export-components` in `src/test/utils.tsx` - Test utilities export helper functions

## Skipped Tests

<!-- Tests that are known-failing or intentionally skipped -->

- `src/test/integration/energy-regeneration.test.ts::*` - All 10 tests skipped pending energy system stabilization

## Notes

<!-- Context for future audits -->

- CSS animations use custom properties (e.g., `--progress-value`) - test these directly, not computed `width`
- Browser APIs (ResizeObserver, IntersectionObserver, HTMLMediaElement) are mocked in `config/vitest.setup.ts`
- React 19 requires stricter act() wrapping - use `advanceTimersAndAct()` from `@/test/utils`
- Radix UI components need 2000ms timeout for tooltip/dialog animations in tests
- ControlPanel.tsx was recreated during 2025-12-25 audit (original file was empty)
