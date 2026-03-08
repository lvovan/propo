# Contract: SharedResultPage Styles

**Feature**: 033-question-type-ui-fixes

## SharedResultPage.module.css (NEW)

Replaces all inline styles in `SharedResultPage.tsx` with CSS module classes. Follows the established `@media (prefers-color-scheme: dark)` pattern from `ScoreSummary.module.css`.

```css
.page {
  padding: 24px 16px;
  text-align: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #213547;
}

.card {
  max-width: 360px;
  margin: 24px auto;
  padding: 24px;
  border-radius: 12px;
  background: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playerName {
  margin: 8px 0;
  font-size: 1rem;
}

.score {
  margin: 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.seed {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #666;
}

.playButton {
  padding: 14px 28px;
  font-size: 1.1rem;
  font-weight: 600;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  min-height: 44px;
}

.playButton:hover {
  opacity: 0.9;
}

@media (prefers-color-scheme: dark) {
  .title {
    color: rgba(255, 255, 255, 0.87);
  }

  .card {
    background: #2a2a2a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .seed {
    color: #aaa;
  }
}
```

## SharedResultPage.tsx — Style Migration

```tsx
// BEFORE (inline styles)
<main style={{ padding: '24px 16px', textAlign: 'center' }}>
  <h1>{t('sharedResult.title')}</h1>
  <div style={{ maxWidth: 360, margin: '24px auto', ... background: '#f9f9f9' ... }}>
    <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>...</p>
  </div>
  <button style={{ ... background: '#4caf50', color: '#fff' ... }}>...</button>
</main>

// AFTER (CSS module classes)
<main className={styles.page}>
  <h1 className={styles.title}>{t('sharedResult.title')}</h1>
  <div className={styles.card}>
    <p className={styles.playerName}>...</p>
    <p className={styles.score}>...</p>
    <p className={styles.seed}>...</p>
  </div>
  <button className={styles.playButton} ...>...</button>
</main>
```
