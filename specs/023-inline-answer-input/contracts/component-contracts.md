# Contracts: Inline Answer Input

**Feature Branch**: `023-inline-answer-input`
**Date**: 2026-02-17

## Summary

This feature has **no API contracts**. The application is a static SPA with no backend.
All changes are to component interfaces (React props) documented in [research.md](../research.md#5-component-interface-changes).

## Component Contracts

### useAnswerInput Hook

```typescript
interface UseAnswerInputOptions {
  maxDigits?: number;                    // default: 3
  onSubmit: (answer: number) => void;
}

interface UseAnswerInputReturn {
  typedDigits: string;
  handleDigit: (digit: string) => void;
  handleBackspace: () => void;
  handleSubmit: () => void;
  reset: () => void;
}
```

### FormulaDisplay Props

```typescript
interface FormulaDisplayProps {
  formula: Formula;
  playerAnswer?: number;
  typedDigits?: string;      // NEW — live typed digits
  isInputPhase?: boolean;    // NEW — controls pulsing border
}
```

### AnswerInput / TouchNumpad Props

```typescript
interface AnswerInputProps {
  typedDigits: string;               // NEW — replaces internal state
  onDigit: (digit: string) => void;  // NEW — replaces internal handler
  onBackspace: () => void;           // NEW — replaces internal handler
  onSubmit: () => void;              // CHANGED — no longer passes number
  acceptingInput: boolean;
}
```
