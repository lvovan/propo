# Research: Story Challenge Expansion

**Feature**: 029-story-challenge  
**Date**: 2026-03-07

## R1: Scoring Normalization — Percentage-Based Tiers

**Decision**: Replace fixed-millisecond scoring tiers with percentage-of-remaining-time tiers. The same thresholds apply regardless of total timer duration.

**Rationale**: The spec requires that answering at X% remaining time awards the same points for both 20s and 50s timers. Percentage-based tiers achieve this naturally.

**New Scoring Formula**:
```
remainingPercent = (timerDuration - elapsedMs) / timerDuration
if !isCorrect → -2
if remainingPercent >= 0.60 → +5
if remainingPercent >= 0.40 → +3
if remainingPercent >= 0.20 → +2
if remainingPercent >  0.00 → +1
else → 0
```

**Example Mappings**:
| Tier | 20s Timer (ms boundary) | 50s Timer (ms boundary) |
|------|------------------------|------------------------|
| +5   | ≤ 8,000ms (≥60%)      | ≤ 20,000ms (≥60%)     |
| +3   | ≤ 12,000ms (≥40%)     | ≤ 30,000ms (≥40%)     |
| +2   | ≤ 16,000ms (≥20%)     | ≤ 40,000ms (≥20%)     |
| +1   | < 20,000ms (>0%)      | < 50,000ms (>0%)      |
| 0    | ≥ 20,000ms (0%)       | ≥ 50,000ms (0%)       |

**Alternatives Considered**:
- Continuous linear formula (`floor(5 × remainingPercent)`): Rejected — would award 2 for 50% remaining instead of the spec-mandated 3. Discrete tiers preferred for predictability.
- Separate fixed-ms tiers per problem type: Rejected — more code, harder to maintain, same behavior achievable with percentage math.

**Impact on `calculateScore()`**: The function signature changes to accept `timerDurationMs` in addition to `isCorrect` and `elapsedMs`. The fixed `SCORING_TIERS` array is removed and replaced with percentage thresholds.

---

## R2: QuestionType Union Expansion

**Decision**: Expand `QuestionType` from 4 values to 6. Remove `ruleOfThree` and add `multiItemRatio`, `percentageOfWhole`, `complexExtrapolation`.

**New Type**:
```typescript
type QuestionType = 'percentage' | 'ratio' | 'fraction' | 'multiItemRatio' | 'percentageOfWhole' | 'complexExtrapolation';
```

**Rationale**: 
- `ruleOfThree` is absorbed into `complexExtrapolation` (same concept: if A→B, then C→?).
- New sub-types need distinct keys for challenge analysis (Improve mode analyzes per sub-type).
- The 3 numeric types (percentage, ratio, fraction) and 3 story types (multiItemRatio, percentageOfWhole, complexExtrapolation) map cleanly to the 5/5 split categories.

**Category Helper**:
```typescript
const PURE_NUMERIC_TYPES: QuestionType[] = ['percentage', 'ratio', 'fraction'];
const STORY_CHALLENGE_TYPES: QuestionType[] = ['multiItemRatio', 'percentageOfWhole', 'complexExtrapolation'];
function isStoryChallenge(type: QuestionType): boolean { ... }
```

**Migration**: Existing `ruleOfThree` round results in player history will be treated as `complexExtrapolation` for backward compatibility in challenge analysis.

---

## R3: Story Challenge Problem Pools

**Decision**: Build 3 parameterized problem pools, each generating whole-number answers. Templates are i18n keys with numeric placeholders.

### Multi-Item Ratio Pool
- Pattern: "A container has X items of type A (V₁ units each) and Y items of type B (V₂ units each). What is the total [unit] of just the [type A/B] items?"
- Answer: `X × V₁` or `Y × V₂` (depending on which subset is asked)
- "Noise": the other item type's count and value
- Constraints: X ∈ [2,8], V₁ ∈ [2,50], Y ∈ [2,8], V₂ ∈ [2,50], answer ≤ 999

### Percentage of the Whole Pool
- Pattern: "A group has X of type A, Y of type B, and Z of type C. What percentage of the [total] are the [type]?"
- Answer: `(target / total) × 100` — must be a whole number
- "Noise": at least one extra item type
- Constraints: total ∈ [10,50], answer ∈ [1,100], answer is integer

### Complex Extrapolation Pool
- Pattern: "If A [units] need B [resources], how many [resources] do C [units] need?"
- Answer: `(B / A) × C` — must be a whole number (rate = B/A is integer or C is a multiple of A)
- "Noise": extra context sentence (weather description, location detail, etc.)
- Constraints: A ∈ [2,8], rate ∈ [2,10], C ∈ [2,12] (C ≠ A), answer ≤ 999

### Template Count Target
- At least 6 themed templates per sub-type (18 total i18n keys)
- Themes: school supplies, animals, space, cooking, sports, nature

---

## R4: Per-Round Timer Duration

**Decision**: Add `timerDurationMs` to the `Formula` interface. The formula generator sets it based on question type. The timer hook, countdown bar, and scoring function all read it from the current round's formula.

**Rationale**: Carrying the timer duration on the formula is the simplest way to thread it through the system without adding a parallel data path. The value is set once at generation time and never changes.

**Values**:
- Pure Numeric: `timerDurationMs = 20000`
- Story Challenge: `timerDurationMs = 50000`

**Impact Chain**: `formulaGenerator` → `Formula.timerDurationMs` → `useRoundTimer(durationMs)` → `calculateScore(isCorrect, elapsedMs, timerDurationMs)` → `GameStatus/CountdownBar`

---

## R5: Dark Mode Story Text

**Decision**: Use CSS `prefers-color-scheme: dark` media query to apply high-contrast text colors to the `.problemText` class in `FormulaDisplay.module.css`.

**Colors**:
- Light mode (current): `color: #333` on white background
- Dark mode: `color: #E0F0E0` (soft green-white, contrast ratio ~12:1 on #1a1a1a) on `background: rgba(0, 0, 0, 0.3)` with `border-radius: 12px` and `padding: 16px`

**Rationale**: Using a media query is the simplest approach — no JavaScript, no state management. The CSS module already scopes the styles to the story text container.

**Alternatives Considered**:
- JavaScript `matchMedia` listener with React state: Rejected — adds complexity for no benefit. CSS handles theme reactivity natively.
- `#FFFFFF` text: Rejected — too harsh. Slightly tinted white (#E0F0E0) reduces eye strain during timed reading.

---

## R6: Backward Compatibility

**Decision**: Legacy `ruleOfThree` records in player history are mapped to `complexExtrapolation` during challenge analysis. No data migration needed — the mapping happens at read time in `identifyChallengingItems()`.

**Rationale**: Avoids modifying stored data. The transform is trivial: `if (round.type === 'ruleOfThree') type = 'complexExtrapolation'`.

**Impact**: Only `challengeAnalyzer.ts` needs the mapping. Everything else produces new-format data going forward.
