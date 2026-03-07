import type { RoundResult } from '../types/player';
import type { QuestionType, ChallengingItem } from '../types/game';
import { getPlayers } from './playerStorage';

/** Maximum number of tricky categories to display. */
const MAX_TRICKY_CATEGORIES = 3;

/**
 * Analyze rounds (potentially from multiple games) to identify challenging question categories.
 *
 * Groups rounds by question type, aggregates mistake counts and response times.
 * When mistakes exist: returns only types with mistakes, sorted by mistakeCount desc, avgMs desc.
 * When all correct: returns all types sorted by avgMs desc (slowest = trickiest).
 *
 * @param allRounds Flattened array of RoundResult objects from one or more games.
 * @returns Challenging items sorted by ranking criteria. May be empty.
 */
export function identifyChallengingItems(allRounds: RoundResult[]): ChallengingItem[] {
  // Filter to records that have the new `type` field (skip legacy multiplication records)
  const validRounds = allRounds.filter((r) => r.type != null);
  if (validRounds.length === 0) return [];

  // Group by question type (map legacy ruleOfThree → complexExtrapolation)
  const typeMap = new Map<QuestionType, { mistakeCount: number; totalMs: number; occurrences: number }>();

  for (const round of validRounds) {
    const type: QuestionType = (round.type as string) === 'ruleOfThree' ? 'complexExtrapolation' : round.type;
    let stats = typeMap.get(type);
    if (!stats) {
      stats = { mistakeCount: 0, totalMs: 0, occurrences: 0 };
      typeMap.set(type, stats);
    }

    if (!round.isCorrect) {
      stats.mistakeCount++;
    }
    stats.totalMs += round.elapsedMs;
    stats.occurrences++;
  }

  // Build result
  const allItems: ChallengingItem[] = [];
  for (const [type, stats] of typeMap.entries()) {
    allItems.push({
      type,
      mistakeCount: stats.mistakeCount,
      avgMs: stats.totalMs / stats.occurrences,
    });
  }

  // Check if any type has mistakes
  const hasMistakes = allItems.some((p) => p.mistakeCount > 0);

  if (hasMistakes) {
    const mistakeItems = allItems.filter((p) => p.mistakeCount > 0);
    mistakeItems.sort((a, b) => b.mistakeCount - a.mistakeCount || b.avgMs - a.avgMs);
    return mistakeItems;
  }

  // Fallback: all correct — sort by avgMs desc
  allItems.sort((a, b) => b.avgMs - a.avgMs);
  return allItems;
}

/**
 * Extract the top challenging question-type labels.
 *
 * @param items Output of identifyChallengingItems().
 * @returns Array of up to 3 QuestionType values, ordered by difficulty.
 */
export function extractTrickyCategories(items: ChallengingItem[]): QuestionType[] {
  if (items.length === 0) return [];
  return items.slice(0, MAX_TRICKY_CATEGORIES).map((item) => item.type);
}

/** Maximum number of recent games to analyze for challenging items. */
const MAX_GAME_WINDOW = 10;

/**
 * Convenience function: load a player's most recent games with per-round data
 * and run challenge analysis across all of them.
 *
 * @param playerName Case-insensitive player name.
 * @returns Challenging items aggregated from up to 10 recent games, or empty array.
 */
export function getChallengingItemsForPlayer(playerName: string): ChallengingItem[] {
  const players = getPlayers();
  const lowerName = playerName.toLowerCase();
  const player = players.find((p) => p.name.toLowerCase() === lowerName);

  if (!player || !player.gameHistory || player.gameHistory.length === 0) {
    return [];
  }

  // Filter to records with round data, take last MAX_GAME_WINDOW
  const gamesWithRounds = player.gameHistory.filter(
    (record) => record.rounds && record.rounds.length > 0,
  );

  if (gamesWithRounds.length === 0) {
    return [];
  }

  const recentGames = gamesWithRounds.slice(-MAX_GAME_WINDOW);

  // Flatten all rounds from recent games
  const allRounds: RoundResult[] = recentGames.flatMap((record) => record.rounds!);

  return identifyChallengingItems(allRounds);
}
