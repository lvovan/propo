// Types for ScoreSummary component

import type { Round } from '../../../../types/game';
import type { GameMode, GameRecord } from '../../../../types/player';

export interface ScoreSummaryProps {
  /** The completed rounds from the game (Round[] from game.ts). */
  rounds: Round[];
  /** Total score earned in the game session. */
  score: number;
  /** Callback fired when the player clicks "Play Again". */
  onPlayAgain: () => void;
  /** Callback fired when the player clicks "Back to Menu". */
  onBackToMenu: () => void;
  /** Which mode the game was played in. Defaults to 'play'. */
  gameMode?: GameMode;
  /** Game history for sparkline display. */
  history?: GameRecord[];
  /** Seed used for competitive mode (displayed on results). */
  seed?: string;
  /** Player name for share URL (competitive mode). */
  playerName?: string;
}
