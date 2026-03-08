# Research: Question Types & UI Fixes

**Feature**: 033-question-type-ui-fixes  
**Date**: 2026-03-08

## Research Task 1: Ratio Removal Strategy

### Decision: Remove `ratio` from the type system; map legacy records at the display and analysis layers

### Rationale

The `ratio` type (`A : B = C : D`) and `fraction` type (`A/B = C/D`) share the same underlying `Quad` pool structure and numeric generation logic — only the display format differs. Removing `ratio` eliminates a redundant type without losing any mathematical content.

**Removal touchpoints:**

| File | Change |
|------|--------|
| `types/game.ts` | Remove `'ratio'` from `QuestionType` union and `PURE_NUMERIC_TYPES` array |
| `formulaGenerator.ts` | Remove `buildRatioPool()`, `generateRatioFormula()`, `ratio` case in dispatcher, `ratio` entries in `buildAllPools()` and `generateFormulas()` distribution |
| `challengeAnalyzer.ts` | Add `'ratio'` → `'fraction'` mapping alongside existing `'ruleOfThree'` → `'complexExtrapolation'` |
| `FormulaDisplay.tsx` | Map legacy `ratio` type to use `fraction` rendering (`A/B = C/D`) |
| `ScoreSummary.tsx` | Map legacy `ratio` case to `fraction` format string |
| `ModeSelector.tsx` | Remove `ratio` entry from `CATEGORY_LABEL_KEYS` |
| 6 locale files | Remove `'questionType.ratio'` key |

**Numeric distribution change:** Current is `['percentage', 'percentage', 'ratio', 'ratio', 'fraction']` (2+2+1 with 5th slot randomized). New distribution: `['percentage', 'percentage', 'fraction', 'fraction']` with 5th slot `pickRandom(['percentage', 'fraction'])`. This is a 1-line edit.

**Backward compatibility:** Records with `type: 'ratio'` exist in `localStorage`. Since `QuestionType` is a TS union (compile-time only), stored data is untyped JSON. The display layer and analyzer must handle the legacy string at runtime via `as string` comparison, matching the existing `ruleOfThree` pattern.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Keep `ratio` in the type system but stop generating it | Type bloat persists; `CATEGORY_LABEL_KEYS` and locale files retain dead code |
| Migrate stored records to change `'ratio'` to `'fraction'` | Destructive localStorage migration is brittle; mapping at read time is safer and already has a precedent (`ruleOfThree`) |

---

## Research Task 2: percentageOfWhole Multi-Target Pool Feasibility

### Decision: Keep the existing pool unchanged; select target variant at generation time with fallback to "first item"

### Rationale

The current pool has 464 triples where `(x / total) * 100 ∈ {10, 20, 25, 50, 75}`.

| Target option | Pool fraction | Coverage |
|---|---|---|
| First item (x) | 464/464 (100%) | Always valid — baseline |
| Second item (y) | 59/464 (12.7%) | Already implemented as conditional swap |
| Combined (x + y) | 38/464 (8.2%) | New — requires `(x+y)/total * 100 ∈ {10,20,25,50,75}` |
| All three valid simultaneously | 26/464 (5.6%) | Too restrictive for a filtered pool |

Building a separate sub-pool for combined-only triples (38 entries × 21 templates = 798 unique questions) provides sufficient variety. However, the **simplest and most consistent approach** is to follow the existing swap pattern: attempt the randomly chosen target, fall back if invalid.

**Algorithm:**

```
1. Pick a random triple from the full pool.
2. Roll a 3-way random choice: target ∈ {'first', 'second', 'combined'}.
3. Compute the candidate percentage for the chosen target.
4. If it's a friendly percentage → use it.
5. If not → try the other two targets in a deterministic order.
6. At least "first item" is always valid (pool invariant).
```

This keeps the pool builder untouched, uses the seeded `randomFn` for determinism, and naturally weights toward "first item" (which always works) without explicit probability tuning.

**Template adaptation for combined target:** The combined target requires alternate question phrasing (e.g., "What percentage are the kittens or puppies?"). Since existing templates hardcode the target noun (e.g., "the kittens"), combined-target rounds need a template variant suffix. Each template gets a `.combined` sibling key that phrases the question about both items. Templates use `{a}` for item-1 count, `{b}` for item-2 count, `{c}` for total — the combined display shows `{a}` (item-1 name) and `{b}` (item-2 name) together with "or" conjunction.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Filter pool to only triples where all 3 targets are valid | Only 26 triples with 4 percentage combos — too restrictive; eliminates `x%=20` and `x%=75` entirely |
| Rebuild pool with combined-specific filtering | Over-engineering; the generation-time fallback already handles this with zero pool changes |
| Equal probability with rejection sampling | Would discard many generated triples; the fallback approach is O(1) per generation |

---

## Research Task 3: SharedResultPage Dark Mode Approach

### Decision: Replace all inline styles with a CSS module (`SharedResultPage.module.css`) using `@media (prefers-color-scheme: dark)` overrides

### Rationale

The current `SharedResultPage.tsx` uses 7 inline style objects with hardcoded colors:
- Card background: `#f9f9f9` (near-white — invisible in dark mode)
- Seed text: `color: '#666'` (low contrast on dark backgrounds)
- Button: `background: '#4caf50'`, `color: '#fff'` (works in both modes)

The rest of the app uses CSS modules with `@media (prefers-color-scheme: dark)` blocks — no CSS variables, no theme provider. The fix must follow this established pattern.

**Color mapping (from ScoreSummary / RecentHighScores patterns):**

| Element | Light | Dark |
|---|---|---|
| Card background | `#f9f9f9` | `#2a2a2a` |
| Primary text | `#213547` (inherit from `:root`) | `rgba(255,255,255,0.87)` (inherit from `:root`) |
| Secondary text (seed) | `#666` | `#aaa` |
| Card shadow | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.3)` |
| Button background | `#4caf50` | `#4caf50` (unchanged — already high contrast) |
| Button text | `#fff` | `#fff` (unchanged) |

The `<main>` padding and text alignment are layout concerns (not theme-dependent) and can remain as inline styles or CSS module classes — preference is CSS module for consistency.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Add CSS variables to `:root` and use them in inline styles | No precedent in the codebase; would require refactoring all existing components to adopt variables |
| Use `@media` in a `<style>` tag within the component | Non-standard for this project; CSS modules are the established pattern |
| Fix only the broken colors and keep other inline styles | Partial fix; the entire component would still have mixed styling approaches |

---

## Research Task 4: Home Page Heading Removal & Accessibility

### Decision: Remove the `<h1>` and `<p>` elements from MainPage; rely on the `<header>` landmark with the app title "Propo!" for screen reader navigation

### Rationale

The heading "Ready to play?" (`<h1 className={styles.readyHeading}>`) and subtitle (`<p className={styles.instructions}>`) are rendered in the `status === 'not-started'` block of `MainPage.tsx`. Removing them is a 2-line JSX deletion.

**Accessibility concern:** The `<h1>` was the page's primary heading. Removing it means no `<h1>` on the home screen. However:

1. The `Header` component renders `<header>` with the app title "Propo!" as a link. This is a WCAG landmark.
2. Screen readers can navigate by landmark (`<header>`, `<main>`) and do not strictly require an `<h1>` inside `<main>` for usability.
3. Adding a visually-hidden `<h1>` inside `<main>` (e.g., `<h1 className="sr-only">Propo!</h1>`) would satisfy heading-level navigation without consuming visual space. This is the recommended approach.

**i18n cleanup:** The `game.readyToPlay` and `game.instructions` keys can be removed from all 6 locale files (en, de, es, fr, pt, ja).

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Hide heading with CSS on mobile only (`display: none` at `max-width: 480px`) | Inconsistent experience across breakpoints; accessibility tools would still announce it on mobile |
| Reduce heading font size instead of removing | Doesn't free enough space; still consumes a line |
| Keep the heading but move it below the buttons | Contradicts the goal of prioritizing mode-selection |

---

## Research Task 5: Template Variant Strategy for Combined percentageOfWhole Target

### Decision: Add `.combined`-suffixed i18n keys for each `percentageOfWhole` template; pass a `targetVariant` flag to the rendering layer

### Rationale

Current templates (e.g., `story.percentageOfWhole.petshop`) hardcode the target in the question:
> "A pet shop has {a} kittens, {b} puppies, and some hamsters — {c} animals in total. What percentage of all the animals are the kittens?"

For the combined target, the question must ask about both items:
> "A pet shop has {a} kittens, {b} puppies, and some hamsters — {c} animals in total. What percentage of all the animals are the kittens or puppies?"

**Approach:** For each existing template key, add a `.combined` variant:
- `story.percentageOfWhole.petshop` → asks about first item (or second item when swapped)
- `story.percentageOfWhole.petshop.combined` → asks about first AND second items

The generator selects the appropriate key suffix based on the target variant. The Formula's `wordProblemKey` field already carries the full i18n key, so the rendering layer requires zero changes — it simply uses whatever key the generator set.

**Template count:** 21 existing templates × 1 combined variant = 21 new i18n keys per locale (6 locales = 126 new keys total). Each combined variant only changes the final question clause.

### Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Parameterize the target noun in the template with a `{target}` placeholder | Grammatically fragile across languages — different languages have different article/preposition rules for combined nouns |
| Create entirely separate template lists for combined questions | Unnecessary duplication — the story context (pet shop, classroom, etc.) is identical; only the question differs |
| Use a runtime string replacement to swap the last phrase | Brittle — assumes consistent template ending structure across all templates and languages |
