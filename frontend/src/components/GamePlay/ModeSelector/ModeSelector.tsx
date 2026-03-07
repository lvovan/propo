import type { QuestionType } from '../../../types/game';
import { useTranslation } from '../../../i18n';
import styles from './ModeSelector.module.css';

interface ModeSelectorProps {
  onStartPlay: () => void;
  onStartImprove: () => void;
  onStartCompetition: () => void;
  trickyCategories: QuestionType[];
  showImprove: boolean;
  showEncouragement: boolean;
}

/** Map question types to their i18n label keys. */
const CATEGORY_LABEL_KEYS: Record<QuestionType, string> = {
  percentage: 'questionType.percentage',
  ratio: 'questionType.ratio',
  fraction: 'questionType.fraction',
  multiItemRatio: 'questionType.multiItemRatio',
  percentageOfWhole: 'questionType.percentageOfWhole',
  complexExtrapolation: 'questionType.complexExtrapolation',
};

/**
 * Game mode selection: Play (always) and Improve (conditional).
 * Play shows "Go for a high score!" descriptor.
 * Improve shows tricky question categories from recent game analysis.
 * Encouraging message shown when player has no challenging categories.
 */
export default function ModeSelector({
  onStartPlay,
  onStartImprove,
  onStartCompetition,
  trickyCategories,
  showImprove,
  showEncouragement,
}: ModeSelectorProps) {
  const { t } = useTranslation();
  const categoriesText = trickyCategories
    .map((cat) => t(CATEGORY_LABEL_KEYS[cat] as Parameters<typeof t>[0]))
    .join(', ');

  return (
    <div className={styles.container} role="group" aria-label={t('mode.groupLabel')}>
      <button
        className={styles.playButton}
        onClick={onStartPlay}
        aria-label={t('mode.playAriaLabel')}
      >
        <span className={styles.buttonLabel}>{t('mode.play')}</span>
        <span className={styles.descriptor}>{t('mode.playDescription')}</span>
      </button>

      {showImprove && trickyCategories.length > 0 && (
        <button
          className={styles.improveButton}
          onClick={onStartImprove}
          aria-label={t('mode.improveAriaLabel', { categories: categoriesText })}
        >
          <span className={styles.buttonLabel}>{t('mode.improve')}</span>
          <span className={styles.descriptor}>
            {t('mode.improveDescription', { categories: categoriesText })}
          </span>
        </button>
      )}

      {showEncouragement && !showImprove && (
        <p className={styles.encouragement}>
          {t('mode.encouragement')}
        </p>
      )}

      <button
        className={styles.competitionButton}
        onClick={onStartCompetition}
        aria-label={t('mode.competitionAriaLabel')}
      >
        <span className={styles.buttonLabel}>{t('mode.competition')}</span>
        <span className={styles.descriptor}>{t('mode.competitionDesc')}</span>
      </button>
    </div>
  );
}
