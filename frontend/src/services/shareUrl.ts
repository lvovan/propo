/**
 * Share URL encoding/decoding for Competition results.
 * Encodes result data as URL hash parameters for HashRouter.
 */

export interface SharedResult {
  seed: string;
  playerName: string;
  score: number;
  totalTimeMs: number;
}

/**
 * Encode a SharedResult into a shareable URL.
 * Uses the current origin and hash-based routing.
 */
export function encodeShareUrl(result: SharedResult): string {
  const params = new URLSearchParams();
  params.set('seed', result.seed);
  params.set('player', result.playerName);
  params.set('score', String(result.score));
  params.set('time', String(result.totalTimeMs));
  return `${window.location.origin}${window.location.pathname}#/result?${params.toString()}`;
}

/**
 * Decode URL hash parameters into a SharedResult.
 * @param hash — The hash string (e.g., `#/result?seed=abc&player=Alice&score=45&time=29600`)
 * @returns SharedResult or null if required parameters are missing.
 */
export function decodeShareUrl(hash: string): SharedResult | null {
  const queryIndex = hash.indexOf('?');
  if (queryIndex < 0) return null;
  const params = new URLSearchParams(hash.slice(queryIndex));

  const seed = params.get('seed');
  const playerName = params.get('player');
  const scoreStr = params.get('score');
  const timeStr = params.get('time');

  if (!seed || !playerName || scoreStr == null || timeStr == null) return null;

  const score = parseInt(scoreStr, 10);
  const totalTimeMs = parseInt(timeStr, 10);

  if (isNaN(score) || isNaN(totalTimeMs)) return null;

  return { seed, playerName, score, totalTimeMs };
}
