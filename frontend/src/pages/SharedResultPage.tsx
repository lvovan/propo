import { useNavigate } from 'react-router-dom';
import { decodeShareUrl } from '../services/shareUrl';
import { formatTotalTime } from '../services/totalTime';
import { useTranslation } from '../i18n';
import Header from '../components/Header/Header';

export default function SharedResultPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const result = decodeShareUrl(window.location.hash);

  if (!result) {
    return (
      <div>
        <Header />
        <main style={{ padding: '24px 16px', textAlign: 'center' }}>
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
      <main style={{ padding: '24px 16px', textAlign: 'center' }}>
        <h1>{t('sharedResult.title')}</h1>
        <div style={{
          maxWidth: 360,
          margin: '24px auto',
          padding: '24px',
          borderRadius: 12,
          background: '#f9f9f9',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <p style={{ margin: '8px 0', fontSize: '1rem' }}>
            <strong>{t('sharedResult.player')}:</strong> {result.playerName}
          </p>
          <p style={{ margin: '8px 0', fontSize: '1.5rem', fontWeight: 700 }}>
            <span>{t('sharedResult.score')}:</span> {result.score}
          </p>
          <p style={{ margin: '8px 0', fontSize: '1.2rem' }}>
            <span>{t('sharedResult.time')}:</span> {formatTotalTime(result.totalTimeMs)}
          </p>
          <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
            <strong>{t('competition.seed')}:</strong> {result.seed}
          </p>
        </div>
        <button
          onClick={handlePlay}
          aria-label={t('sharedResult.playThisGame')}
          style={{
            padding: '14px 28px',
            fontSize: '1.1rem',
            fontWeight: 600,
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          {t('sharedResult.playThisGame')}
        </button>
      </main>
    </div>
  );
}
