import { useState } from 'react';
import { useTranslation } from '../../../i18n';
import styles from './CompetitionSetup.module.css';

interface CompetitionSetupProps {
  initialSeed?: string;
  onStart: (seed: string) => void;
  onBack: () => void;
}

function generateRandomSeed(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default function CompetitionSetup({ initialSeed, onStart, onBack }: CompetitionSetupProps) {
  const { t } = useTranslation();
  const [seed, setSeed] = useState(initialSeed ?? '');

  const trimmedSeed = seed.trim();
  const isValid = trimmedSeed.length > 0;

  const handleStart = () => {
    if (isValid) {
      onStart(trimmedSeed);
    }
  };

  const handleGenerate = () => {
    setSeed(generateRandomSeed());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      onStart(trimmedSeed);
    }
  };

  return (
    <div className={styles.container}>
      <label htmlFor="competition-seed" className={styles.seedDisplay}>
        {t('competition.seedInputLabel')}
      </label>
      <input
        id="competition-seed"
        type="text"
        className={styles.seedInput}
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('competition.seedPlaceholder')}
        aria-label={t('competition.seedInputLabel')}
        maxLength={100}
        autoComplete="off"
      />
      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.generateButton}
          onClick={handleGenerate}
          aria-label={t('competition.generateSeed')}
        >
          {t('competition.generateSeed')}
        </button>
        <button
          type="button"
          className={styles.startButton}
          onClick={handleStart}
          disabled={!isValid}
          aria-label={t('competition.startGame')}
        >
          {t('competition.startGame')}
        </button>
      </div>
      <button
        type="button"
        className={styles.backButton}
        onClick={onBack}
        aria-label={t('competition.back')}
      >
        {t('competition.back')}
      </button>
    </div>
  );
}
