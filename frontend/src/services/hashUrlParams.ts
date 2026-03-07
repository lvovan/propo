/**
 * Parse query parameters from HashRouter URLs.
 * HashRouter puts everything after # in the hash, so standard
 * URLSearchParams on window.location.search doesn't work.
 */

/**
 * Parse query parameters from `window.location.hash`.
 * For a hash like `#/play?seed=abc123`, extracts `seed=abc123`.
 */
export function getHashSearchParams(): URLSearchParams {
  const hash = window.location.hash;
  const queryIndex = hash.indexOf('?');
  if (queryIndex < 0) return new URLSearchParams();
  return new URLSearchParams(hash.slice(queryIndex));
}

/**
 * Get a specific parameter from the hash URL.
 * @returns The decoded parameter value, or null if absent.
 */
export function getHashParam(key: string): string | null {
  return getHashSearchParams().get(key);
}
