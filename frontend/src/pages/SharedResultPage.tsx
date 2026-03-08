
import { decodeShareUrl } from '../services/shareUrl';
import { useTranslation } from '../i18n';
import Header from '../components/Header/Header';
import styles from './SharedResultPage.module.css';

export default function SharedResultPage() {
  const { t } = useTranslation();
  const result = decodeShareUrl(window.location.hash);

  if (!result) {
    return (
      <div>
        <Header />
        <main className={styles.page}>
          <p role="alert">{t('sharedResult.error')}</p>
        </main>
      </div>
    );
  }

  const handlePlay = () => {
    window.location.hash = `/play?seed=${encodeURIComponent(result.seed)}`;
  };

  return (
    <div>
      <Header />
      <main className={styles.page}>
        <h1 className={styles.title}>{t('sharedResult.title')}</h1>
        <div className={styles.card}>
          <p className={styles.playerName}>
            <strong>{t('sharedResult.player')}:</strong> {result.playerName}
          </p>
          <p className={styles.score}>
            <span>{t('sharedResult.score')}:</span> {result.score}
          </p>
          <p className={styles.seed}>
            <strong>{t('competition.seed')}:</strong> {result.seed}
          </p>
        </div>
        <button
          onClick={handlePlay}
          aria-label={t('sharedResult.playThisGame')}
          className={styles.playButton}
        >
          {t('sharedResult.playThisGame')}
        </button>
      </main>
    </div>
  );
}
